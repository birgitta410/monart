
define(['request', 'xml2json', 'fs', 'server/sources/httpConfig'], function (request, xml2json, fs, httpConfig) {

  var config = httpConfig.create('cc');
  var url = config.get().url; // ccTray file URL from config file

  var get = function(callback) {

    console.log('Requesting', url);

    if (config.get().fakeIt()) {
      getFake(callback);
    } else {

      request(url, function (error, response, body) {
        var json = xml2json.toJson(body, {
          object: true, sanitize: false
        });
        callback(json);
      });
    }
  };

  function getFake(callback) {
    console.log('FAKING cctray.xml');
    var xml = fs.readFileSync('server/sources/cc/cctray.xml');
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  return {
    get: get
  }
});

