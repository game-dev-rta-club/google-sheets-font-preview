const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

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

function runClaspLogin() {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['clasp', 'login'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error('');
    console.error('clasp login failed. You can retry it with:');
    console.error('npm run login-clasp');
    console.error('');
    process.exit(result.status || 1);
  }
}

function normalizeScriptId(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.includes('REPLACE_WITH')) {
    return '';
  }

  const urlMatch = trimmed.match(/\/projects\/([a-zA-Z0-9_-]+)\//);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return trimmed;
}

function isValidScriptId(value) {
  const normalized = normalizeScriptId(value);
  return normalized.length > 10;
}

function printUsage() {
  console.log('');
  console.log('Usage: npm run setup-clasp -- <Apps Script URL or scriptId>');
  console.log('Or run without arguments to enter it interactively.');
  console.log('You can paste the Apps Script editor URL directly:');
  console.log('https://script.google.com/home/projects/<scriptId>/edit');
  console.log('');
  console.log('Before your first push, make sure the Apps Script API is enabled:');
  console.log('https://script.google.com/home/usersettings');
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

  console.log('');
  console.log('Interactive setup');
  console.log('');
  await question('Step 1: Open your spreadsheet, then press Enter. ');
  await question('Step 2: Open Extensions > Apps Script, then press Enter. ');
  console.log('');
  console.log('Step 3: In the Apps Script editor, copy either:');
  console.log('- the full editor URL');
  console.log('- or the raw scriptId between /projects/ and /edit');
  console.log('Example: https://script.google.com/home/projects/<scriptId>/edit');
  console.log('');
  const answer = await question('Step 4: Paste the Apps Script URL or Project ID: ');
  console.log('');
  console.log('Step 5: Before your first push, you need to enable Google Apps Script API.');
  console.log('Open: https://script.google.com/home/usersettings');
  console.log('');

  rl.close();
  return answer;
}

async function confirmAppsScriptApiEnabled() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (message) =>
    new Promise((resolve) => {
      rl.question(message, resolve);
    });

  while (true) {
    const answer = await question('Have you enabled "Google Apps Script API" in user settings? (y/n): ');
    const normalized = String(answer || '').trim().toLowerCase();

    if (normalized === 'y' || normalized === 'yes') {
      rl.close();
      return true;
    }

    if (normalized === 'n' || normalized === 'no') {
      console.log('');
      console.log('Please enable it here before running push-clasp:');
      console.log('https://script.google.com/home/usersettings');
      console.log('If you just enabled it, wait a few minutes before pushing.');
      console.log('');
      rl.close();
      return false;
    }

    console.log('Please answer with y or n.');
  }
}

async function main() {
  const argScriptId = process.argv[2];
  const rawValue = isValidScriptId(argScriptId) ? argScriptId : await promptScriptId();
  const scriptId = normalizeScriptId(rawValue);

  if (!isValidScriptId(scriptId)) {
    console.error('Valid Apps Script URL or scriptId was not provided.');
    printUsage();
    process.exit(1);
  }

  writeConfig(scriptId);
  console.log('');
  console.log('Starting clasp login...');
  console.log('');
  runClaspLogin();
  const apiEnabled = await confirmAppsScriptApiEnabled();

  console.log('');
  console.log(`Created ${path.basename(outputPath)}.`);
  console.log('Next steps:');
  if (!apiEnabled) {
    console.log('1. Open https://script.google.com/home/usersettings');
    console.log('2. Enable "Google Apps Script API"');
    console.log('3. Wait a few minutes if you just enabled it');
    console.log('4. npm run push-clasp');
  } else {
    console.log('1. npm run push-clasp');
  }
  console.log('');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
