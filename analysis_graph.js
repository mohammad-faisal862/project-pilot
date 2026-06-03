/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const root = process.cwd();
const files = glob.sync('**/*.{ts,tsx}', {nodir:true, ignore:['node_modules/**','.next/**']});
const extFile = (p)=>{ const candidates=[p, p+'.ts', p+'.tsx', p+'/index.ts', p+'/index.tsx']; return candidates.find(c=>fs.existsSync(path.join(root,c))); };
const normalize = (p)=>p.replace(/\\/g,'/');
const imports = {};
const exports = {};
const refs = {};
for(const f of files){ imports[f]=[]; exports[f]=[]; refs[f]=0; }
const importRegex = /import\s+(?:.+?\s+from\s+)?['\"](.+?)['\"];?/g;
const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|type|interface|enum|let|var)?\s*([A-Za-z0-9_$]+)/g;
for(const f of files){ const text = fs.readFileSync(path.join(root,f),'utf8');
 let m; while((m=importRegex.exec(text))){ let imp=m[1]; if(imp.startsWith('.')||imp.startsWith('..')){
 let impPath=path.join(path.dirname(f),imp);
 let resolved = extFile(impPath);
 if(resolved){ resolved = normalize(path.relative(root,resolved)); imports[f].push(resolved); refs[resolved] +=1; }
 }
 }
 let me; while((me=exportRegex.exec(text))){ exports[f].push(me[1]); }
 }
const usedFiles = new Set();
const entryPoints=['app/layout.tsx','next.config.ts','prisma.config.ts','app/api/webhooks/clerk/route.ts'];
const queue=[...entryPoints];
for(const e of queue)usedFiles.add(e);
while(queue.length){ const cur=queue.shift(); for(const f of files){ if(imports[f].includes(cur) && !usedFiles.has(f)){ usedFiles.add(f); queue.push(f); } } }
const unreferenced = files.filter(f=>!usedFiles.has(f));
console.log('TOTAL FILES',files.length);
console.log('UNREFERENCED CANDIDATES',unreferenced.length);
unreferenced.forEach(f=>console.log(f, refs[f]));
fs.writeFileSync('analysis_imports.json', JSON.stringify({files,imports,exports,refs,unreferenced,usedFiles:[...usedFiles]},null,2));
