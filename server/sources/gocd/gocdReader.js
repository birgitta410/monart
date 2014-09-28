
var gocdMapper = function(_, moment, pipelineReader, ccTrayReader) {

  var readData = function() {
    return ccTrayReader.readActivity().then(function(activity) {

      return pipelineReader.readHistory({ exclude: [ activity.buildNumberInProgress] }).then(function(history) {
        return {
          activity: activity,
          history: history
        };
      });

    });
  };

  return {
    readData: readData
  }
};

define(['lodash', 'moment', 'server/sources/gocd/pipelineFeedReader', 'server/sources/cc/ccTrayReader'], gocdMapper);