const checks = [
  { name: 'NEXTAUTH_SECRET', minLen: 32 },
  { name: 'GOOGLE_ID', minLen: 10 },
  { name: 'GOOGLE_SECRET', minLen: 10 }
];

let ok = true;
checks.forEach(c => {
  const v = process.env[c.name];
  if (!v) {
    console.error(`MISSING: ${c.name}`);
    ok = false;
  } else if (c.minLen && v.length < c.minLen) {
    console.error(`WEAK: ${c.name} length ${v.length} < ${c.minLen}`);
    ok = false;
  } else {
    console.log(`OK: ${c.name}`);
  }
});

if (!ok) {
  console.error('\nEnvironment validation failed. Set required secrets in your environment before deploying.');
  process.exit(2);
}

console.log('\nAll required env checks passed.');
