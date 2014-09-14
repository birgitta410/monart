
var miroGocdMapper = function(_, moment, gocdReader) {
  var readHistoryAndActivity = function(callWhenDone) {
//    gocdReader.readData(function(data) {

//      var activityHaring = mapActivityDataToFigures(data.activity);
//      var historyHaring = mapPipelineDataToFigures(data.history);
//
//      var historyFigures = historyHaring.figures;
//      mapInitialsFromHistoryToActivity(historyFigures, activityHaring.figures);

      var finalShapes = {};
      finalShapes.stroke = { color: 'white' };
      finalShapes.stones = [
        { size: 'large', color: 'black' },
        { size: 'medium', color: 'white' },
        { size: 'small', color: 'red' }
      ];

      callWhenDone(finalShapes);

//    });
  };

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
};

define(['lodash', 'moment', 'server/sources/gocd/gocdReader'], miroGocdMapper);