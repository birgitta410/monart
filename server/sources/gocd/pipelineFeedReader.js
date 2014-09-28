
define(['q', 'lodash', 'server/sources/gocd/pipelineRun', 'server/sources/gocd/gocdRequestor', 'server/sources/gocd/atomEntryParser'],
  function (Q, _, pipelineRunCreator, gocdRequestor, atomEntryParser) {

  var pipelineRuns = { };
  var alreadyPromised = [];

  var MIN_NUMBER_PIPELINE_RUNS = 25;

  var requestStages = function (next) {

    return gocdRequestor.get(next).then(function(json) {
      json.feed.entry = _.map(json.feed.entry, function(entry) {
        return atomEntryParser.withData(entry);
      });
      return json;
    });

  };

  var readPipelineRuns = function (options, originalDefer) {

    var defer = originalDefer || Q.defer();

    options = options || {};
    options.exclude = options.exclude || [];

    requestStages(options.nextUrl).then(function (result) {

      if (result !== undefined) {

        var pipelineRunPromises = _.map(result.feed.entry, function (entry) {
            if(!_.contains(alreadyPromised, entry.buildNumber)) {
              alreadyPromised.push(entry.buildNumber);
              return pipelineRunCreator.createNew(entry);
            } else {
              return undefined;
            }
          }
        );

        pipelineRunPromises = _.compact(pipelineRunPromises);

        Q.all(pipelineRunPromises).then(function(pipelineRunResults) {
          _.each(pipelineRunResults, function(pipelineRun) {
            pipelineRuns[pipelineRun.buildNumber] = pipelineRuns[pipelineRun.buildNumber] || pipelineRun;
          });

          pipelineRuns = _.omit(pipelineRuns, function (value, key) {
            return _.contains(options.exclude, key);
          });

          var nextLink = _.find(result.feed.link, { rel: 'next' });

          if (nextLink && _.keys(pipelineRuns).length < MIN_NUMBER_PIPELINE_RUNS) {
            var nextUrl = nextLink.href;
            readPipelineRuns(_.extend(options, { nextUrl: nextUrl }), defer);
          } else {
            defer.resolve(pipelineRuns);
          }

        }, defer.reject);

      } else {
        defer.resolve({});
      }

    }, defer.reject);

    return defer.promise;

  };

  var clear = function() {
    pipelineRuns = {};
    alreadyPromised = [];
  };

  return {
    readPipelineRuns: readPipelineRuns,
    clear: clear
  };

});
