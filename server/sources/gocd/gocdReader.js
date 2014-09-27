
var gocdMapper = function(_, moment, pipelineReader, ccTrayReader) {
  var readData = function(callWhenDone) {
    ccTrayReader.readActivity(function(activity) {

      pipelineReader.readHistory({ exclude: [ activity.buildNumberInProgress] }).then(function(history) {

        var result = {
          activity: activity,
          history: history
        };

        callWhenDone(result);

      });

    });
  };

  return {
    readData: readData
  }
};

define(['lodash', 'moment', 'server/sources/gocd/pipelineFeedReader', 'server/sources/cc/ccTrayReader'], gocdMapper);