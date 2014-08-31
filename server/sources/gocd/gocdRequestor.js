
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
    console.log('FAKING Go CD Pipeline Feed');
    var source = next ? next : 'server/sources/gocd/pipeline-stages.xml';
    var xml = fs.readFileSync(source);
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  return {
    get: get
  }
});

