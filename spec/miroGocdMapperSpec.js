
var mockPipelineReader, mockCcTrayReader, fakePipelineHistory, fakeActivity, fakeBuildNumberInProgress = '1239';
var mockTime = { format: function () { } };

mockPipelineReader = {
  readHistory: function (callback, options) {
    callback(fakePipelineHistory, options ? options.callbackParameter : undefined);
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
          '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
          '124': { wasSuccessful: successfulFn, time: mockTime }
        };
        miroGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.stroke.color).toBe('red');
        });

      });

      it('should set the stroke color to black if last build was successful', function () {
        fakePipelineHistory = {
          '125': { wasSuccessful: successfulFn, time: mockTime },
          '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
        };
        miroGocdMapper.readHistoryAndActivity(function (result) {
          expect(result.stroke.color).toBe('black');
        });

      });

    });

  });
});