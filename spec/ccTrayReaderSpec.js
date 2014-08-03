var _ = require('lodash');
var fs = require('fs');
var theCcTrayReaderModule = require('../server/sources/cc/ccTrayReader.js');
var theGoCdAtomEntryParserModule = require('../server/sources/gocd/atomEntryParser.js');

describe('ccTrayReader', function () {
  describe('init()', function () {

    var theCcTrayReader
      , theGoCdAtomEntryParser
      , mockCcTrayRequestor
      , xml2json = require('xml2json');

    beforeEach(function () {
      var xml = fs.readFileSync('spec/fixtures/cctray.xml');
      var json = xml2json.toJson(xml, { object: true, sanitize: false });

      mockCcTrayRequestor = {
        get: function (callback) {
          callback(json);
        }
      };
      theGoCdAtomEntryParser = theGoCdAtomEntryParserModule.create();
      theCcTrayReader = theCcTrayReaderModule.create(mockCcTrayRequestor, theGoCdAtomEntryParser);
    });

    it('should initialise the list of activities', function () {
      theCcTrayReader.readActivity(function(result) {
        // 6 = number of jobs
        expect(result.jobs.length).toBe(6);
      });
    });

    it('should stay the same number of activities when called twice', function () {
      theCcTrayReader.readActivity(function(result) {
        expect(result.jobs.length).toBe(6);
        theCcTrayReader.readActivity(function(result) {
          expect(result.jobs.length).toBe(6);
        });
      });
    });

    it('should parse the breaker\'s name/email from messages', function () {
      theCcTrayReader.readActivity(function(result) {
        expect(result.jobs[5].breaker.name).toContain('Maria Mustermann');
        expect(result.jobs[5].breaker.email).toContain('internet');
      });
    });

    it('should provide id of pipeline that is currently building', function () {
      theCcTrayReader.readActivity(function(result) {
        expect(result.buildNumberInProgress).toBe('1239');
      });
    });

  });
});