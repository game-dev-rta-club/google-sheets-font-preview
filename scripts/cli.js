#!/usr/bin/env node

const { spawnSync } = require('child_process');

const path = require('path');
const { getClaspBinPath } = require('./clasp-bin-path');

const packageRoot = path.resolve(__dirname, '..');
const projectRoot = process.cwd();
const claspBinPath = getClaspBinPath(packageRoot);

const { main: setupClasp } = require('./setup-clasp');
const { main: initProject } = require('./init-project');

function printUsage() {
  console.log('');
  console.log('Google Sheets Font Preview CLI');
  console.log('');
  console.log('Commands:');
  console.log('  init          Copy src/ and clasp config templates into the current directory');
  console.log('  setup-clasp   Create .clasp.json and start clasp login setup');
  console.log('  login-clasp   Run clasp login');
  console.log('  push-clasp    Push the current project to Apps Script');
  console.log('  pull-clasp    Pull the current Apps Script project into the current directory');
  console.log('  open-clasp    Open the bound Apps Script project');
  console.log('');
}

function runClaspCommand(args) {
  const result = spawnSync(process.execPath, [claspBinPath, ...args], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

async function main() {
  const [, , command, ...restArgs] = process.argv;

  switch (command) {
    case 'init':
      initProject();
      return;
    case 'setup-clasp':
      process.argv = [process.argv[0], process.argv[1], ...restArgs];
      await setupClasp();
      return;
    case 'login-clasp':
      runClaspCommand(['login']);
      return;
    case 'push-clasp':
      runClaspCommand(['push', '--force']);
      return;
    case 'pull-clasp':
      runClaspCommand(['pull']);
      return;
    case 'open-clasp':
      runClaspCommand(['open']);
      return;
    default:
      printUsage();
      process.exit(command ? 1 : 0);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
