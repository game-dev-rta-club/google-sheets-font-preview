const fs = require('fs');
const path = require('path');
const readline = require('readline');

const repoRoot = path.resolve(__dirname, '..');
const templatePath = path.join(repoRoot, '.clasp.json.example');
const outputPath = path.join(repoRoot, '.clasp.json');

function readTemplate() {
  return fs.readFileSync(templatePath, 'utf8');
}

function writeConfig(scriptId) {
  const template = readTemplate();
  const content = template.replace('REPLACE_WITH_YOUR_APPS_SCRIPT_PROJECT_ID', scriptId.trim());
  fs.writeFileSync(outputPath, content, 'utf8');
}

function isValidScriptId(value) {
  return typeof value === 'string' && value.trim().length > 10 && !value.includes('REPLACE_WITH');
}

function printUsage() {
  console.log('');
  console.log('Usage: npm run setup-clasp -- <scriptId>');
  console.log('Or run without arguments to enter the scriptId interactively.');
  console.log('');
}

async function promptScriptId() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (message) =>
    new Promise((resolve) => {
      rl.question(message, resolve);
    });

  const answer = await question('Apps Script Project ID (scriptId): ');
  rl.close();
  return answer;
}

async function main() {
  const argScriptId = process.argv[2];
  const scriptId = isValidScriptId(argScriptId) ? argScriptId : await promptScriptId();

  if (!isValidScriptId(scriptId)) {
    console.error('Valid scriptId was not provided.');
    printUsage();
    process.exit(1);
  }

  writeConfig(scriptId);

  console.log('');
  console.log(`Created ${path.basename(outputPath)}.`);
  console.log('Next steps:');
  console.log('1. npm run login-clasp');
  console.log('2. npm run push-clasp');
  console.log('');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
