
function Miro(P) {
  console.log('drawing Miro')

  var trails = [];

  function getBezRand(){
    var gBezMaxRand = 300;
    return (Math.random()*gBezMaxRand)-gBezMaxRand/2;
  }

  function doBezTrail(startPt, ctrl1, ctrl2, endPt) {

    var endPt = {x: endPt.x, y: endPt.y};

    var bezPlot = new BezierPlotter(startPt, ctrl1, ctrl2, endPt);
    bezPlot.setupProps(50);

    var plottedPoints = bezPlot.plotPoints();
    console.log('bezier control points factors', ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y);
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

  function doBezTrailRandomControls(startPt, endPt) {

    var ctrl1x = getBezRand();
    var ctrl1y = getBezRand();
    var ctrl2x = getBezRand();
    var ctrl2y = getBezRand();

    var ctrl1 = {x: startPt.x + ctrl1x, y: startPt.y + ctrl1y};
    var ctrl2 = {x: endPt.x + ctrl2x, y: endPt.y + ctrl2y};

    return doBezTrail(startPt, ctrl1, ctrl2, endPt);

  }

  function drawControlPoints() {

    _.each(trails, function(trail) {
      var redFactor = Math.min(255, (trail.id * 2 + 1) * 50);
      var greenFactor = Math.min(255, (trail.id * 2  + 1) * 60);
      var blueFactor = Math.min(255, (trail.id * 2  + 1) * 100);

      P.fill(redFactor, greenFactor, blueFactor);
      _.each(trail.points, function (point) {
        P.rect(point.x, point.y, 5, 5);
      });
      function orZero(value) {
        return value > 0 ? value : 0;
      }

      if(trail.ctrl1) {
        P.rect(orZero(trail.ctrl1.x), orZero(trail.ctrl1.y), 5, 5);
      }
      if(trail.ctrl2) {
        P.rect(orZero(trail.ctrl2.x), orZero(trail.ctrl2.y), 5, 5);
      }
    });

    P.noFill();
  }

  P.setup = function() {

    P.smooth(8);
    P.size(900, 700);

    trails = [
      doBezTrailRandomControls({ x: 200, y: 100 }, { x: 500, y: 400}),
      doBezTrailRandomControls({ x: 500, y: 400 }, { x: 800, y: 650}),
      doBezTrail({ x: 60, y: 10 }, { x: 50, y: 50}, { x: 200, y: 100}, { x: 100, y: 200}),
      doBezTrail({ x: 100, y: 200 }, { x: 40, y: 260}, { x: 150, y: 280}, { x: 240, y: 240})
    ];
    _.each(trails, function(trail, i) {
      trail.index = 0;
      trail.id = i;
    });

  };

  P.draw = function() {

    P.background(255);
    P.stroke(0, 0, 0);

    P.beginShape();
    var firstPoint = _.first(trails).start;
    P.vertex(firstPoint.x, firstPoint.y);
    _.each(trails, function(trail) {

      P.bezierVertex(trail.ctrl1.x, trail.ctrl1.y, trail.ctrl2.x, trail.ctrl2.y, trail.end.x, trail.end.y);

      drawControlPoints();
      P.ellipse(trail.points[trail.index].x, trail.points[trail.index].y, 20, 20);

      trail.index ++;
      if(trail.points.length <= trail.index) {
        trail.index = 0;
      }
    });
    P.endShape();


  };

}

function sketchProc(P) {
  Miro(P);
}

var canvas = document.getElementById("myCanvas");
// attaching the sketchProc function to the canvas
new Processing(canvas, sketchProc);