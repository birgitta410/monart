var context = createContext({});

context(['server/sources/gocd/historyEntry'], function (historyEntryCreator) {

    describe('historyEntryCreator', function () {
      it('should create initials of person that broke the pipeline run', function (done) {
        historyEntryCreator.createNew({author: {
          name: 'Special Cäracter'
        }}).then(function (result) {
          expect(result.stages[0].author.initials).toBe('scx');
        });
        historyEntryCreator.createNew({author: {
          name: 'Has Three Names'
        }}).then(function (result) {
          expect(result.stages[0].author.initials).toBe('htn');
        });
        historyEntryCreator.createNew({author: {
          name: 'Max Mustermann'
        }}).then(function (result) {
          expect(result.stages[0].author.initials).toBe('mmu');
        });

        done();
      });
    });

});