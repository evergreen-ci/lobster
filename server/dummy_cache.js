// dummy cache when no cache is needed

module.exports = function() {
  return {
    put: function(filename, data) {
      return new Promise(function(resolve, _reject) { resolve(data); });
    },

    get: function(filename) {
      return new Promise(function(resolve, reject) {
        reject(filename);
      });
    }
  };
};
