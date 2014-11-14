var goCd = require('gocd-api');
var config = require('./ymlHerokuConfig');

function gocdReader() {
  return goCd.getInstance(config.create('gocd').get());
}

module.exports = gocdReader();
