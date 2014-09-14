
define(['xml2json', 'request', 'fs', 'server/sources/httpConfig'], function (xml2json, request, fs, httpConfig) {

  var config = httpConfig.create('gocd');
  var STAGES_ENDPOINT = '/go/api/pipelines/' + config.get().pipeline + '/stages.xml';

  var get = function(next, callback) {

    if (config.get().fakeIt()) {
      getFake(next, callback);
    } else {

      var url = next ? config.addCredentialsToUrl(next) : config.get().url;

      console.log('Requesting', url + STAGES_ENDPOINT);

      request(url + STAGES_ENDPOINT, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        callback(json);
      });

    }
  };

  function getFake(next, callback) {
    var source = next ? next : 'server/sources/gocd/fake/pipeline-stages.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  var getMaterialHtml = function(jobId, callback) {
    if (config.get().fakeIt()) {
      getFakeMaterial(jobId, callback);
    } else {
      var url = config.addCredentialsToUrl(jobId + '/materials');
      console.log('Requesting', url);
      request(url, function(error, response, body) {
        callback(body);
      });
    }
  };

  function getFakeMaterial(jobId, callback) {
    var html = fs.readFileSync('server/sources/gocd/fake/materials.html');

    callback(html);
  }

  return {
    get: get,
    getMaterialHtml: getMaterialHtml
  }
});

