const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const caseParts = require(path.join(__dirname, '..', '..', 'server', 'rosewoodManorCase'));
const { conceptCodeTemplates } = require('../src/services/learningEngine');

const snippets = [
  ...caseParts.map((part) => [`${part._id}/idealSolution`, part.idealSolution]),
  ...Object.entries(conceptCodeTemplates).map(([name, code]) => [`template/${name}`, code])
];
const failures = [];
const python = process.platform === 'win32' ? 'python' : 'python3';

for (const [name, code] of snippets) {
  String(code).split('\n').forEach((line, index) => {
    if (line.trim() && !line.includes('#')) failures.push(`${name}:${index + 1} has no comment`);
  });
  const temp = path.join(__dirname, `.pybe-${process.pid}-${snippets.indexOf([name, code])}.py`);
  fs.writeFileSync(temp, `${code}\n`, 'utf8');
  const result = spawnSync(python, ['-m', 'py_compile', temp], { encoding: 'utf8' });
  fs.rmSync(temp, { force: true });
  if (result.status !== 0) failures.push(`${name} does not compile: ${(result.stderr || '').trim()}`);
}

console.log(`Validated ${snippets.length} Python snippets.`);
if (failures.length) {
  console.error('Python validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Python validation passed: every non-blank line is commented and every snippet compiles.');
