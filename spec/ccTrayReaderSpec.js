var _ = require('lodash');
var fs = require('fs');
var theCcTrayReaderModule = require('../server/sources/cc/ccTrayReader.js');

describe('pipelineFeedReader', function () {
  describe('init()', function () {

    var theCcTrayReader
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
      theCcTrayReader = theCcTrayReaderModule.create(mockCcTrayRequestor);
    });

    it('should initialise the list of activities', function () {
      theCcTrayReader.readActivity(function(results) {
        // 12 = number of jobs
        expect(results.length).toBe(12);
      });
    });

  });
});