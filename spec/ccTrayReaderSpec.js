
var xml = require('fs').readFileSync('spec/fixtures/cctray.xml');
var json = require('xml2json').toJson(xml, { object: true, sanitize: false });

var mockCcTrayRequestor = {
  get: function (callback) {
    callback(json);
  }
};

var configuration = {};
var mockConfig = {
  create: function() {
    return {
      get: function() {
        return configuration;
      }
    };
  }
};

var mocks = {
  'server/sources/cc/ccTrayRequestor': mockCcTrayRequestor,
  'server/sources/httpConfig': mockConfig
};

var context = createContext(mocks);


context(['lodash', 'server/sources/cc/ccTrayReader'], function(_, theCcTrayReader) {
  describe('ccTrayReader', function () {
    describe('init()', function () {

      beforeEach(function() {
        configuration.jobs = undefined;
      });

      it('should by default only use jobs, i.e. project names with 3 name elements', function () {
        // 6 = number of jobs
        theCcTrayReader.readActivity(function (result) {
          expect(result.jobs.length).toBe(12);
        });
      });

      it('should only read the jobs that are configured', function () {
        // 6 = number of jobs
        configuration.jobs = [ 'A-PIPELINE :: build' ];
        theCcTrayReader.readActivity(function (result) {
          expect(result.jobs.length).toBe(1);
        });
      });

      it('should support configuration of stage name and then choose all the jobs under that stage', function () {
        // 6 = number of jobs
        configuration.jobs = {
          '0': 'A-PIPELINE :: deploy-dev'
        };
        theCcTrayReader.readActivity(function (result) {
          expect(result.jobs.length).toBe(2);
        });
      });

      it('should stay the same number of activities when called twice', function () {
        theCcTrayReader.readActivity(function (result) {
          expect(result.jobs.length).toBe(12);
          theCcTrayReader.readActivity(function (result) {
            expect(result.jobs.length).toBe(12);
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