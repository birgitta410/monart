

function Miro(P) {
  console.log('drawing Miro')

  var trail;

  function drawTrail() {
    P.stroke(0, 0, 0);
    _.each(trail.points, function(point, i) {
      if(trail.points.length > i+1) {
        P.line(point[0], point[1], trail.points[i+1][0], trail.points[i+1][1]);
      }
    });
  }

  P.setup = function() {

    P.background(255);
    P.smooth(8);
    P.size(900, 700);

    trail = doBezTrail(200, 100, { x: 500, y: 400});
    P.stroke(255, 102, 0);
    // Processing's bezier draws a different line than our plotted trail...
    P.bezier(trail.start.x, trail.start.y, trail.ctrl1.x, trail.ctrl1.y, trail.ctrl2.x, trail.ctrl2.y, trail.end.x, trail.end.y);

    drawTrail();
  };

  var index = 0;

  P.draw = function() {

    index ++;
    if(trail.points.length <= index) {
      index = 0;
    }

    P.ellipse(trail.points[index][0], trail.points[index][1], 20, 20);

  };

}

function sketchProc(P) {
  Miro(P);
}

var canvas = document.getElementById("myCanvas");
// attaching the sketchProc function to the canvas
new Processing(canvas, sketchProc);