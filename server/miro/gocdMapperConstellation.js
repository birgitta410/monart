var _ = require('lodash');

function miroGocdMapperConstellationModule() {

  var readHistoryAndActivity = function(data) {

    var history = data.history;

    var keysDescending = _.keys(history).sort(function(a, b) {
      return a - b; // JS does lexicographical sorting by default, need to sort by number
    }).reverse();
    var lastBuild = history[keysDescending[0]];

    var finalShapes = {};

    finalShapes.stroke = {
      color: lastBuild.wasSuccessful() ? 'green' : 'red',
      info: lastBuild.info
    };

    finalShapes.history = _.map(keysDescending.splice(1), function(key) {
      var entry = history[key];

      var size = entry['build_cause'].files ? entry['build_cause'].files.length : 0;
      return {
        size: size,
        color: entry.wasSuccessful() ? 'green' : 'red',
        info: entry.info + ' ' + (entry['build_cause'].files ? entry['build_cause'].files.length + ' changes' : 'no changes')
      };
    });

    return finalShapes;

  };

  return {
    readHistoryAndActivity: readHistoryAndActivity
  }
}

exports.readHistoryAndActivity = miroGocdMapperConstellationModule().readHistoryAndActivity;
