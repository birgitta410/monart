
define(['q', 'lodash', 'server/sources/gocd/historyEntry', 'server/sources/gocd/gocdRequestor', 'server/sources/gocd/atomEntryParser'],
  function (Q, _, historyEntryCreator, gocdRequestor, atomEntryParser) {

  var pipelineHistory = { };
  var alreadyPromised = [];

  var MIN_NUMBER_HISTORY = 25;

  var requestStages = function (next) {

    return gocdRequestor.get(next).then(function(json) {
      json.feed.entry = _.map(json.feed.entry, function(entry) {
        return atomEntryParser.withData(entry);
      });
      return json;
    });

  };

  var readHistory = function (options, originalDefer) {

    var defer = originalDefer || Q.defer();

    options = options || {};
    options.exclude = options.exclude || [];

    requestStages(options.nextUrl).then(function (result) {

      if (result !== undefined) {

        var historyPromises = _.map(result.feed.entry, function getHistoryPromise(entry) {
            if(!_.contains(alreadyPromised, entry.buildNumber)) {
              alreadyPromised.push(entry.buildNumber);
              return historyEntryCreator.createNew(entry);
            } else {
              return undefined;
            }
          }
        );

        historyPromises = _.compact(historyPromises);

        Q.all(historyPromises).then(function(historyEntries) {
          _.each(historyEntries, function(historyEntry) {
            pipelineHistory[historyEntry.buildNumber] = pipelineHistory[historyEntry.buildNumber] || historyEntry;
          });

          pipelineHistory = _.omit(pipelineHistory, function (value, key) {
            return _.contains(options.exclude, key);
          });

          var nextLink = _.find(result.feed.link, { rel: 'next' });

          if (nextLink && _.keys(pipelineHistory).length < MIN_NUMBER_HISTORY) {
            var nextUrl = nextLink.href;
            readHistory(_.extend(options, { nextUrl: nextUrl }), defer);
          } else {
            defer.resolve(pipelineHistory);
          }

        }, defer.reject);

      } else {
        defer.resolve({});
      }

    }, defer.reject);

    return defer.promise;

  };

  var clear = function() {
    pipelineHistory = {};
    alreadyPromised = [];
  };

  return {
    readHistory: readHistory,
    clear: clear
  };

});
