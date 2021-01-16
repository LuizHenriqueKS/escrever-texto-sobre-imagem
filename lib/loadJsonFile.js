const fs = require('fs');

module.exports = function loadJsonFile(path) {
  const content = fs.readFileSync(path).toString();
  return JSON.parse(content);
}