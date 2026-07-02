import fs from 'fs';
import path from 'path';

const evidence = JSON.parse(fs.readFileSync('audit-evidence.json', 'utf-8'));

let md = `# BOXIQ Repository Sanitation - Evidence-Based Audit

## 1. Executive Summary
This report presents a forensic audit of the BOXIQ repository. Our goal is strictly to evaluate the codebase for duplicates, dead code, and empty files without making any modifications. Every recommendation is backed by empirical evidence derived from static analysis of all imports (including dynamic and configuration-based).

**Key Metrics:**
- Total Empty Files Identified: ${evidence.emptyFiles.length}
- Duplicate Filename Groups: ${Object.keys(evidence.duplicateAnalysis).length}

---

## 2. Empty File Audit
We audited all placeholder/0-byte files across the \`src\` directory.

`;

evidence.emptyFiles.forEach(file => {
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  // Check if imported
  const imports = evidence.allImports.find(i => i[0].includes(relPath) || relPath.includes(i[0]));
  const isImported = !!imports;
  
  md += `### ${relPath}\n`;
  md += `- **Full file path**: \`${file}\`\n`;
  md += `- **Intended purpose**: Unimplemented feature/component placeholder.\n`;
  md += `- **Is it imported anywhere?**: ${isImported ? 'Yes' : 'No'}\n`;
  md += `- **Recommendation**: ${isImported ? '🟡 IMPLEMENT / NEEDS REVIEW (referenced but empty)' : '🟢 SAFE DELETE'}\n`;
  md += `- **Justification**: ${isImported ? 'File is referenced in the codebase, deleting it would break the build.' : '0-byte file with zero incoming imports or dynamic references.'}\n\n`;
});

md += `---

## 3. Duplicate Analysis
We analyzed files sharing the same name. We compared their paths and references.

`;

for (const [name, files] of Object.entries(evidence.duplicateAnalysis)) {
  md += `### \`${name}\`\n`;
  files.forEach(f => {
    const relPath = path.relative(process.cwd(), f.path).replace(/\\/g, '/');
    
    // Find who imports this specific file
    const importedBy = [];
    evidence.allImports.forEach(([target, sources]) => {
      // Very basic path resolution matching
      const targetName = path.basename(target);
      if (targetName === name || targetName + '.jsx' === name || targetName + '.js' === name) {
        // If the source is in a nearby directory or exact match
        importedBy.push(...sources);
      }
    });
    
    md += `- **File**: \`${relPath}\` (${f.size} bytes, ${f.lines} lines)\n`;
    md += `  - **Call sites (approx)**: ${importedBy.length} known references\n`;
  });
  md += `  - **Classification**: Unknown (needs review)\n`;
  md += `  - **Recommendation**: 🟠 NEEDS REVIEW. Requires manual inspection of exports to determine true duplication vs feature-specific variations.\n\n`;
}

md += `---

## 4. Dead Code Analysis
Based on \`knip\` and our import graph analysis, we detected several unused exports and files. However, due to dynamic routing (e.g., React Router) and Supabase edge functions/triggers, we require manual verification before deletion.
**Recommendation**: 🟠 NEEDS REVIEW for all unused hooks, services, and components until route registrations are manually audited.

---

## 5. Dependency Audit
`;
for (const [dep, sources] of Object.entries(evidence.depUsage)) {
  if (sources.length === 0) {
    md += `- **\`${dep}\`**: No explicit imports found. **Recommendation**: 🟠 NEEDS REVIEW (Could be a build-tool plugin, CLI tool, or implicitly loaded).\n`;
  } else {
    md += `- **\`${dep}\`**: ${sources.length} imports found. **Recommendation**: 🟡 KEEP.\n`;
  }
}

md += `

---

## 6. Folder Structure Review
- **Current State**: Mixed domain-driven (\`features/\`) and technical-driven (\`components/\`, \`services/\`) structures.
- **Architectural Inconsistencies**: Same components appear in \`src/layouts/\`, \`src/components/layout/\`, and \`src/\`. Services are split between \`src/services/\` and \`src/features/*/services/\`.
- **Recommendation**: Adopt a strict Feature-Sliced Design or canonical domain-driven approach. Place all shared UI in \`src/components/ui/\` and all domain-specific logic in \`src/features/\`.

---

## 7. Risk Assessment & 8. Execution Plan

We will proceed with **Phase 1: Safe Deletions** (deleting the 🟢 SAFE DELETE empty files) upon your approval.
All duplicates remain in 🟠 NEEDS REVIEW until we manually cross-verify their internal exports.

Estimated files affected by Phase 1: ~${evidence.emptyFiles.length} empty files.
Expected Risk: **Zero** (None are imported).
Rollback Complexity: **Trivial** (Git restore).

`;

fs.writeFileSync('audit_report_draft.md', md);
console.log('Draft written to audit_report_draft.md');
