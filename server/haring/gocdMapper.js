var _ = require('lodash');

function gocdMapperCreator(pipelineReader) {

  pipelineReader.init();

  var readHistory = function(callWhenDone) {
    pipelineReader.readHistory('myPipeline', mapPipelineDataToFigures, callWhenDone);
  };

  var colorsSuccess = [
    'green',
    'blue',
    'dark-blue'
  ];

  var colorsFailure = [
    'orange',
    'pink',
    'yellow'
  ];

  function mapPipelineDataToFigures(history, callWhenDone) {

    function getInfo(historyEntry) {
      var theTime = historyEntry.time.format('MMMM Do YYYY, h:mm:ss a');
      var theResult = historyEntry.wasSuccessful() ? 'Success' : 'Stage failed: ' + historyEntry.stageFailed;
      return theTime + ' ' + theResult;
    }

    function getFigureType(historyEntry) {
      if(historyEntry.wasSuccessful()) {
        return 'walking';
      } else {
        return 'crawling';
      }
    }

    function getColor(historyEntry) {
      if(historyEntry.wasSuccessful()) {
        return colorsSuccess[Math.floor(Math.random()*colorsSuccess.length)];
      } else {
        return colorsFailure[Math.floor(Math.random()*colorsFailure.length)];
      }
    }

    var figures = _.map(history, function(entry, index) {
      return {
        color: getColor(entry),
        column: index + 1,
        info: getInfo(entry),
        type: getFigureType(entry)
      };
    });

    var changesExist = true;
    callWhenDone(figures, changesExist);
  }

  return {
    readHistory: readHistory
  }
}


var pipelineReader = require('../sources/gocd/fakePipelineReader.js');
var gocdMapper = gocdMapperCreator(pipelineReader);

exports.create = gocdMapperCreator;
exports.readHistory = gocdMapper.readHistory;
