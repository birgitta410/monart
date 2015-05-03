
function MiroConstellations(P, model) {
  console.log('drawing MiroConstellations');

  var backgroundImg;

  var waveTrails = [];
  var _tangents = [];

  var COLORS = {
    red: {r: 198, g: 45, b: 39},
    black: {r: 0, g: 0, b: 0},
    white: {r: 255, g: 255, b: 255},
    green: {r: 91, g: 143, b: 68},
    blue: {r: 60, g: 67, b: 137},
    yellow: {r: 244, g: 214, b: 64}
  };

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

    color(P.stroke, COLORS.red);

    _.each(_tangents, function(tangent) {
      P.line(tangent.p.x, tangent.p.y, tangent.q.x, tangent.q.y);
      P.line(tangent.q.x, tangent.q.y, tangent.r.x, tangent.r.y);
    });

    _.each(waveTrails, function(trail) {
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

  function getPointOnStraightLine(start, end, positionFactor) {
    positionFactor = positionFactor || 0.5;
    var tx = end.x - start.x,
      ty = end.y - start.y,
      dist = Math.sqrt(tx*tx+ty*ty);

    var thrust = Math.abs(tx) * positionFactor;
    var velX = (tx/dist) * thrust;
    var velY = (ty/dist) * thrust;
    return {
      x: start.x + velX,
      y: start.y + velY
    };
  }

  P.setup = function() {

    P.smooth(8);
    P.size(700*1.6, 700, P.P2D);

    backgroundImg = P.loadImage('images/background-constellations.png', 'png');

    var start = { x: 50, y: 250 };
    var end = { x: 890, y: 245 };

    var a = {
      start: start,
      cp1: {x: 160, y: 360 },
      cp2: {x: 290, y: 300 }
    };

    var b = {
      cp1: { x: 450, y: 260 },
      cp2: { x: 490, y: 230 }
    };

    var c = {
      cp1: { x: 710, y: 210 },
      cp2: { x: 800, y: 270 },
      end: end
    };

    // In order to make two curves A and B smoothly continuous, the last control point of A, the last point of A,
    // and the first control point of B have to be on a straight line.
    function connect(trail1, trail2) {
      trail1.end = trail2.start = getPointOnStraightLine(trail1.cp2, trail2.cp1, 0.4);
      _tangents.push({
        p: trail1.cp2,
        q: trail1.end,
        r: trail2.cp1
      });
    }
    connect(b, c);
    connect(a, b);

    waveTrails = [
      doBezTrail(a.start, a.cp1, a.cp2, a.end),
      doBezTrail(b.start, b.cp1, b.cp2, b.end),
      doBezTrail(c.start, c.cp1, c.cp2, c.end)
    ];

    _.each(waveTrails, function(trail, i) {
      trail.index = 0;
      trail.id = i;
    });

  };

  function color(pFct, color) {
    pFct(color.r, color.g, color.b);
  }

  function drawSpiral(cx, cy, size) {

    var angle_incr = P.radians(2 + 100/12.0);
    var numPoints = 100;

    var outer_rad = size*.45;

    var spiralPoints = [];

    for (var i = 1; i <= numPoints; ++i) {
      var ratio = i/numPoints;
      var spiral_rad = ratio * outer_rad * -1;
      var angle = i*angle_incr * -1;
      var x = cx + P.cos(angle) * spiral_rad;
      var y = cy + P.sin(angle) * spiral_rad;

      spiralPoints.push({x: x, y: y});
    }
    var start = _.last(spiralPoints);
    var deltaX = cx - start.x;
    var deltaY = cy - start.y;
    var translatedPoints = _.map(spiralPoints, function(point) {
      return {
        x: point.x + deltaX,
        y: point.y + deltaY
      }
    });

    P.beginShape();
    _.each(translatedPoints, function(point, i) {
      P.curveVertex(point.x, point.y);
      if(i === 1 || i === numPoints) {
        P.curveVertex(point.x, point.y);
      }
    });
    P.endShape();
  }

  function drawPlanet(midLinePoints, top, bottom) {
    top = top || {};
    top.heightFactor = top.heightFactor || 1;
    bottom = bottom || {};
    bottom.heightFactor = bottom.heightFactor || 1;

    var f = _.first(midLinePoints);
    var l = _.last(midLinePoints);

    function drawHalfPlanet(yFactor) {
      P.beginShape();

      var cpLeft = getPointOnStraightLine(f, l, 0.1);
      var cpMiddle = getPointOnStraightLine(f, l, 0.5);
      var cpRight = getPointOnStraightLine(f, l, 0.9);

      P.curveVertex(f.x, f.y);
      _.each(midLinePoints, function(point) {
        P.curveVertex(point.x, point.y);
      });
      P.curveVertex(l.x, l.y);
      P.curveVertex(cpRight.x, cpRight.y+yFactor);

      P.curveVertex(cpMiddle.x, cpMiddle.y+(yFactor*1.3));

      P.curveVertex(cpLeft.x, cpLeft.y+yFactor);
      P.curveVertex(f.x, f.y);
      P.curveVertex(f.x, f.y);
      P.endShape();

      // control points debugging
      //P.ellipse(cpLeft.x, cpLeft.y+yFactor, 5, 5);
      //P.ellipse(cpMiddle.x, cpMiddle.y+(yFactor*1.3), 5, 5);
      //P.ellipse(cpRight.x, cpRight.y+yFactor, 5, 5);
    }

    if(top.color !== 'none') {
      color(P.fill, top.color || COLORS.black);
    } else {
      P.noFill();
    }
    drawHalfPlanet(-20*top.heightFactor);

    if(bottom.color !== 'none') {
      color(P.fill, bottom.color || COLORS.red);
    } else {
      P.noFill();
    }
    drawHalfPlanet(20*bottom.heightFactor);

    P.noFill();
  }

  P.draw = function() {

    P.background(255);
    P.image(backgroundImg, 0, 0);

    var allPoints = _.flatten(_.pluck(waveTrails, 'points'));

    var offset = 100;
    _.each(model.history, function(entry, i) {

      var size = entry.size === 0 ? 1 : entry.size;
      var sliceLength = Math.max(5, size); // TODO: Account for fact that same number of points does not equal same DISTANCE/size of planet
      var endSlice = offset + sliceLength;
      if(allPoints.length > endSlice) {
        var halves = [
          {color: COLORS.black, heightFactor: size /10 },
          {color: COLORS[entry.color], heightFactor: size /10 }
        ];
        if (i % 2 === 0) {
          halves = halves.reverse();
        }

        drawPlanet(allPoints.slice(offset, endSlice), halves[0], halves[1]);
        offset += sliceLength + 10;
      }
    });

    drawPlanet(allPoints.slice(20, 60), {
      heightFactor: 3.5,
      color: COLORS.blue
    }, {
      heightFactor: 9,
      color: 'none'
    });

    P.beginShape();
    var firstPoint = _.first(waveTrails).start;
    P.vertex(firstPoint.x, firstPoint.y);
    _.each(waveTrails, function(trail) {
      P.bezierVertex(trail.cp1.x, trail.cp1.y, trail.cp2.x, trail.cp2.y, trail.end.x, trail.end.y);
      //drawControlPoints();
    });
    color(P.stroke, COLORS.black);
    P.endShape();

    var lastPointInWave = _.last(allPoints);
    drawSpiral(lastPointInWave.x - 10, lastPointInWave.y + 10, 200);

  };

}

var miroModel = {
  history: [ {size: 5, color: 'green' }, {size: 20, color: 'red' } ]
};

function sketchProc(P) {
  MiroConstellations(P, miroModel);
}

new Processing('miroCanvas', sketchProc);

function processNewData(historyData) {

  miroModel.history = historyData.history;

}

var wsHost = 'ws://' + window.location.host;
var ws = new WebSocket(wsHost + '/miro');

ws.onmessage = function (event) {
  artwise.processMessage(event, 'miro', processNewData);
};

// TODO
artwise.initPing(ws, function() { console.log('no connection!'); });
