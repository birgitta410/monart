var context = createContext({});

context(['server/sources/gocd/pipelineRun'], function (pipelineRunCreator) {

  describe('historyEntryCreator', function () {
    it('should create initials of person that broke the pipeline run', function (done) {
      pipelineRunCreator.createNew({author: {
        name: 'Special Cäracter'
      }}).then(function (result) {
        expect(result.stages[0].author.initials).toBe('scx');
      });
      pipelineRunCreator.createNew({author: {
        name: 'Has Three Names'
      }}).then(function (result) {
        expect(result.stages[0].author.initials).toBe('htn');
      });
      pipelineRunCreator.createNew({author: {
        name: 'Max Mustermann'
      }}).then(function (result) {
        expect(result.stages[0].author.initials).toBe('mmu');
      });

      done();
    });
  });

});