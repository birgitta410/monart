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

    function getFigureType(historyEntry, previousEntry) {
      previousEntry = previousEntry || { wasSuccessful: function() { return true; }};
      if(historyEntry.wasSuccessful() && !previousEntry.wasSuccessful()) {
        return 'flying';
      } else if (historyEntry.wasSuccessful()) {
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

    // !! currently ASSUMING that history is sorted in descending chronological order, newest first
    var figures = _.map(history, function(entry, index) {
      var previous = index < history.length ? history[index + 1] : undefined;
      var figure = {
        color: getColor(entry),
        column: index + 1,
        info: getInfo(entry),
        type: getFigureType(entry, previous)
      };
      return figure;
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
