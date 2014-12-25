
var Q = require('q');
var _ = require('lodash');

describe('Haring Go CD Mapper Sample Integration', function () {

  var haringGocdMapper;

  beforeEach(function() {
    var mockery = require('mockery');

    var mockConfig = {
      create: function () {
        return {
          get: function() {
            return {
              sample: true
            };
          }
        };
      }
    };

    mockery.enable({
      warnOnUnregistered: false,
      warnOnReplace: false
    });
    mockery.registerMock('./ymlHerokuConfig', mockConfig);

    haringGocdMapper = require('../server/haring/gocdMapper');

  });

  describe('readHistoryAndActivity()', function() {

    it('should set the background colour to green if successful', function(done) {

      haringGocdMapper.readHistoryAndActivity().then(function(result) {
        expect(result).toBeDefined();
        done();
      });
    });

  });


});
