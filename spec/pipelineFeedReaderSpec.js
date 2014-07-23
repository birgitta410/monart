
var thePipelineFeedReaderModule = require('../server/sources/gocd/pipelineFeedReader.js');
var theAtomEntryParserModule = require('../server/sources/gocd/atomEntryParser.js');

describe('pipelineFeedReader', function () {
  describe('init()', function () {

    var thePipelineFeedReader
      , fs = require('fs')
      , xml2json = require('xml2json');

    beforeEach(function() {

      thePipelineFeedReader = thePipelineFeedReaderModule.create(xml2json, fs, theAtomEntryParserModule.create());
    });

    it('should initialise a set of 10 pipeline runs', function () {
      thePipelineFeedReader.init();
    });

  });
});
