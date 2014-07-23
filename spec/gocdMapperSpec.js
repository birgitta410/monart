var _ = require('lodash');
var gocdMapperModule = require('../server/haring/gocdMapper');

describe('Go CD Mapper', function () {
  describe('mapPipelineDataToFigures()', function () {

    var theGocdMapper, thePipelineReader;
    var fakePipelineHistory;
    var mockTime = { format: function () { } };
    var notSuccessfulFn = function() { return false; };
    var successfulFn = function() { return true; };

    beforeEach(function() {
      thePipelineReader = {
        init: jasmine.createSpy('init'),
        readHistory: function(callback, callbackParameter) {
          callback(fakePipelineHistory, callbackParameter);
        }
      };
      theGocdMapper = gocdMapperModule.create(thePipelineReader);
    });

    it('should return crawling image if failed and previous one was failure as well', function () {
      fakePipelineHistory = {
        '125': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result).length).toBe(2);
        expect(result[0].type).toBe('crawling');
      });

    });

    it('should return flying image if previous failed, current is success', function () {
      // descending order, newest first
      fakePipelineHistory = {
        '124': { wasSuccessful: successfulFn, time: mockTime } ,
        '123': { wasSuccessful: notSuccessfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result).length).toBe(2);
        expect(result[0].type).toBe('flying');
      });

    });

    it('should return stumbling image if previous was successful', function () {
      // descending order, newest first
      fakePipelineHistory = {
        '124': { wasSuccessful: notSuccessfulFn, time: mockTime },
        '123': { wasSuccessful: successfulFn, time: mockTime }
      };
      theGocdMapper.readHistory(function(result) {
        expect(_.keys(result).length).toBe(2);
        expect(result[0].type).toBe('stumbling');
      });

    });

  });
});
