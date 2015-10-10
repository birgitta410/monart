var goCd = require('gocd-api');
var config = require('./ymlHerokuConfig');

function gocdReader() {
  return goCd.getInstance(config.create('gocd').get()).then(function(instance) {
    return instance;
  });
}

module.exports = gocdReader();
