
define(['server/sources/ymlHerokuConfig', 'contextio', 'module', 'path'], function (configReader, ContextIO, module, path) {

  var ctxioClient;
  var config = configReader.create('contextIo');

  var init = function () {

    ctxioClient = new ContextIO.Client({
      key: config.get().key,
      secret: config.get().secret
    });
  };

  var readEmail = function (callback, callbackParameter) {

    // TODO:  query with date_after = since last time I asked

    ctxioClient.accounts(config.get().account).messages().get(
      {
        limit: 15,
        include_flags: 1
        // flag_seen: 1
      }, function (err, response) {
        if (err) throw err;
        callback(response.body, callbackParameter);
      });

  };

  var getAccountInfo = function (callback, callbackParameter) {
    ctxioClient.accounts(config.get().account).get(
      { }, function (err, response) {
        if (err) throw err;
        callback(response.body, callbackParameter);
      });
  };

  return {
    init: init,
    readEmail: readEmail,
    getAccountInfo: getAccountInfo
  };

});