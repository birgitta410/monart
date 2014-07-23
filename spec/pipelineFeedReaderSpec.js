var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');
var thePipelineFeedReaderModule = require('../server/sources/gocd/pipelineFeedReader.js');
var theAtomEntryParserModule = require('../server/sources/gocd/atomEntryParser.js');

describe('pipelineFeedReader', function () {
  describe('init()', function () {

    var thePipelineFeedReader
      , mockGocdRequestor
      , xml2json = require('xml2json');

    beforeEach(function() {
      var xml = fs.readFileSync('spec/fixtures/pipeline-stages.xml');
      var json = xml2json.toJson(xml, { object: true, sanitize: false });

      mockGocdRequestor = {
        get: function(callback) {
          callback(json);
        }
      };
      thePipelineFeedReader = thePipelineFeedReaderModule.create(xml2json, mockGocdRequestor, theAtomEntryParserModule.create());
    });

    it('should initialise a set of pipeline runs', function () {
      thePipelineFeedReader.init();
      thePipelineFeedReader.readHistory(function(results) {
        expect(_.keys(results).length).toBeGreaterThan(0);
        expect(results['1199']).toBeDefined();
      });
    });

    it('should determine the time the last stage finished', function () {
      thePipelineFeedReader.init();
      thePipelineFeedReader.readHistory(function(results) {
        var expectedTime = moment('2014-07-18T16:08:39+00:00');
        var actualTime = moment(results['1199'].time);
        expect(actualTime.hours()).toBe(expectedTime.hours());
        expect(actualTime.minutes()).toBe(expectedTime.minutes());
        expect(actualTime.seconds()).toBe(expectedTime.seconds());
      });
    });

    it('should determine the result of the pipeline', function () {
      thePipelineFeedReader.init();
      thePipelineFeedReader.readHistory(function(results) {
        expect(results['1199'].result).toBe('passed');
        expect(results['1195'].result).toBe('failed');
      });
    });

  });
});
