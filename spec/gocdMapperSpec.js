
var gocdMapperModule = require('../server/haring/gocdMapper');

describe('mapper', function () {
  describe('mapPipelineDataToFigures()', function () {

    var theGocdMapper, thePipelineReader;
    var fakePipelineHistory;
    var mockTime = { format: function () { } };
    var notSuccessfulFn = function() { return false; };
    var successfulFn = function() { return true; };

    beforeEach(function() {
      thePipelineReader = {
        init: jasmine.createSpy('init'),
        readHistory: function(pipelineName, callback, callbackParameter) {
          callback(fakePipelineHistory, callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create(thePipelineReader);
    });

    it('should return crawling image if failure', function () {
      fakePipelineHistory = [{ wasSuccessful: notSuccessfulFn, time: mockTime }];
      theGocdMapper.readHistory(function(result) {
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('crawling');
      });

    });

    it('should return flying image if previous failed, current is success', function () {
      // descending order, newest first
      fakePipelineHistory = [
        { wasSuccessful: function() { return true; }, time: mockTime },
        { wasSuccessful: function() { return false; }, time: mockTime }
      ];
      theGocdMapper.readHistory(function(result) {
        expect(result.length).toBe(2);
        expect(result[0].type).toBe('flying');
      });

    });

  });
});
