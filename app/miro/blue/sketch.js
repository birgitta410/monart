
function MiroBlue(P, model) {
  console.log('drawing MiroBlue');

  var images;

  var COLORS = {
    red: {r: 198, g: 45, b: 39},
    black: {r: 0, g: 0, b: 0},
    white: {r: 255, g: 255, b: 255},
    green: {r: 91, g: 143, b: 68},
    blue: {r: 60, g: 67, b: 137},
    yellow: {r: 244, g: 214, b: 64}
  };

  function color(pFct, color) {
    pFct(color.r, color.g, color.b);
  }

  P.setup = function() {

    P.smooth(8);
    P.size(700*1.6, 700, P.P2D);

    images = {
      background: P.loadImage('images/background.png', 'png'),
      strokes: {
        red: P.loadImage('images/stroke_red.png', 'png'),
        black: P.loadImage('images/stroke_black.png', 'png'),
        white: P.loadImage('images/stroke_white.png', 'png')
      },
      stones: {
        red: {
          small: P.loadImage('images/small_red.png', 'png'),
          medium: P.loadImage('images/medium_red.png', 'png'),
          large: P.loadImage('images/large_red.png', 'png')
        },
        black: {
          small: P.loadImage('images/small_black.png', 'png'),
          medium: P.loadImage('images/medium_black.png', 'png'),
          large: P.loadImage('images/large_black.png', 'png')
        },
        white: {
          small: P.loadImage('images/small_white.png', 'png'),
          medium: P.loadImage('images/medium_white.png', 'png'),
          large: P.loadImage('images/large_white.png', 'png')
        }
      }
    };
  };

  P.draw = function() {

    P.background(255);
    P.image(images.background, 0, 0);
    images.strokes.red.resize(200, 600);
    P.image(images.strokes.red, 50, 50);

    var offset = 250;
    _.each(model.history, function(entry) {
      var stone = images.stones[entry.color][entry.size];
      P.image(stone, offset, 590 - stone.height);
      offset += stone.width + 50;
    });

  };

}

var miroModel = {
  history: [
    {size: 'small', color: 'black' },
    {size: 'large', color: 'white' },
    {size: 'small', color: 'black' }
  ]
};

function sketchProc(P) {
  MiroBlue(P, miroModel);
}

new Processing('miroCanvas', sketchProc);

function processNewDataMiroBlue(historyData) {
  miroModel.history = historyData.history;
}

new MonartDataSource('miroBlue',
  processNewDataMiroBlue,
  function() { console.log('no connection!'); },
  function(error) { console.log('TODO: show error in UI', error); }
);