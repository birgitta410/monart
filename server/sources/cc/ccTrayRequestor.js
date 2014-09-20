
define(['request', 'xml2json', 'fs', 'server/sources/ymlHerokuConfig'], function (request, xml2json, fs, configReader) {

  var config = configReader.create('cc');
  var url = config.get().url; // ccTray file URL from config file

  var get = function(callback) {

    console.log('Requesting', config.get().loggableUrl);

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
    var xml = fs.readFileSync('server/sources/cc/fake/cctray.xml');
    var json = xml2json.toJson(xml, {
      object: true, sanitize: false
    });

    callback(json);
  }

  return {
    get: get
  }
});

