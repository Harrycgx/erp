import fs from 'fs';
import path from 'path';

const evidencePath = path.join(process.cwd(), 'audit-evidence.json');
if (!fs.existsSync(evidencePath)) {
  console.error("Evidence not found!");
  process.exit(1);
}

const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
const emptyFiles = evidence.emptyFiles;

let deletedCount = 0;
emptyFiles.forEach(file => {
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  
  // globals.css is imported, skip it.
  if (relPath === 'src/styles/globals.css') {
    console.log(`Skipping: ${relPath} (Imported)`);
    return;
  }
  
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`DELETED: ${relPath}`);
      deletedCount++;
    }
  } catch (err) {
    console.error(`Failed to delete ${relPath}:`, err.message);
  }
});

console.log(`\nSuccessfully deleted ${deletedCount} empty files.`);
