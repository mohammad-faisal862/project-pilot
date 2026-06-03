/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const text = fs.readFileSync('app/(auth)/login/page.tsx','utf8');
const importRegex = /import\s+(?:.+?\s+from\s+)?['\"](.+?)['\"];?/g;
const fs = require('fs');
const text = fs.readFileSync('app/(auth)/login/page.tsx','utf8');
const importRegex = /import\s+(?:.+?\s+from\s+)?['\"](.+?)['\"];?/g;
let m;
console.log('START');
while ((m = importRegex.exec(text))) {
  console.log('IMPORT', m[1]);
}
console.log('DONE');
