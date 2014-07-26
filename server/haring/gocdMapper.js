var _ = require('lodash');
var moment = require('moment');

function gocdMapperCreator(pipelineReader, ccTrayReader) {

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

  var readHistory = function(callWhenDone) {
    pipelineReader.readHistory(mapPipelineDataToFigures, { callbackParameter: callWhenDone });
  };

  var readActivity = function(callWhenDone) {
    ccTrayReader.readActivity(mapActivityDataToFigures, { callbackParameter: callWhenDone });
  };

  function getFigureType(entry, lastEntryWasSuccessful) {

    if(entry.wasSuccessful() && !lastEntryWasSuccessful) {
      return 'flying';
    } else if (entry.wasSuccessful()) {
      return 'walking';
    } else if ( ! entry.wasSuccessful() && !lastEntryWasSuccessful) {
      return 'crawling';
    } else {
      return 'stumbling';
    }
  }

  function getColor(entry) {
    if(entry.wasSuccessful()) {
      return colorsSuccess[Math.floor(Math.random()*colorsSuccess.length)];
    } else {
      return colorsFailure[Math.floor(Math.random()*colorsFailure.length)];
    }
  }

  function compareNumbers(a, b) {
    // JS does lexicographical sorting by default, need to sort by number
    return a - b;
  }

  function mapPipelineDataToFigures(history, callWhenDone) {

    function getInfo(historyEntry, buildNumber) {
      var theTime = moment(historyEntry.time).format('MMMM Do YYYY, h:mm:ss a');
      var theResult = historyEntry.wasSuccessful() ? 'Success' : 'Stage failed: ' + historyEntry.stageFailed;
      return '[' + buildNumber + '] ' + theTime + ' ' + theResult;
    }

    var keysDescending = _.keys(history).sort(compareNumbers).reverse();
    var figures = _.map(keysDescending, function(key, index) {
      var entry = history[key];
      var previous = index < keysDescending.length ? history[keysDescending[index + 1]] : undefined;

      return {
        color: getColor(entry),
        info: getInfo(entry, key),
        type: getFigureType(entry, previous ? previous.wasSuccessful() : true)
      };
    });

    var lastBuildSuccessful = history[keysDescending[0]].wasSuccessful();

    var changesExist = true;
    callWhenDone({
      background: lastBuildSuccessful ? 'green' : 'orange',
      figures: figures
    }, changesExist);
  }

  function mapActivityDataToFigures(activity, callWhenDone) {

    function getFigureTypeForActivity(entry) {

      if(entry.activity === 'Building') {
        return 'skating';
      } else {
        return getFigureType(entry, true);
      }
    }

    function getColor(entry) {
      if(entry.lastBuildStatus === 'Success') {
        return colorsSuccess[Math.floor(Math.random()*colorsSuccess.length)];
      } else if (entry.lastBuildStatus === 'Failure') {
        return colorsFailure[Math.floor(Math.random()*colorsFailure.length)];
      } else {
        return 'grey';
      }
    }

    function getInfo(entry) {
      if(entry.activity === 'Building') {
        return entry.name + ' is building';
      } else {
        return entry.name + ' ' + entry.lastBuildStatus;
      }
    }

    var figures = _.map(activity, function(entry) {
      return {
        color: getColor(entry),
        info: getInfo(entry),
        type: getFigureTypeForActivity(entry)
      }
    });

    var changesExist = true;
    callWhenDone({ figures: figures }, changesExist);
  }

  return {
    readHistory: readHistory,
    readActivity: readActivity
  }
}


var pipelineReader = require('../sources/gocd/pipelineFeedReader.js');
var ccTrayReader = require('../sources/cc/ccTrayReader.js');
var gocdMapper = gocdMapperCreator(pipelineReader, ccTrayReader);

exports.create = gocdMapperCreator;
exports.readHistory = gocdMapper.readHistory;
exports.readActivity = gocdMapper.readActivity;
