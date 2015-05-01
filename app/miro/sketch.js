
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

    P.stroke(255, 0, 0);
    P.line(line1.x, line1.y, line2.x, line2.y);
    P.line(line2.x, line2.y, line3.x, line3.y);

    _.each(trails, function(trail) {
      var redFactor = Math.min(255, (trail.id * 2 + 1) * 50);
      var greenFactor = Math.min(255, (trail.id * 2  + 1) * 60);
      var blueFactor = Math.min(255, (trail.id * 2  + 1) * 100);

      P.fill(redFactor, greenFactor, blueFactor);
      //_.each(trail.points, function (point) {
      //  P.rect(point.x, point.y, 5, 5);
      //});
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

  function getPointOnStraightLine(start, end) {
    var tx = end.x - start.x,
      ty = end.y - start.y,
      dist = Math.sqrt(tx*tx+ty*ty);

    var thrust = 100;
    var velX = (tx/dist)*thrust;
    var velY = (ty/dist)*thrust;
    return {
      x: start.x + velX,
      y: start.y + velY
    };
  }

  var line1, line2, line3;

  P.setup = function() {

    P.smooth(8);
    P.size(900, 700);

    var start = { x: 50, y: 350 };

    var a = {
      start: start,
      cp1: {x: 160, y: 460 },
      cp2: {x: 290, y: 400 }
    };

    var b = {
      cp1: { x: 450, y: 360 },
      cp2: { x: 490, y: 320 },
      end: { x: 860, y: 360}
    };

    // In order to make two curves A and B smoothly continuous, the last control point of A, the last point of A,
    // and the first control point of B have to be on a straight line.
    a.end = b.start = getPointOnStraightLine(a.cp2, b.cp1);
    line1 = a.cp2, line2 = a.end, line3 = b.cp1;

    trails = [
      doBezTrail(a.start, a.cp1, a.cp2, a.end),
      doBezTrail(b.start, b.cp1, b.cp2, b.end)
    ];

    _.each(trails, function(trail, i) {
      trail.index = 0;
      trail.id = i;
    });

  };

  P.draw = function() {

    P.background(255);

    P.beginShape();
    var firstPoint = _.first(trails).start;
    P.vertex(firstPoint.x, firstPoint.y);
    _.each(trails, function(trail) {

      P.bezierVertex(trail.ctrl1.x, trail.ctrl1.y, trail.ctrl2.x, trail.ctrl2.y, trail.end.x, trail.end.y);

      P.ellipse(trail.points[trail.index].x, trail.points[trail.index].y, 20, 20);
      drawControlPoints();

      trail.index ++;
      if(trail.points.length <= trail.index) {
        trail.index = 0;
      }
    });
    P.stroke(0, 0, 0);
    P.endShape();


  };

}

function sketchProc(P) {
  Miro(P);
}

var canvas = document.getElementById("myCanvas");
// attaching the sketchProc function to the canvas
new Processing(canvas, sketchProc);