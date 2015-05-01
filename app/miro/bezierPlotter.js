/*******************************************************/
/*****************[ BezierPlotter.as ]*******************

 Created: 09/25/02 - Paul Spitzer - www.paulspitzer.com

 Use: Create a new instance of the BezierPlotter class
 instanceName = new BezierPlotter(p1, p2, p3, p4);
 p1, p2, p3, p4 can be either MovieClips or Objects
 with _x and _y properties.

 Example 1: Using MovieClips - the parameters are the
 instance names of your MovieClips...
 BezierPlotter(mc1, mc2, mc3, mc4);

 Example 2: Using Objects - the parameters are Objects
 with _x and _y properties...
 obj1 = {_x: 100, _y: 100};
 obj2 = {_x: 100, _y: 400};
 obj3 = {_x: 400, _y: 400};
 obj4 = {_x: 400, _y: 100};
 BezierPlotter(obj1, obj2, obj3, obj4);

 Calling Methods: There are three methods which you
 have access to.

 definePoint(index, pos): Used to define the location
 of anyone of the four required points.  This method
 takes two parameters.  Index - describes which point
 you are defining.  Valid values are integers 1 - 4.
 Pos - is either a MovieClip or an Object with x and
 y values.

 setupProps(speed): Used to define properties used in
 the plotting equation.  For now the only parameter is
 speed.  Speed can be thought of as the number of points
 to plot.

 plotPoints(): Creates the array "points" which stores
 the x and y positions of the plotted points. The
 array is in the following structure: points[i][0] = X,
 points[i][1] = Y. Where i = an integer from 0 to speed
 or points.length.


 ********************************************************/

BezierPlotter = function(pos1, pos2, pos3, pos4)
{
  this.setupProps(50);
  this.definePoint(1, pos1);
  this.definePoint(2, pos2);
  this.definePoint(3, pos3);
  this.definePoint(4, pos4);
};

BezierPlotter.prototype.definePoint = function(index, pos)
{
  this["p" + index + "x"] = pos.x;
  this["p" + index + "y"] = pos.y;
};

BezierPlotter.prototype.setupProps = function(speed){
  this.speed = 1 / speed;
};

BezierPlotter.prototype.plotPoints = function()
{

  this.cx = 3 * (this.p2x - this.p1x);
  this.cy = 3 * (this.p2y - this.p1y);

  this.bx = 3 * (this.p3x - this.p2x) - this.cx;
  this.by = 3 * (this.p3y - this.p2y) - this.cy;

  this.ax = this.p4x - this.p1x - this.cx - this.bx;
  this.ay = this.p4y - this.p1y - this.cy - this.by;

  var ary_return = [];
  for(var i = 0; i <= 1; i += this.speed){
    var obj_temp = [];
    obj_temp[0] = (this.ax * (i * i * i)) + (this.bx * (i  * i)) + (this.cx * i) + this.p1x;
    obj_temp[1] = (this.ay * (i * i * i)) + (this.by * (i  * i)) + (this.cy * i) + this.p1y;
    ary_return.push(obj_temp);
  }
  this.points = ary_return;
  return this.points;
};

function getBezRand(){
  var gBezMaxRand = 300;
  return (Math.random()*gBezMaxRand)-gBezMaxRand/2;
}

function doBezTrail(startX, startY, trailTarget) {

  var startPt = {x: startX, y: startY};

  var ctrl1x = getBezRand();
  var ctrl1y = getBezRand();
  var ctrl2x = getBezRand();
  var ctrl2y = getBezRand();

  var ctrl1 = {x: startPt.x + ctrl1x, y: startPt.y + ctrl1y};
  var ctrl2 = {x: trailTarget.x + ctrl2x, y: trailTarget.y + ctrl2y};

  var endPt = {x: trailTarget.x, y: trailTarget.y};

  var bezPlot = new BezierPlotter(startPt, ctrl1, ctrl2, endPt);
  bezPlot.setupProps(30);

  var plottedPoints = bezPlot.plotPoints();
  console.log('bezier control points factors', ctrl1x, ctrl1y, ctrl2x, ctrl2y);
  console.log('number of points', plottedPoints.length);

  return {
    points: plottedPoints,
    start: startPt,
    end: endPt,
    ctrl1: {
      x: ctrl1x,
      y: ctrl1y
    },
    ctrl2: {
      x: ctrl2x,
      y: ctrl2y
    }
  };


};