
define(['q', 'lodash', 'moment', 'cheerio', 'server/sources/gocd/gocdRequestor', 'server/sources/github/githubRequestor', 'server/sources/gocd/atomEntryParser'],
  function (Q, _, moment, cheerio, gocdRequestor, githubRequestor, atomEntryParser) {

  var pipelineHistory = { };
  var alreadyPromised = [];

  var MIN_NUMBER_HISTORY = 25;

  var historyEntryCreator = function() {

    var HistoryEntryCreator = {};

    HistoryEntryCreator.createNew = function (feedEntry) {
      var defer = Q.defer();

      var historyEntry = {};
      historyEntry.buildNumber = feedEntry.buildNumber;
      historyEntry.stages = historyEntry.stages || [];
      historyEntry.stages.push(feedEntry);

      historyEntry.mapPipelineFinishTime = function () {
        if (historyEntry.time !== undefined) {
          return;
        }

        var lastFinishedStage = _.sortBy(historyEntry.stages, function (stage) {
          return stage.updated;
        })[historyEntry.stages.length - 1];
        historyEntry.time = lastFinishedStage.updated;
      };

      historyEntry.mapInfoText = function () {
        if (historyEntry.info !== undefined) {
          return;
        }

        var lastCommitMaterial = _.last(historyEntry.materials);

        var theCommit = lastCommitMaterial ? lastCommitMaterial.comment : 'Unknown change';
        var theTime = moment(historyEntry.time).format('MMMM Do YYYY, h:mm:ss a');
        var theAuthor = historyEntry.author ? historyEntry.author.name : 'Unknown author';
        var theResult = historyEntry.wasSuccessful() ? 'Success' : historyEntry.stageFailed;
        historyEntry.info = '[' + historyEntry.buildNumber + '] ' + theTime + ' | ' + theResult + ' | ' + theCommit + ' | ' + theAuthor;

      };

      historyEntry.getLatestRunsOfStages = function () {
        var stages = historyEntry.stages;
        var allStageNames = _.unique(_.map(stages, function (stage) {
          return stage.stageName;
        }));
        return _.map(allStageNames, function (stageName) {
          var allEntriesForStage = _.where(stages, { 'stageName': stageName });
          allEntriesForStage = _.sortBy(allEntriesForStage, 'runNumber').reverse();
          return allEntriesForStage[0];
        });
      };

      historyEntry.mapPipelineAuthor = function () {

        if (historyEntry.author !== undefined) {
          return;
        }

        function getInitialsOfAuthor(author) {

          function onlyAtoZ(character) {
            var isLetter = character.toLowerCase() >= "a" && character.toLowerCase() <= "z";
            if (!isLetter) {
              return 'x';
            } else {
              return character;
            }
          }

          if (author.name !== undefined) {
            var nameParts = author.name.split(' ');

            var initials = _.map(nameParts, function (namePart, index) {
              if (index !== nameParts.length - 1) {
                return onlyAtoZ(namePart[0]);
              } else {
                return onlyAtoZ(namePart[0]) + onlyAtoZ(namePart[1]);
              }
            }).join('');

            return initials.toLowerCase().substr(0, 3);
          }
        }

        var firstStage = _.first(historyEntry.stages);

        _.extend(historyEntry, {
          author: firstStage.author
        });
        historyEntry.author.initials = getInitialsOfAuthor(firstStage.author);

      };

      historyEntry.mapPipelineResult = function () {
        if (historyEntry.result !== undefined) {
          return;
        }

        var lastRuns = historyEntry.getLatestRunsOfStages();

        var failedStages = _.where(lastRuns, { result: 'failed' });

        if (failedStages.length > 0) {
          _.extend(historyEntry, {
            result: 'failed',
            stageFailed: failedStages[0].stageName
          });
        } else {
          historyEntry.result = 'passed';
        }
        historyEntry.wasSuccessful = function () {
          return historyEntry.result === 'passed';
        };

      };

      historyEntry.enrichWithCommitDetails = function () {

        if (historyEntry.materials !== undefined) {
          return;
        }

        function withoutTimestamp(data) {
          return data.indexOf('on 2') === -1 ? data : data.slice(0, data.indexOf('on 2')).trim();
        }

        function addCommitDetails(material) {
          return githubRequestor.getCommitStats(material.sha).then(function (stats) {
            material.stats = stats;
            return material;
          });
        };

        function getMaterials(stageId) {
          return gocdRequestor.getMaterialHtml(stageId).then(function (html) {
            var $ = cheerio.load(html);
            try {
              var changes = $('.material_tab .change');

              return _.map(changes, function (change) {
                var modifiedBy = withoutTimestamp($(change).find('.modified_by dd')[0].children[0].data);
                var comment = $(change).find('.comment p')[0].children[0].data;
                var sha = $(change).find('.revision dd')[0].children[0].data;
                var material = {
                  buildNumber: historyEntry.buildNumber,
                  comment: comment,
                  committer: modifiedBy,
                  sha: sha
                };
                return material;
              });

            } catch (error) {
              console.log('ERROR loading material', error);
            }
          });
        }

        return getMaterials(historyEntry.stages[0].id)
          .then(function (materials) {
            var commitPromises = _.map(materials, function (material) {
              return addCommitDetails(material);
            });
            return Q.all(commitPromises);
          });

      };

      var commitDetailsPromises = historyEntry.enrichWithCommitDetails();

      historyEntry.mapPipelineFinishTime();
      historyEntry.mapPipelineResult();
      historyEntry.mapPipelineAuthor();

      Q.all(commitDetailsPromises).then(function (details) {
        historyEntry.materials = details;
        try {
          historyEntry.mapInfoText();

          defer.resolve(historyEntry);
        } catch(err) {
          defer.reject();
        }

      }, function(err) {
        console.log('could not resolve details, returning without', historyEntry.buildNumber, err);

        historyEntry.mapInfoText();
        defer.resolve(historyEntry);
      });

      return defer.promise;

    };

    return HistoryEntryCreator;

  }();

  var requestStages = function (next) {
    var defer = Q.defer();

    gocdRequestor.get(next).then(function(json) {
      json.feed.entry = _.map(json.feed.entry, function(entry) {
        return atomEntryParser.withData(entry);
      });
      defer.resolve(json);
    }, defer.reject);

    return defer.promise;
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
