
var miroGocdMapper = function(_, moment, gocdReader) {


  var readHistoryAndActivity = function(callWhenDone) {
    gocdReader.readData(function(data) {

      var history = data.history;

      var keysDescending = _.keys(history).sort(function(a, b) {
        return a - b; // JS does lexicographical sorting by default, need to sort by number
      }).reverse();
      var lastBuildSuccessful = history[keysDescending[0]].wasSuccessful();

      var finalShapes = {};
      finalShapes.stroke = { color: lastBuildSuccessful ? 'black' : 'red' };
      finalShapes.stones = [
        { size: 'large', color: 'black' },
        { size: 'medium', color: 'white' },
        { size: 'small', color: 'red' }
      ];

      callWhenDone(finalShapes);

    });
  };

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
};

define(['lodash', 'moment', 'server/sources/gocd/gocdReader'], miroGocdMapper);