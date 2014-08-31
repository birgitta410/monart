
define(['xml2json', 'module', 'path', 'node-yaml-config'], function (xml2json, module, path, yaml_config) {
  var create = function (configKey) {

    var config;
    var id = configKey;
    var FAKE = 'fake-it';

    init();

    var get = function () {
      return config[id];
    };

    function init() {
      try {
        config = yaml_config.load(path.dirname(module.uri) + '/config.yml');
      } catch (err) {
        console.log('could not read yml, trying Heroku vars');

        config = {};
        config[id] = {
          user: process.env[id.toUpperCase() + '_USER'],
          password: process.env[id.toUpperCase() + '_PASSWORD'],
          url: process.env[id.toUpperCase() + '_URL'],
          pipeline: process.env[id.toUpperCase() + '_PIPELINE']
        };

        console.log('From Heroku vars: ', config[id]);

        if (!config[id].user || !config[id].password || (!config[id].url && !config[id].url === FAKE)) {
          console.log('ERROR: Not enough values in ' + id + ' config, cannot get data | ' + JSON.stringify(config));
        }

      }

      config[id].fakeIt = function () {
        return config[id].url === FAKE;
      };

      config[id].url = addCredentialsToUrl(config[id].url);

    }

    function addCredentialsToUrl(url) {
      if (config[id].user && config[id].password && !config[id].fakeIt()) {
        var urlNoHttp = url.indexOf('http') === 0 ? url.substr('http://'.length) : url;
        return 'http://' + config[id].user + ':' + config[id].password + '@' + urlNoHttp;
      } else {
        return url;
      }
    }

    return {
      get: get, // returns { user, password, url }
      addCredentialsToUrl: addCredentialsToUrl
    };
  };

  return {
    create: create
  };
});

