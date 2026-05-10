/**
 * Scans repository for runSubagent calls and enforces model="GPT-5 mini (high)"
 * Exit code 0 = pass, 1 = violations found
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_MODEL = 'GPT-5 mini (high)';
const IGNORED_DIRS = new Set(['node_modules', '.git', 'build', 'dist', 'out']);
const EXT_WHITELIST = new Set(['.js', '.ts', '.jsx', '.tsx', '.md']);

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORED_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, fileList);
    } else {
      if (EXT_WHITELIST.has(path.extname(e.name))) fileList.push(full);
    }
  }
  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  const regex = /runSubagent\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const objBody = m[1];
    const modelRegex = /model\s*:\s*['\"]([^'\"]+)['\"]/;
    const modelMatch = modelRegex.exec(objBody);
    if (!modelMatch) {
      violations.push({ file: filePath, reason: 'missing model param' });
    } else {
      const modelValue = modelMatch[1].trim();
      if (modelValue !== TARGET_MODEL) {
        violations.push({ file: filePath, reason: `model is "${modelValue}"` });
      }
    }
  }

  // Also flag runSubagent calls that don't match the simple object literal pattern
  const genericRegex = /runSubagent\s*\(/g;
  let countGeneric = 0;
  while (genericRegex.exec(content) !== null) countGeneric++;
  // if there are calls but none matched the object-literal pattern above, warn
  if (countGeneric > 0) {
    const matchedByPattern = (content.match(regex) || []).length;
    if (matchedByPattern < countGeneric) {
      violations.push({ file: filePath, reason: 'runSubagent call not using inline object literal (manual review required)' });
    }
  }

  return violations;
}

function main() {
  const files = walk(ROOT);
  const all = [];
  for (const f of files) {
    const v = checkFile(f);
    if (v.length) all.push(...v);
  }

  if (all.length === 0) {
    console.log('OK: All runSubagent calls use', TARGET_MODEL);
    process.exit(0);
  }

  console.error('Subagent model violations found:');
  all.forEach(x => console.error('-', x.file, ':', x.reason));
  process.exit(1);
}

main();
