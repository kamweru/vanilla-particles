class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  div(s) {
    this.x /= s;
    this.y /= s;

    return this;
  }
  dist(v) {
    var dx = this.x - v.x;
    var dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  angle() {
    return Math.atan2(this.y, this.x);
  }
  setMagnitude(magnitude) {
    var angle = this.angle();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
    return this;
  }
  limit(l) {
    if (this.magnitude() > l) {
      this.setMagnitude(l);
    }
    return this;
  }
  multiply(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  normalize() {
    var mag = this.magnitude();
    mag && this.div(mag);
    return this;
  }
  rotate(a) {
    this.setAngle(this.angle() + a);
    return this;
  }
  setAngle(a) {
    var mag = this.magnitude();
    this.x = Math.cos(a) * mag;
    this.y = Math.sin(a) * mag;
    return this;
  }
  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  copy() {
    return new Vector(this.x, this.y);
  }
  angleBetween(v) {
    return this.angle() - v.angle();
    //   return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
  }
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  lerp(v, amt) {
    this.x += (v.x - this.x) * amt;
    this.y += (v.y - this.y) * amt;
    return this;
  }
}

export default Vector;
/**
 * https://gist.github.com/cycadacka/b063b170eec759c1f41a1eb2eba53c96
 * https://gist.github.com/ChristianOellers/0e588f728044e9515d4df3e043e59b72
 * https://gist.github.com/sujinleeme/468a5ddb4429ea964d66aa5744bf2e28
 * https://gist.github.com/loganzartman/ff4c1db145fcc4177a96d7fe9e494409
 * https://stackoverflow.com/questions/43406977/how-to-fill-particles-inside-rectangle
 * https://stackoverflow.com/questions/76795581/my-javascript-particle-collision-engine-failing-to-render-particle-is-not-a-co
 * https://codepen.io/djmot/pen/XNQEBy
 * var limit = 300;
 * var pow = 5;
 * 
...
this.repulse(from) {
  var dx = from.x - this.x;
  var dy = from.y - this.y;
  var angle = Math.atan2(dx, dy);
  var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy, 2) );
  var displacement = limit / dist;
  this.x -= Math.sin(angle) * displacement * pow;
  this.y -= Math.cos(angle) * displacement * pow;
  this.x += (this.x0 - this.x) * force;
  this.y += (this.y0 - this.y) * force;
}
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
