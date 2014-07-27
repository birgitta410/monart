
var theAtomEntryParserModule = require('../server/sources/gocd/atomEntryParser.js');

describe('atomEntryParser', function () {

  var theAtomEntryParser;

  beforeEach(function() {
    theAtomEntryParser = theAtomEntryParserModule.create();
  });

  describe('withData()', function () {

    var id = 'http://the-go-host:8153/go/pipelines/A-PIPELINE/1199/functional-test/1';

    it('should set the pipeline name', function () {
      var entry = theAtomEntryParser.withData({ id: id });

      expect(entry.pipeline).toBe('A-PIPELINE');
    });

    it('should set the build number', function () {
      var entry = theAtomEntryParser.withData({ id: id });

      expect(entry.buildNumber).toBe('1199');
    });

    it('should set the stage name', function () {
      var entry = theAtomEntryParser.withData({ id: id });

      expect(entry.stageName).toBe('functional-test');
    });

    it('should set the run number', function () {
      var entry = theAtomEntryParser.withData({ id: id });

      expect(entry.runNumber).toBe('1');
    });

    it('should set the result of the stage', function () {
      // title: 'QEN(1197) stage build(1) Passed',
      var entry = theAtomEntryParser.withData({ title: 'QEN(1197) stage build(1) Passed' });

      expect(entry.result).toBe('passed');
    });

    it('should not set the name of the breaker if stage passed', function () {
      var entry = theAtomEntryParser.withData({ title: 'QEN(1197) stage build(1) Passed' });

      expect(entry.breaker).toBeUndefined();
    });

    it('should set the name of the breaker if stage failed', function () {
      var entry = theAtomEntryParser.withData({
        title: 'QEN(1197) stage build(1) Failed',
        author: {
          name: 'Max Mustermann <mmustermann@internet.se>'
        }
      });

      expect(entry.breaker).toContain('Max Mustermann');
    });

  });
});
