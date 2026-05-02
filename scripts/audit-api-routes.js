const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'app', 'api');

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(full)) {
      results.push(full);
    }
  });
  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasSessionCheck = /getServerSession|getToken|withAuth|authOptions/.test(content);
  const accessesSensitive = /prisma|dbStorage|cumulativeResult|cumulativeResults|countryPoints|totalVotes|voteCounts|userVote|prisma\.competition|getCumulativeResults/.test(content);
  return { filePath, hasSessionCheck, accessesSensitive };
}

function main() {
  if (!fs.existsSync(root)) {
    console.error('No API folder found at', root);
    process.exit(1);
  }

  const files = walk(root);
  const findings = [];
  files.forEach((f) => {
    const r = analyzeFile(f);
    if (r.accessesSensitive && !r.hasSessionCheck) {
      findings.push(r);
    }
  });

  const result = { findings, scanned: files.length };
  console.log(JSON.stringify(result, null, 2));
  if (findings.length > 0) {
    console.error('Security audit failed: unprotected sensitive API routes found.');
    process.exit(1);
  }
  process.exit(0);
}

main();
