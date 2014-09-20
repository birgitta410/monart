
var miroGocdMapper = function(_, moment, gocdReader) {


  var readHistoryAndActivity = function(callWhenDone) {
    gocdReader.readData(function(data) {

      var history = data.history;

      var keysDescending = _.keys(history).sort(function(a, b) {
        return a - b; // JS does lexicographical sorting by default, need to sort by number
      }).reverse();
      var lastBuild = history[keysDescending[0]];

      var finalShapes = {};
      finalShapes.stroke = {
        color: lastBuild.wasSuccessful() ? 'black' : 'red',
        info: lastBuild.info
      };

      finalShapes.stones = _.map(keysDescending.splice(1), function(key) {
        var entry = history[key];
        return {
          size: 'small',
          color: entry.wasSuccessful() ? 'black' : 'red',
          info: entry.info
        };
      });

      callWhenDone(finalShapes);

    });
  };

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
};

define(['lodash', 'moment', 'server/sources/gocd/gocdReader'], miroGocdMapper);