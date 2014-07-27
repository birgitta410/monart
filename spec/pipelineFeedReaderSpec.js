var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');

var thePipelineFeedReaderModule = require('../server/sources/gocd/pipelineFeedReader.js');
var theAtomEntryParserModule = require('../server/sources/gocd/atomEntryParser.js');

describe('pipelineFeedReader', function () {
  describe('readHistory()', function () {

    var thePipelineFeedReader
      , mockGocdRequestor
      , xml2json = require('xml2json');

    beforeEach(function() {
      mockGocdRequestor = {
        get: function(next, callback) {
          var source = next ? next : 'spec/fixtures/pipeline-stages.xml';
          var xml = fs.readFileSync(source);
          var json = xml2json.toJson(xml, { object: true, sanitize: false });
          callback(json);

        }
      };

      thePipelineFeedReader = thePipelineFeedReaderModule.create(mockGocdRequestor, theAtomEntryParserModule.create());

    });

    it('should initialise a set of pipeline runs', function () {
      thePipelineFeedReader.readHistory(function(results) {
        expect(_.keys(results).length).toBe(11); //1199 - 1189
        expect(results['1199']).toBeDefined();
      });
    });

    it('should pass through a parameter for the callback', function () {
      thePipelineFeedReader.readHistory(function(results, parameter) {
        expect(parameter).toBe('aParameter');
      }, { callbackParameter: 'aParameter' });
    });

    it('should pass no url to the requestor in initial call', function () {
      spyOn(mockGocdRequestor, 'get');
      thePipelineFeedReader.readHistory(function(results, parameter) { });
      expect(mockGocdRequestor.get).toHaveBeenCalledWith(undefined, jasmine.any(Function));
    });

    it('should pass a next url to the requestor', function () {
      spyOn(mockGocdRequestor, 'get');
      thePipelineFeedReader.readHistory(function(results, parameter) { }, {
        callbackParameter: 'aParameter',
        nextUrl: 'nextUrl'
      });
      expect(mockGocdRequestor.get).toHaveBeenCalledWith('nextUrl', jasmine.any(Function));
    });

    it('should determine the time the last stage finished', function () {
      thePipelineFeedReader.readHistory(function(results) {
        var expectedTime = moment('2014-07-18T16:08:39+00:00');
        var actualTime = moment(results['1199'].time);
        expect(actualTime.hours()).toBe(expectedTime.hours());
        expect(actualTime.minutes()).toBe(expectedTime.minutes());
        expect(actualTime.seconds()).toBe(expectedTime.seconds());
      });
    });

    it('should determine the result of the pipeline', function () {
      thePipelineFeedReader.readHistory(function(results) {
        expect(results['1199'].result).toBe('passed');
        expect(results['1195'].result).toBe('failed');
      });
    });

    it('should determine the breaker of the failed job', function () {
      thePipelineFeedReader.readHistory(function(results) {
        expect(results['1199'].result).toBe('passed');
        expect(results['1199'].breaker).toBeUndefined();
        expect(results['1195'].result).toBe('failed');
        expect(results['1195'].breaker).toContain('Max Mustermann');
      });
    });

    xit('should not add the same entries again when called twice', function () {
      thePipelineFeedReader.readHistory(function(results) {
        expect(_.keys(results).length).toBe(11);
        expect(results['1199'].stages.length).toBe(5);

        thePipelineFeedReader.readHistory(function(results) {
          expect(_.keys(results).length).toBe(11);
          expect(results['1199'].stages.length).toBe(5);
        });

      });
    });

  });
});
