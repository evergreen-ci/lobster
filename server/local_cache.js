const fs = require('fs');
const rmdir = require('rmdir');


module.exports = function(base) {
  console.log('Using cache with cache dir: ' + base);
  rmdir(base, function(err) {
    if (err) {
      console.log('err in rmdir ');
    }
    fs.mkdirSync(base);
  });

  return {
    put: function(filename, data) {
      var path = base + '/' + filename;
      return new Promise(function(resolve, reject) {
        fs.writeFile(path, data, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    },

    get: function(filename) {
      var path = base + '/' + filename;
      return new Promise(function(resolve, reject) {
        fs.readFile(path, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }
  };
};
