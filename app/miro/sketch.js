
function Miro(P) {
  console.log('drawing Miro');

  var backgroundImg;

  var trails = [];
  var tangents = [];

  var red = {r: 198, g: 45, b: 39 };
  var black = {r: 0, g: 0, b: 0 };
  var white = {r: 255, g: 255, b: 255 };
  var green = {r: 91, g: 143, b: 68 };
  var blue = {r: 60, g: 67, b: 137 };
  var yellow = {r: 244, g: 214, b: 64 };

  function doBezTrail(startPt, cp1, cp2, endPt) {

    var endPt = {x: endPt.x, y: endPt.y};

    var bezPlot = new BezierPlotter(startPt, cp1, cp2, endPt);
    bezPlot.setupProps(100);

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

    color(P.stroke, red);

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
    P.size(900, 700, P.P2D);

    backgroundImg = P.loadImage('images/background-constellations.png', 'png');

    var start = { x: 50, y: 350 };
    var end = { x: 890, y: 345 };

    var a = {
      start: start,
      cp1: {x: 160, y: 460 },
      cp2: {x: 290, y: 400 }
    };

    var b = {
      cp1: { x: 450, y: 360 },
      cp2: { x: 490, y: 330 }
    };

    var c = {
      cp1: { x: 710, y: 310 },
      cp2: { x: 800, y: 370 },
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

  function color(pFct, color) {
    pFct(color.r, color.g, color.b);
  }

  function drawPlanet(midLinePoints, top, bottom) {
    top = top || {};
    top.heightFactor = top.heightFactor || 1;
    bottom = bottom || {};
    bottom.heightFactor = bottom.heightFactor || 1;

    var f = _.first(midLinePoints);
    var l = _.last(midLinePoints);

    if(top.color !== 'none') {
      color(P.fill, top.color || black);
    } else {
      P.noFill();
    }

    P.beginShape();
    P.curveVertex(f.x, f.y);
    P.curveVertex(f.x, f.y);
    P.curveVertex(f.x, f.y-(20*top.heightFactor));
    P.curveVertex(l.x, l.y-(20*top.heightFactor));
    P.curveVertex(l.x, l.y);
    P.curveVertex(l.x, l.y);
    P.endShape();
    //P.curve(f.x, f.y+(150*top.heightFactor), f.x, f.y, l.x, l.y, l.x, l.y+(100*top.heightFactor));

    if(bottom.color !== 'none') {
      color(P.fill, bottom.color || red);
    } else {
      P.noFill();
    }
    P.curve(f.x, f.y-(120*bottom.heightFactor), f.x, f.y, l.x, l.y, l.x, l.y-(80*bottom.heightFactor));

    P.noFill();
  }

  var index = 0;
  P.draw = function() {

    P.background(255);
    P.image(backgroundImg, 0, 0);

    var sliceSize = 20;
    var allPoints = _.flatten(_.pluck(trails, 'points'));

    //P.ellipse(allPoints[index].x, allPoints[index].y, 20, 20);
    drawPlanet(allPoints.slice(index, index + sliceSize));
    drawPlanet(allPoints.slice(20, 40), { heightFactor: 6, color: 'none' }, { heightFactor: 3.5, color: green });

    P.beginShape();
    var firstPoint = _.first(trails).start;
    P.vertex(firstPoint.x, firstPoint.y);
    _.each(trails, function(trail) {
      P.bezierVertex(trail.cp1.x, trail.cp1.y, trail.cp2.x, trail.cp2.y, trail.end.x, trail.end.y);
      //drawControlPoints();
    });
    color(P.stroke, black);
    P.endShape();

    index ++;
    if(allPoints.length <= index + sliceSize) {
      index = 0;
    }

  };

}

function sketchProc(P) {
  Miro(P);
}

//var canvas = document.getElementById("myCanvas");
// attaching the sketchProc function to the canvas
new Processing('myCanvas', sketchProc);