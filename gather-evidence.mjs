import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const packageJsonPath = path.join(process.cwd(), 'package.json');

const files = [];
const emptyFiles = [];
const fileNames = new Map();
const imports = new Map(); // target file/module -> array of source files

// Regex for extracting imports (very simplified but covers most cases for an audit script)
// Including static and dynamic imports
const importRegex = /(?:import\s+.*?from\s+['"]([^'"]+)['"])|(?:import\s*\(\s*['"]([^'"]+)['"]\s*\))|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.css') || entry.name.endsWith('.html')) {
      const stat = fs.statSync(fullPath);
      if (stat.size === 0) {
        emptyFiles.push(fullPath);
      }
      
      files.push(fullPath);
      const name = entry.name;
      if (!fileNames.has(name)) {
        fileNames.set(name, []);
      }
      fileNames.get(name).push(fullPath);
    }
  }
}

walk(srcDir);
// Also scan main configs
['vite.config.js', 'tailwind.config.js', 'eslint.config.js', 'index.html'].forEach(f => {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) files.push(p);
});

// Build import map
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const target = match[1] || match[2] || match[3];
    if (target) {
      if (!imports.has(target)) {
        imports.set(target, []);
      }
      imports.get(target).push(file);
    }
  }
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const deps = Object.keys(packageJson.dependencies || {});
const devDeps = Object.keys(packageJson.devDependencies || {});
const allDeps = [...deps, ...devDeps];

const depUsage = {};
allDeps.forEach(d => depUsage[d] = []);

imports.forEach((sources, target) => {
  allDeps.forEach(dep => {
    // If target is exact dep, or target starts with dep + '/' (for sub-imports like lucide-react/icons)
    if (target === dep || target.startsWith(dep + '/')) {
      depUsage[dep].push(...sources);
    }
  });
});

// Analyze Duplicates (Basic heuristic based on file size and content)
const duplicateAnalysis = {};
for (const [name, paths] of fileNames.entries()) {
  if (paths.length > 1) {
    duplicateAnalysis[name] = paths.map(p => {
      const content = fs.readFileSync(p, 'utf-8');
      const lines = content.split('\n').length;
      const size = fs.statSync(p).size;
      return { path: p, lines, size };
    });
  }
}

const report = {
  emptyFiles,
  duplicateAnalysis,
  depUsage,
  allImports: Array.from(imports.entries())
};

fs.writeFileSync('audit-evidence.json', JSON.stringify(report, null, 2));
console.log('Audit evidence gathered in audit-evidence.json');
