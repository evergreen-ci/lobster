const path = require('path');
const base = path.resolve(__dirname);

module.exports = function() {
  const jest = require(base + '/node_modules/jest-util/build/formatTestResults').apply(this, arguments);
  if (process.env.CI !== 'true') {
    return jest;
  }

  return require(base + '/node_modules/jest-junit').apply(this, arguments);
}
