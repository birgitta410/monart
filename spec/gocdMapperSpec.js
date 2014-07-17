
var gocdMapperModule = require('../server/haring/gocdMapper');

describe('mapper', function () {
  describe('mapPipelineDataToFigures()', function () {

    var theGocdMapper, thePipelineReader;
    var fakeHistory;

    beforeEach(function() {
      thePipelineReader = {
        init: jasmine.createSpy('init'),
        readHistory: function(pipelineName, callback, callbackParameter) {
          callback(fakeHistory, callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create(thePipelineReader);
    });

    it('should return crawling image if failure', function () {
      fakeHistory = [{ result: 'failed', wasSuccessful: function() { return false; }, time: { format: function() {} } }];
      theGocdMapper.readHistory(function(result) {
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('crawling');
      });

    });
  });
});
