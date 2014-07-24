var _ = require('lodash');
var moment = require('moment');

function gocdMapperCreator(pipelineReader) {

  pipelineReader.init();

  var readHistory = function(callWhenDone) {
    pipelineReader.readHistory(mapPipelineDataToFigures, callWhenDone);
  };

  var colorsSuccess = [
    'dark-green',
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
      var theTime = moment(historyEntry.time).format('MMMM Do YYYY, h:mm:ss a');
      var theResult = historyEntry.wasSuccessful() ? 'Success' : 'Stage failed: ' + historyEntry.stageFailed;
      return theTime + ' ' + theResult;
    }

    function getFigureType(entry, lastEntry) {

      lastEntry = lastEntry || { wasSuccessful: trueFn };

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

    var keysDescending = _.keys(history).sort().reverse();
    var figures = _.map(keysDescending, function(key, index) {
      var entry = history[key];
      var previous = index < keysDescending.length ? history[keysDescending[index + 1]] : undefined;

      var figure = {
        color: getColor(entry),
        column: index + 1,
        info: getInfo(entry),
        type: getFigureType(entry, previous)
      };
      return figure;
    });

    var lastBuildSuccessful = history[keysDescending[0]].wasSuccessful();

    var changesExist = true;
    callWhenDone({
      background: lastBuildSuccessful ? 'green' : 'orange',
      figures: figures
    }, changesExist);
  }

  return {
    readHistory: readHistory
  }
}


var pipelineReader = require('../sources/gocd/pipelineFeedReader.js');
var gocdMapper = gocdMapperCreator(pipelineReader);

exports.create = gocdMapperCreator;
exports.readHistory = gocdMapper.readHistory;
