
var Q = require('q');
var mockPipelineReader, mockCcTrayReader, fakePipelineHistory, fakeActivity, fakeBuildNumberInProgress = '1239';

mockPipelineReader = {
  readHistory: function (options) {
    var defer = Q.defer();
    defer.resolve(fakePipelineHistory, options);
    return defer.promise;
  }
};

mockCcTrayReader = {
  readActivity: function (callback, options) {
    callback({ jobs: fakeActivity, buildNumberInProgress: fakeBuildNumberInProgress }, options ? options.callbackParameter : undefined);
  }
};

var mocks = {
  'server/sources/gocd/pipelineFeedReader': mockPipelineReader,
  'server/sources/cc/ccTrayReader': mockCcTrayReader
};

var context = createContext(mocks);

context(['lodash', 'server/miro/gocdMapper'], function(_, miroGocdMapper) {

  describe('Miro Go CD Mapper', function () {

    var notSuccessfulFn = function () {
      return false;
    };
    var successfulFn = function () {
      return true;
    };

    describe('mapPipelineData()', function () {

      beforeEach(function () {
        fakeActivity = [];
        fakePipelineHistory = {};
      });

      it('should set the stroke color to red if last build was unsuccessful', function () {
        fakePipelineHistory = {
          '125': { wasSuccessful: notSuccessfulFn },
          '124': { wasSuccessful: successfulFn }
        };
        miroGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.stroke.color).toBe('red');
        });

      });

      it('should set the stroke color to black if last build was successful', function () {
        fakePipelineHistory = {
          '125': { wasSuccessful: successfulFn },
          '124': { wasSuccessful: notSuccessfulFn }
        };
        miroGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.stroke.color).toBe('black');
        });

      });

      it('should set the size of stones according to the size of changes', function () {
        fakePipelineHistory = {
          '125': {
            wasSuccessful: notSuccessfulFn
          },
          '124': {
            wasSuccessful: notSuccessfulFn,
            materials: [
              {
                "stats": {
                  "total": 153,
                  "filesChanged": 10
                }
              }
            ]
          },
          '123': {
            wasSuccessful: notSuccessfulFn,
            materials: [
              {
                "stats": {
                  "total": 40,
                  "filesChanged": 2
                }
              }
            ]
          }
        };
        miroGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.stones[0].size).toBe('large');
          expect(result.stones[1].size).toBe('small');
        });

      });

    });

  });
});