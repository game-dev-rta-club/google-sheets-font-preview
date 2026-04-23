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

function openUrl(url) {
  let command;
  let args;

  if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  if (result.status !== 0) {
    console.log('');
    console.log(`Could not open this URL automatically: ${url}`);
    console.log('Please open it manually.');
    console.log('');
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
  console.log('Step 1');
  console.log('- Open your spreadsheet.');
  console.log('- Go to Extensions > Apps Script.');
  console.log('- In the Apps Script editor, copy the full URL or the raw scriptId between /projects/ and /edit.');
  console.log('- Example: https://script.google.com/home/projects/<scriptId>/edit');
  console.log('');
  const answer = await question('Paste the Apps Script URL or Project ID, then press Enter: ');

  rl.close();
  return answer;
}

async function runStepTwoLogin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (message) =>
    new Promise((resolve) => {
      rl.question(message, resolve);
    });

  console.log('');
  console.log('Step 2');
  console.log('- We will start the login setup for clasp.');
  console.log('- When you press Enter, the browser login flow will start.');
  console.log('- After the auth setup is complete, the next step will continue automatically.');
  console.log('');
  await question('Press Enter to start login setup: ');
  rl.close();

  console.log('');
  console.log('Starting clasp login...');
  console.log('');
  runClaspLogin();
}

async function runStepThreeAppsScriptApi() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (message) =>
    new Promise((resolve) => {
      rl.question(message, resolve);
    });

  console.log('');
  console.log('Step 3');
  console.log('- We will open the Apps Script user settings page.');
  console.log('- Turn ON "Google Apps Script API".');
  console.log('- If you just enabled it, wait a few minutes before your first push.');
  console.log('');
  await question('Press Enter to open the settings page: ');
  rl.close();

  openUrl('https://script.google.com/home/usersettings');
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
  await runStepTwoLogin();
  await runStepThreeAppsScriptApi();

  console.log('');
  console.log('Step 4');
  console.log('- Setup complete.');
  console.log(`- Created ${path.basename(outputPath)}.`);
  console.log('- Next command: npm run push-clasp');
  console.log('');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
