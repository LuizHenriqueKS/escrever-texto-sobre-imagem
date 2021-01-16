const fs = require('fs');
const { join, resolve } = require('path');

module.exports = function tryGetExistingPath(path, cwd = process.cwd()) {
  if (fs.existsSync(path)) {
    return resolve(path);
  }
  const fullPath = join(cwd, path);
  if (fs.existsSync(fullPath)) {
    return resolve(fullPath);
  }
  return resolve(path);
}