
function Miro(P) {
  console.log('drawing Miro')

  var trails = [];

  function getBezRand(){
    var gBezMaxRand = 300;
    return (Math.random()*gBezMaxRand)-gBezMaxRand/2;
  }

  function doBezTrail(startPt, endPt) {

    var ctrl1x = getBezRand();
    var ctrl1y = getBezRand();
    var ctrl2x = getBezRand();
    var ctrl2y = getBezRand();

    var ctrl1 = {x: startPt.x + ctrl1x, y: startPt.y + ctrl1y};
    var ctrl2 = {x: endPt.x + ctrl2x, y: endPt.y + ctrl2y};

    var endPt = {x: endPt.x, y: endPt.y};

    var bezPlot = new BezierPlotter(startPt, ctrl1, ctrl2, endPt);
    bezPlot.setupProps(50);

    var plottedPoints = bezPlot.plotPoints();
    console.log('bezier control points factors', ctrl1x, ctrl1y, ctrl2x, ctrl2y);
    console.log('number of points', plottedPoints.length);

    return {
      points: plottedPoints,
      start: startPt,
      end: endPt,
      ctrl1: {
        x: ctrl1.x,
        y: ctrl1.y
      },
      ctrl2: {
        x: ctrl2.x,
        y: ctrl2.y
      }
    };

  }

  function drawControlPoints() {

    _.each(trails, function(trail) {
      var redFactor = Math.min(255, (trail.id * 2 + 1) * 50);
      var greenFactor = Math.min(255, (trail.id * 2  + 1) * 60);
      var blueFactor = Math.min(255, (trail.id * 2  + 1) * 100);

      P.fill(redFactor, greenFactor, blueFactor);
      _.each(trail.points, function (point) {
        P.rect(point[0], point[1], 5, 5);
      });
      function orZero(value) {
        return value > 0 ? value : 0;
      }

      P.rect(orZero(trail.ctrl1.x), orZero(trail.ctrl1.y), 5, 5);
      P.rect(orZero(trail.ctrl2.x), orZero(trail.ctrl2.y), 5, 5);
    });

    P.noFill();
  }

  P.setup = function() {

    P.smooth(8);
    P.size(900, 700);

    trails = [
      doBezTrail({ x: 200, y: 100 }, { x: 500, y: 400}),
      doBezTrail({ x: 500, y: 400 }, { x: 800, y: 700})
    ];
    _.each(trails, function(trail, i) {
      trail.index = 0;
      trail.id = i;
    });

  };

  P.draw = function() {

    P.background(255);
    P.stroke(0, 0, 0);

    _.each(trails, function(trail) {
      P.bezier(trail.start.x, trail.start.y, trail.ctrl1.x, trail.ctrl1.y, trail.ctrl2.x, trail.ctrl2.y, trail.end.x, trail.end.y);

      drawControlPoints();

      P.ellipse(trail.points[trail.index][0], trail.points[trail.index][1], 20, 20);

      trail.index ++;
      if(trail.points.length <= trail.index) {
        trail.index = 0;
      }
    });


  };

}

function sketchProc(P) {
  Miro(P);
}

var canvas = document.getElementById("myCanvas");
// attaching the sketchProc function to the canvas
new Processing(canvas, sketchProc);