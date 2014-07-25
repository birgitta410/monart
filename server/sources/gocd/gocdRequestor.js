var yaml_config = require('node-yaml-config');
var request = require('request');
var xml2json = require('xml2json');
var gocdRequestor = gocdRequestorCreator(xml2json, request);

exports.create = gocdRequestorCreator;
exports.get = gocdRequestor.get;

function gocdRequestorCreator(xml2json, request) {

  var config;
  var STAGES_ENDPOINT = '/go/api/pipelines/artwise/stages.xml';

  if(gocdRequestor !== undefined) {
    return gocdRequestor;
  }

  function initConfig() {
    try {
      config = yaml_config.load(__dirname + '/gocd.yml');
    } catch (err) {
      console.log('could not read yml, trying Heroku vars');
      config = {
        goCd: {
          user: process.env.GOCD_USER,
          password: process.env.GOCD_PASSWORD,
          url: process.env.GOCD_URL
        }
      };
      if(config.goCd.user === undefined || config.goCd.password === undefined || config.goCd.url === undefined) {
        throw new Error('Could not read Go CD config, cannot request | ' + JSON.stringify(config));
      }

    }
    config.goCd.url = addCredentialsToUrl(config.goCd.url);

  }

  function addCredentialsToUrl(url) {
    if(config.goCd.user && config.goCd.password) {
      var urlNoHttp = url.indexOf('http') === 0 ? url.substr('http://'.length) : url;
      return 'http://' + config.goCd.user + ':' + config.goCd.password + '@' + urlNoHttp;
    } else {
      return url;
    }
  }

  var get = function(next, callback) {
    if(config === undefined) initConfig();

    var url = next ? addCredentialsToUrl(next) : config.goCd.url;

    console.log('Requesting', url);

    request(url + STAGES_ENDPOINT, function(error, response, body) {
      var json = xml2json.toJson(body, {
        object: true, sanitize: false
      });
      callback(json);
    });
  };

  return {
    get: get
  }
}

