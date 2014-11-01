
var context = createContext({});

context(['lodash', 'moment', 'server/sources/gocd/pipelineFeedReader', 'server/sources/gocd/gocdRequestor', 'server/sources/github/githubRequestor'],
  function(_, moment, thePipelineFeedReader, gocdRequestor, githubRequestor) {

  var NUM_ENTRIES_IN_FIXTURE = 12;

  beforeEach(function() {
    gocdRequestor.get = gocdRequestor.getSample;
    gocdRequestor.getStageDetails = gocdRequestor.getSampleStageDetails;
    gocdRequestor.getMaterialHtml = gocdRequestor.getSampleMaterialHtml;
    githubRequestor.getCommitStats = githubRequestor.getSampleCommitStats
  });

  describe('pipelineFeedReader', function () {
    beforeEach(function() {
      thePipelineFeedReader.clear();
    });

    describe('readHistory()', function () {

      it('should log an example to the console, for documentation purposes', function (done) {

        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          var keys = _.keys(results);
          var dataToLog = {};
          results[keys[0]].stages = [ results[keys[0]].stages[0]];
          dataToLog[keys[0]] = results[keys[0]];

          console.log('SAMPLE HISTORY PARSED FROM go PIPELINE FEED', JSON.stringify(dataToLog, undefined, 2));
          done();
        });
      });

      it('should initialise a set of pipeline runs', function (done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(_.keys(results).length).toBe(NUM_ENTRIES_IN_FIXTURE);
          expect(results['1199']).toBeDefined();
          done();
        });

      });

      it('should exclude pipelines if specified', function(done) {
        thePipelineFeedReader.readPipelineRuns({ exclude: ['1199', '1198'] }).then(function (results) {
          expect(_.keys(results).length).toBe(NUM_ENTRIES_IN_FIXTURE - 2);

          done();
        });
      });

      it('should cache pipeline run even if its excluded in results when first present', function(done) {
        thePipelineFeedReader.readPipelineRuns({ exclude: ['1199'] }).then(function (results) {
          expect(_.keys(results).length).toBe(NUM_ENTRIES_IN_FIXTURE - 1);

          thePipelineFeedReader.readPipelineRuns().then(function (results) {
            expect(_.keys(results).length).toBe(NUM_ENTRIES_IN_FIXTURE);
            expect(results['1199']).toBeDefined();
            done();
          });

        });
      });

      it('should pass no url to the requestor in initial call', function(done) {
        spyOn(gocdRequestor, 'get').andCallThrough();
        thePipelineFeedReader.readPipelineRuns().then(function () {
          done();
        });
        expect(gocdRequestor.get.mostRecentCall.args[0]).toBeUndefined();
      });

      it('should be able to handle a non existing file passed as a next url to the requestor', function(done) {
        spyOn(gocdRequestor, 'get').andCallThrough();
        var options = {
          nextUrl: 'nextUrl'
        };
        thePipelineFeedReader.readPipelineRuns(options).then(function () {}, function() {
          done();
          expect(gocdRequestor.get.mostRecentCall.args[0]).toBe('nextUrl');
        });

      });

      it('should add stages to respective pipeline runs', function (done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].stages.length).toBe(5);
          done();
        });

      });

      it('should determine the time the last stage finished', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          var expectedTime = moment('2014-07-18T16:08:39+00:00');
          var actualTime = moment(results['1199'].time);
          expect(actualTime.hours()).toBe(expectedTime.hours());
          expect(actualTime.minutes()).toBe(expectedTime.minutes());
          expect(actualTime.seconds()).toBe(expectedTime.seconds());

          done();
        });
      });

      it('should determine the result of the pipeline', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].result).toBe('passed');
          expect(results['1195'].result).toBe('failed');

          done();
        });
      });

      it('should say a pipeline passed when a job was rerun and passed the second time', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1198'].result).toBe('passed');

          done();
        });
      });

      it('should determine the author of a job', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].result).toBe('passed');
          expect(results['1199'].author).toBeDefined();
          expect(results['1199'].author.name).toContain('Max Mustermann');
          expect(results['1195'].result).toBe('failed');
          expect(results['1195'].author.name).toContain('Max Mustermann');

          done();
        });
      });

      it('should parse committer and commit message from material HTML', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].materials.length).toBe(2);
          expect(results['1199'].materials[0].committer).toContain('Max Mustermann');
          expect(results['1199'].materials[0].comment).toContain('awesome');
          expect(results['1199'].materials[0].sha).toBe('074cc70d464ad708c82bc6316f6c21ee35cffdcf');
          expect(results['1199'].materials[1].sha).toBe('185cc70d464ad708c82bc6316f6c21ee35cffdcf');

          done();
        });
      });

      it('should get commit stats from github', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].materials.length).toBe(2);
          expect(results['1199'].materials[0].stats).toBeDefined();

          done();
        });
      });

      it('should not request material info again if already set in previous call', function(done) {
        spyOn(gocdRequestor, 'getMaterialHtml').andCallThrough();
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].materials).toBeDefined();
          expect(gocdRequestor.getMaterialHtml.callCount).toBe(NUM_ENTRIES_IN_FIXTURE);
          thePipelineFeedReader.readPipelineRuns().then(function (results) {
            expect(results['1199'].materials).toBeDefined();
            expect(gocdRequestor.getMaterialHtml.callCount).toBe(NUM_ENTRIES_IN_FIXTURE);

            done();
          });
        });

      });

      it('should put author and commit message into info text, if present', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].info).toContain('Mustermann');
          expect(results['1199'].info).toContain('second change');

          done();
        });
      });

      it('should create initials of person that authored changes for a failed job', function(done) {
        thePipelineFeedReader.readPipelineRuns().then(function (results) {
          expect(results['1199'].author.initials).toContain('mmu');

          done();
        });
      });

    });
  });
});