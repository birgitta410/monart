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

  var trueFn = function() { return true; };

  function mapPipelineDataToFigures(history, callWhenDone) {

    function getInfo(historyEntry) {
      var theTime = historyEntry.time.format('MMMM Do YYYY, h:mm:ss a');
      var theResult = historyEntry.wasSuccessful() ? 'Success' : 'Stage failed: ' + historyEntry.stageFailed;
      return theTime + ' ' + theResult;
    }

    function getFigureType(entry, lastEntry, secondLastEntry) {

      lastEntry = lastEntry || { wasSuccessful: trueFn };
      secondLastEntry = secondLastEntry || { wasSuccessful: trueFn };

      if(entry.wasSuccessful() && !lastEntry.wasSuccessful()) {
        return 'flying';
      } else if (entry.wasSuccessful()) {
        return 'walking';
      } else if ( ! entry.wasSuccessful() && !lastEntry.wasSuccessful()) {
        return 'crawling';
      } else {
        return 'stumbling';
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
      var previousPrevious = index < history.length + 1 ? history[index + 2] : undefined;
      var figure = {
        color: getColor(entry),
        column: index + 1,
        info: getInfo(entry),
        type: getFigureType(entry, previous, previousPrevious)
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
