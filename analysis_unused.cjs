/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === '.next') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(ts|tsx)$/.test(item.name)) {
      results.push(path.relative(root, fullPath).replace(/\\/g, '/'));
    }
  }
  return results;
}
const files = walk(root);
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const fileImports = {};
const fileExports = {};
const externalPackages = new Set();
const localFileRefs = {};
const localSymbolImports = {}; // target file -> set of imported symbols
const routeFiles = files.filter(f => f.startsWith('app/') && (f.endsWith('layout.tsx') || f.endsWith('page.tsx') || f.endsWith('route.ts') || f.endsWith('middleware.ts') || f.endsWith('error.tsx') || f.endsWith('loading.tsx') || f.endsWith('providers.tsx')));

const importStmtRegex = /import\s+(.+?)\s+from\s+['\"](.+?)['\"];?/g;
const importOnlyRegex = /import\s+['\"](.+?)['\"];?/g;
const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|type|interface|enum|let|var)?\s*([A-Za-z0-9_$]+)/g;
const defaultExportRegex = /export\s+default\s+(?:function\s+([A-Za-z0-9_$]+)|class\s+([A-Za-z0-9_$]+)|([A-Za-z0-9_$]+))/g;

function extFile(p) {
  const candidates = [p, p + '.ts', p + '.tsx', p + '/index.ts', p + '/index.tsx'];
  return candidates.find(c => {
    const full = path.isAbsolute(c) ? c : path.join(root, c);
    return fs.existsSync(full) && fs.statSync(full).isFile();
  });
}

files.forEach(f => {
  const text = fs.readFileSync(path.join(root,f),'utf8');
  fileImports[f] = [];
  fileExports[f] = new Set();
  localFileRefs[f] = 0;
  localSymbolImports[f] = new Set();

  let m;
  importStmtRegex.lastIndex = 0;
  while ((m = importStmtRegex.exec(text))) {
    const spec = m[1].trim();
    const source = m[2];
    fileImports[f].push({source, spec});
    if (!source.startsWith('.') && !source.startsWith('..') && !source.startsWith('@/')) {
      const pkgName = source.split('/')[0];
      externalPackages.add(pkgName);
    } else {
      let impPath;
      if (source.startsWith('@/')) impPath = path.join(root, source.slice(2));
      else impPath = path.join(path.dirname(f), source);
      const resolved = extFile(impPath);
      if (resolved) {
        const rel = path.relative(root, resolved).replace(/\\/g,'/');
        localFileRefs[rel] += 1;
        const symbols = [];
        if (spec.startsWith('{') && spec.endsWith('}')) {
          spec.slice(1,-1).split(',').map(x => x.trim()).forEach(x => {
            const [name] = x.split(' as ').map(y=>y.trim()); if (name) symbols.push(name);
          });
        } else if (spec.startsWith('* as ')) {
          symbols.push('*');
        } else {
          const name = spec.split(' ')[0].trim(); if (name) symbols.push(name);
        }
        if (!localSymbolImports[rel]) localSymbolImports[rel] = new Set();
        symbols.forEach(sym => localSymbolImports[rel].add(sym));
      }
    }
  }
  importOnlyRegex.lastIndex = 0;
  while ((m = importOnlyRegex.exec(text))) {
    const source = m[1];
    if (!source.startsWith('.') && !source.startsWith('..') && !source.startsWith('@/')) {
      externalPackages.add(source.split('/')[0]);
    }
  }

  exportRegex.lastIndex = 0;
  while ((m = exportRegex.exec(text))) {
    if (m[1]) fileExports[f].add(m[1]);
  }
  defaultExportRegex.lastIndex = 0;
  while ((m = defaultExportRegex.exec(text))) {
    const name = m[1] || m[2] || m[3];
    if (name) fileExports[f].add('default:' + name);
  }
});

const usedFiles = new Set(routeFiles.concat(['next.config.ts','prisma.config.ts']));
const queue = [...usedFiles];
while (queue.length) {
  const cur = queue.shift();
  if (!fileImports[cur]) continue;
  fileImports[cur].forEach(imp => {
    if (imp.source.startsWith('.') || imp.source.startsWith('@/')) {
      let impPath;
      if (imp.source.startsWith('@/')) impPath = path.join(root, imp.source.slice(2));
      else impPath = path.join(path.dirname(cur), imp.source);
      const resolved = extFile(impPath);
      if (resolved) {
        const rel = path.relative(root, resolved).replace(/\\/g,'/');
        if (!usedFiles.has(rel)) {
          usedFiles.add(rel);
          queue.push(rel);
        }
      }
    }
  });
}

const unreferenced = files.filter(f => !usedFiles.has(f));
const packageNames = Object.keys(deps);
const unusedDeps = packageNames.filter(name => !externalPackages.has(name));

const exportUsage = {};
Object.entries(fileExports).forEach(([file, exports]) => {
  exports.forEach(name => {
    let used = false;
    if (name.startsWith('default:')) {
      const basename = name.slice(8);
      // Check for default imports from this file
      const relPath = './' + file.replace(/\.tsx?$/, '');
      const relPath2 = file.replace(/\.tsx?$/, '');
      files.forEach(other => {
        fileImports[other].forEach(imp => {
          if (imp.source.endsWith(relPath) || imp.source.endsWith(relPath2) || imp.source.endsWith(path.basename(relPath)) || imp.source.endsWith(path.basename(relPath2))) {
            const spec = imp.spec.trim();
            if (spec && !spec.startsWith('{') && !spec.startsWith('*')) used = true;
          }
        });
      });
    } else {
      files.forEach(other => {
        fileImports[other].forEach(imp => {
          if (imp.source.startsWith('.') || imp.source.startsWith('@/')) {
            let impPath;
            if (imp.source.startsWith('@/')) impPath = path.join(root, imp.source.slice(2));
            else impPath = path.join(path.dirname(other), imp.source);
            const resolved = extFile(impPath);
            if (resolved && path.relative(root, resolved).replace(/\\/g,'/') === file) {
              const spec = imp.spec.trim();
              if (spec.startsWith('{')) {
                const names = spec.slice(1,-1).split(',').map(x=>x.trim().split(' as ')[0]);
                if (names.includes(name)) used = true;
              } else if (spec.startsWith('* as ')) {
                used = true;
              } else if (spec === name) used = true;
            }
          }
        });
      });
    }
    exportUsage[file + '::' + name] = used;
  });
});

const unusedExports = Object.entries(exportUsage).filter(([,used]) => !used).map(([key]) => key);

fs.writeFileSync('analysis_unused.json', JSON.stringify({ externalPackages:[...externalPackages].sort(), unusedDeps, unreferenced, routeFiles, fileRefs:localFileRefs, exports:Object.fromEntries(Object.entries(fileExports).map(([k,v])=>[k,[...v]])), unusedExports }, null, 2));
console.log('DONE', externalPackages.size, unusedDeps.length, unreferenced.length, unusedExports.length);
