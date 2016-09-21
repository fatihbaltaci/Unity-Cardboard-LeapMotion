module.exports = function(v) {
  /* Vector class to make our lives easy */
  this.v = v;
  this.length = v.length;
}
module.exports.prototype.clone = function(vec) {
  /* Clone a vector class */
  var a = [0,0,0];
  for(var i=0;i<vec.length;i++) a[i] = vec.v[i];
  return new module.exports(a);
}
module.exports.prototype.distance = function(other) {
  /* Returns the distance to the other vector */
  s = 0;
  for(var i=0;i<3;i++) s += Math.pow(this.v[i]-other.v[i],2);
  return Math.pow(s,0.5);
}

module.exports.prototype.magnitude = function () {
  /* The magnitude of the vector */
  return this.distance({v:[0,0,0]});
}

module.exports.prototype.dot = function(other) {
  /* Dot product of the vector with another vector */
  s = 0;
  for(var i=0;i<3;i++) s += this.v[i]*other.v[i];
  return s;
}

module.exports.prototype.softmax = function() {
  /* Maps the entries of a vector to probabilities */
  var exp = 0;
  var res = [];
  for(var i=0;i<this.length;i++) {
    exp += Math.exp(this.v[i]);
  }
  for(var i=0;i<this.length;i++) { res.push((Math.exp(this.v[i])/exp).toFixed(2)) }

  return (new vector(res));
}
module.exports.prototype.substract = function (other) {
  /* Substract a vector from this vector */
  var copy = this.clone(this);
  for(var i=0;i<3;i++) copy[i] - other[i];
  return copy;
}

module.exports.prototype.projection = function(vec) {
  /* Takes the projection of the vector to another vector */ 
  var to =this.clone(vec);
  var cons = this.dot(to)  / Math.pow(to.magnitude(),2);
  for(var i=0;i<to.length;i++) {to.v[i] *= cons};
  return to;
}

module.exports.prototype.cos = function(to) {
  return this.dot(to)/(to.magnitude()*this.magnitude());
};
