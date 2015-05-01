
/*****************[ Migrated from BezierPlotter.as ]*******************

 Created: 09/25/02 - Paul Spitzer - www.paulspitzer.com

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
