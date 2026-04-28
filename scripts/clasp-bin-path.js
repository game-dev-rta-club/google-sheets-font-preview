function getClaspBinPath(packageRoot) {
  return require.resolve('@google/clasp', {
    paths: [packageRoot],
  });
}

module.exports = {
  getClaspBinPath,
};
