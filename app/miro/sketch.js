
function Miro(P) {
  console.log('drawing Miro')

  var trails = [];
  var tangents = [];

  function doBezTrail(startPt, cp1, cp2, endPt) {

    var endPt = {x: endPt.x, y: endPt.y};

    var bezPlot = new BezierPlotter(startPt, cp1, cp2, endPt);
    bezPlot.setupProps(50);

    var plottedPoints = bezPlot.plotPoints();
    console.log('bezier control points factors', cp1.x, cp1.y, cp2.x, cp2.y);
    console.log('number of points', plottedPoints.length);

    return {
      points: plottedPoints,
      start: startPt,
      end: endPt,
      cp1: {
        x: cp1.x,
        y: cp1.y
      },
      cp2: {
        x: cp2.x,
        y: cp2.y
      }
    };

  }

  function drawControlPoints() {

    P.stroke(255, 0, 0);

    _.each(tangents, function(tangent) {
      P.line(tangent.p.x, tangent.p.y, tangent.q.x, tangent.q.y);
      P.line(tangent.q.x, tangent.q.y, tangent.r.x, tangent.r.y);
    });

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

      if(trail.cp1) {
        P.rect(orZero(trail.cp1.x), orZero(trail.cp1.y), 5, 5);
      }
      if(trail.cp2) {
        P.rect(orZero(trail.cp2.x), orZero(trail.cp2.y), 5, 5);
      }
    });

    P.noFill();
  }

  function getPointOnStraightLine(start, end) {
    var tx = end.x - start.x,
      ty = end.y - start.y,
      dist = Math.sqrt(tx*tx+ty*ty);

    var factor = 50;
    var velX = (tx/dist) * factor;
    var velY = (ty/dist) * factor;
    return {
      x: start.x + velX,
      y: start.y + velY
    };
  }

  P.setup = function() {

    P.smooth(8);
    P.size(900, 700);

    function rand() {
      return (Math.floor(Math.random() * 8) + 1) / 10 + 1;
    }


    var start = { x: 50, y: 350 };
    var end = { x: 890, y: 345 };
    var xFactor = 90;
    var yFactor = 50;

    var x = start.x;
    function incX() {
      x += xFactor * rand();
      return x;
    }

    var a = {
      start: start,
      cp1: {x: start.x + incX(), y: start.y + (yFactor*rand()) },
      cp2: {x: start.x + incX(), y: start.y - (yFactor*rand()) }
    };

    var b = {
      cp1: { x: start.x + incX(), y: start.y + (yFactor*rand()) },
      cp2: { x: start.x + incX(), y: start.y - (yFactor*rand()) }
    };

    var c = {
      cp1: { x: start.x + incX(), y: start.y + (yFactor*rand()) },
      cp2: { x: start.x + incX(), y: start.y - (yFactor*rand()) },
      end: end
    };

    // In order to make two curves A and B smoothly continuous, the last control point of A, the last point of A,
    // and the first control point of B have to be on a straight line.
    function connect(trail1, trail2) {
      trail1.end = trail2.start = getPointOnStraightLine(trail1.cp2, trail2.cp1);
      tangents.push({
        p: trail1.cp2,
        q: trail1.end,
        r: trail2.cp1
      });
    }
    connect(b, c);
    connect(a, b);

    trails = [
      doBezTrail(a.start, a.cp1, a.cp2, a.end),
      doBezTrail(b.start, b.cp1, b.cp2, b.end),
      doBezTrail(c.start, c.cp1, c.cp2, c.end)
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

      P.bezierVertex(trail.cp1.x, trail.cp1.y, trail.cp2.x, trail.cp2.y, trail.end.x, trail.end.y);

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