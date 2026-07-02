import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const fileNames = new Map();
const emptyFiles = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else {
      const stat = fs.statSync(fullPath);
      if (stat.size === 0) {
        emptyFiles.push(fullPath);
      }
      
      const name = entry.name;
      if (!fileNames.has(name)) {
        fileNames.set(name, []);
      }
      fileNames.get(name).push(fullPath);
    }
  }
}

walk(srcDir);

console.log("=== EMPTY FILES ===");
emptyFiles.forEach(f => console.log(f));

console.log("\n=== POTENTIAL DUPLICATES (by name) ===");
for (const [name, paths] of fileNames.entries()) {
  if (paths.length > 1) {
    console.log(`\nName: ${name}`);
    paths.forEach(p => console.log(`  ${p}`));
  }
}
