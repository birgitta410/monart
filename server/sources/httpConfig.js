var yaml_config = require('node-yaml-config');
var request = require('request');
var xml2json = require('xml2json');

exports.create = function(configKey) {

  var config;
  var id = configKey;

  init();

  var get = function() {
    return config[id];
  }

  function init() {
    try {
      config = yaml_config.load(__dirname + '/config.yml');
    } catch (err) {
      console.log('could not read yml, trying Heroku vars');

      config = {};
      config[id] = {
        user: process.env[id.toUpperCase() + '_USER'],
        password: process.env[id.toUpperCase() + '_PASSWORD'],
        url: process.env[id.toUpperCase() + '_URL'],
        pipeline: process.env[id.toUpperCase() + '_PIPELINE']
      };

      if(config[id].user === undefined || config[id].password === undefined || config[id].url === undefined) {
        throw new Error('Could not read ' + id + ' config, cannot request | ' + JSON.stringify(config));
      }

    }
    config[id].url = addCredentialsToUrl(config[id].url);

  }

  function addCredentialsToUrl(url) {
    if(config[id].user && config[id].password) {
      var urlNoHttp = url.indexOf('http') === 0 ? url.substr('http://'.length) : url;
      return 'http://' + config[id].user + ':' + config[id].password + '@' + urlNoHttp;
    } else {
      return url;
    }
  }

  return {
    get: get, // returns { user, password, url }
    addCredentialsToUrl: addCredentialsToUrl
  }
}

