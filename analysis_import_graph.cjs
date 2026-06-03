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
const extFile = (p) => {
  const candidates = [p, p + '.ts', p + '.tsx', p + '/index.ts', p + '/index.tsx'];
  return candidates.find(c => fs.existsSync(path.isAbsolute(c) ? c : path.join(root, c)));
};
const normalize = (p) => p.replace(/\\/g, '/');
const imports = {};
const exportsInfo = {};
const refs = {};
for (const f of files) { imports[f] = []; exportsInfo[f] = []; refs[f] = 0; }
const importRegex = /import\s+(?:.+?\s+from\s+)?['\"](.+?)['\"];?/g;
const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|type|interface|enum|let|var)?\s*([A-Za-z0-9_$]+)/g;
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f), 'utf8');
  if (f === 'app/(auth)/login/page.tsx') console.log('DEBUG parsing', f);
  importRegex.lastIndex = 0;
  let m;
  while ((m = importRegex.exec(text))) {
    if (f === 'app/(auth)/login/page.tsx') console.log('DEBUG imp', m[1]);
    const imp = m[1];
    let impPath;
    if (imp.startsWith('.') || imp.startsWith('..')) {
      impPath = path.join(path.dirname(f), imp);
    } else if (imp.startsWith('@/')) {
      impPath = path.join(root, imp.slice(2));
    }
    if (impPath) {
      const resolved = extFile(impPath);
      if (f === 'app/(auth)/login/page.tsx') console.log('DEBUG path', imp, impPath, resolved);
      if (resolved) {
        const rel = normalize(path.relative(root, resolved));
        imports[f].push(rel);
        if (refs[rel] !== undefined) refs[rel] += 1;
      }
    }
  }
  exportRegex.lastIndex = 0;
  let me;
  while ((me = exportRegex.exec(text))) {
    exportsInfo[f].push(me[1]);
  }
}
const usedFiles = new Set();
const entryPoints = files.filter((f) => f.startsWith('app/'));
const queue = [...entryPoints, 'next.config.ts', 'prisma.config.ts'];
for (const e of queue) usedFiles.add(e);
while (queue.length) {
  const cur = queue.shift();
  if (!imports[cur]) {
    console.log('MISSING IMPORTS KEY', cur);
    continue;
  }
  for (const imp of imports[cur]) {
    if (!usedFiles.has(imp)) {
      usedFiles.add(imp);
      queue.push(imp);
    }
  }
}
const unreferenced = files.filter(f => !usedFiles.has(f));
console.log('TOTAL FILES', files.length);
console.log('UNREFERENCED CANDIDATES', unreferenced.length);
unreferenced.forEach(f => console.log(f, refs[f]));
fs.writeFileSync('analysis_imports.json', JSON.stringify({ files, imports, exports: exportsInfo, refs, unreferenced, usedFiles:[...usedFiles] }, null, 2));
