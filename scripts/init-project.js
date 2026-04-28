const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const projectRoot = process.cwd();

const filesToCopy = [
  { from: path.join(packageRoot, 'src'), to: path.join(projectRoot, 'src'), type: 'directory' },
  { from: path.join(packageRoot, '.claspignore'), to: path.join(projectRoot, '.claspignore'), type: 'file' },
  { from: path.join(packageRoot, '.clasp.json.example'), to: path.join(projectRoot, '.clasp.json.example'), type: 'file' },
];

function ensureDirectory(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyDirectory(sourceDir, targetDir) {
  ensureDirectory(targetDir);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  entries.forEach((entry) => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      return;
    }

    ensureDirectory(path.dirname(targetPath));
    fs.copyFileSync(sourcePath, targetPath);
  });
}

function copyFile(sourcePath, targetPath) {
  ensureDirectory(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function main() {
  console.log('');
  console.log('Initializing Google Sheets Font Preview in:');
  console.log(projectRoot);
  console.log('');

  filesToCopy.forEach(({ from, to, type }) => {
    if (type === 'directory') {
      copyDirectory(from, to);
    } else {
      copyFile(from, to);
    }
    console.log(`Copied ${path.relative(projectRoot, to) || path.basename(to)}`);
  });

  console.log('');
  console.log('Project files are ready.');
  console.log('Next steps:');
  console.log('1. google-sheets-font-preview setup-clasp');
  console.log('2. google-sheets-font-preview push-clasp');
  console.log('');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = {
  main,
};
