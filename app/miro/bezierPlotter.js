
/*****************[ Migrated from BezierPlotter.as ]*******************

 Created: 09/25/02 - Paul Spitzer - www.paulspitzer.com

 ********************************************************/

BezierPlotter = function(pos1, pos2, pos3, pos4)
{
  this.setupProps(50);
  this.p1 = pos1;
  this.p2 = pos2;
  this.p3 = pos3;
  this.p4 = pos4;
};

BezierPlotter.prototype.setupProps = function(speed){
  this.speed = 1 / speed;
};

BezierPlotter.prototype.plotPoints = function()
{

  this.cx = 3 * (this.p2.x - this.p1.x);
  this.cy = 3 * (this.p2.y - this.p1.y);

  this.bx = 3 * (this.p3.x - this.p2.x) - this.cx;
  this.by = 3 * (this.p3.y - this.p2.y) - this.cy;

  this.ax = this.p4.x - this.p1.x - this.cx - this.bx;
  this.ay = this.p4.y - this.p1.y - this.cy - this.by;

  var ary_return = [];
  for(var i = 0; i <= 1; i += this.speed){
    var x = (this.ax * (i * i * i)) + (this.bx * (i  * i)) + (this.cx * i) + this.p1.x;
    var y = (this.ay * (i * i * i)) + (this.by * (i  * i)) + (this.cy * i) + this.p1.y;
    ary_return.push({ x: x, y: y });
  }
  this.points = ary_return;
  return this.points;
};
