
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

    it('should return crawling image if failed and at least two previous ones were failures', function () {
      fakePipelineHistory = [
        { wasSuccessful: notSuccessfulFn, time: mockTime },
        { wasSuccessful: notSuccessfulFn, time: mockTime },
        { wasSuccessful: notSuccessfulFn, time: mockTime },
      ];
      theGocdMapper.readHistory(function(result) {
        expect(result.length).toBe(3);
        expect(result[0].type).toBe('crawling');
      });

    });

    it('should return flying image if previous failed, current is success', function () {
      // descending order, newest first
      fakePipelineHistory = [
        { wasSuccessful: successfulFn, time: mockTime },
        { wasSuccessful: notSuccessfulFn, time: mockTime }
      ];
      theGocdMapper.readHistory(function(result) {
        expect(result.length).toBe(2);
        expect(result[0].type).toBe('flying');
      });

    });

    it('should return stumbling image if previous was successful', function () {
      // descending order, newest first
      fakePipelineHistory = [
        { wasSuccessful: notSuccessfulFn, time: mockTime },
        { wasSuccessful: successfulFn, time: mockTime }
      ];
      theGocdMapper.readHistory(function(result) {
        expect(result.length).toBe(2);
        expect(result[0].type).toBe('stumbling');
      });

    });

  });
});
