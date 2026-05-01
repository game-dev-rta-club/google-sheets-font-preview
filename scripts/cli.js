#!/usr/bin/env node

const { spawnSync } = require('child_process');

const path = require('path');
const { getClaspBinPath } = require('./clasp-bin-path');

const packageRoot = path.resolve(__dirname, '..');
const projectRoot = process.cwd();
const claspBinPath = getClaspBinPath(packageRoot);

const { main: setupClasp } = require('./setup-clasp');

function printUsage() {
  console.log('');
  console.log('Font Preview Sidebar CLI');
  console.log('');
  console.log('Commands:');
  console.log('  setup-clasp   Copy project files, create .clasp.json, and start clasp login setup');
  console.log('  push-clasp    Push the current project to Apps Script');
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
    case 'setup-clasp':
      process.argv = [process.argv[0], process.argv[1], ...restArgs];
      await setupClasp();
      return;
    case 'push-clasp':
      runClaspCommand(['push', '--force']);
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
