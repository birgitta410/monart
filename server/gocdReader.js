var goCd = require('gocd-api');

function gocdCreator(config) {
  return goCd.getInstance(config).then(function(instance) {
    return instance;
  });
}

module.exports = gocdCreator;
