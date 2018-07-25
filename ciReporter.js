const path = require('path');
const base = path.resolve(__dirname);

module.exports = function() {
  require(base + '/node_modules/jest-util/build/formatTestResults').apply(this, arguments);
  return require(base + '/node_modules/jest-junit').apply(this, arguments);
};
