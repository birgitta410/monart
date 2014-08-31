
var fs = require('fs');
var xml2json = require('xml2json');

var xml = fs.readFileSync('spec/fixtures/cctray.xml');
var json = xml2json.toJson(xml, { object: true, sanitize: false });

mockCcTrayRequestor = {
  get: function (callback) {
    callback(json);
  }
};
var mocks = {
  'server/sources/cc/ccTrayRequestor': mockCcTrayRequestor
};

var context = createContext(mocks);


context(['lodash', 'server/sources/cc/ccTrayReader'], function(_, theCcTrayReader) {
  describe('ccTrayReader', function () {
    describe('init()', function () {

      it('should initialise the list of activities', function () {
        theCcTrayReader.readActivity(function (result) {
          // 6 = number of jobs
          expect(result.jobs.length).toBe(6);
        });
      });

      it('should stay the same number of activities when called twice', function () {
        theCcTrayReader.readActivity(function (result) {
          expect(result.jobs.length).toBe(6);
          theCcTrayReader.readActivity(function (result) {
            expect(result.jobs.length).toBe(6);
          });
        });
      });

      it('should parse the breaker\'s name/email from messages', function () {
        theCcTrayReader.readActivity(function (result) {
          expect(result.jobs[5].breaker.name).toContain('Maria Mustermann');
          expect(result.jobs[5].breaker.email).toContain('internet');
        });
      });

      it('should provide id of pipeline that is currently building', function () {
        theCcTrayReader.readActivity(function (result) {
          expect(result.buildNumberInProgress).toBe('1239');
        });
      });

    });
  });
});