vector = require("./vector.js");

function Poll() {
  /* This class holds the gesture analysis results of each frame*/
  this.poll = {
    "left":{
      "g":0,
      "z":0,
      "e":0,
      "c":0
    },
    "right":{
      "g":0,
      "z":0,
      "e":0,
      "c":0
    }
  };
}

Poll.prototype.update = function(frame,h) {
  /* Update the poll with the frame's gesture analysis*/
  var hands = ["left","right"];
  var gestures = ["g","z","e","c"];

  for(var i=0;i<hands.length;i++) {
    var h = hands[i];
    for(var j=0;j<gestures.length;j++) {
      this.poll[h][gestures[j]] += frame[h][gestures[j]];
    }
  }
}

Poll.prototype.substract = function(frame) {
  /* When the rolling frame is used, substract the first results from the poll*/
  var hands = ["left","right"];
  var gestures = ["g","z","e","c"];

  for(var i=0;i<hands.length;i++) {
    for(var j=0;j<gestures.length;j++) {
      this.poll[hands[i]][gestures[j]] -= frame[hands[i]][gestures[j]];
    }
  }
}

Poll.prototype.calculateProbabilities = function() {
  /* Calculates the likelihood of a gesture to happen,
   given the poll results by using softmax function.*/
  var left = new vector([
    this.poll.left.g,
    this.poll.left.z,
    this.poll.left.c,
    this.poll.left.e
  ]);
  var right = new vector([
    this.poll.right.g,
    this.poll.right.z,
    this.poll.right.c,
    this.poll.right.e
  ]);

  var leftProbs = left.softmax();
  var rightProbs = right.softmax();

  return [leftProbs.v,rightProbs.v];
}

module.exports = function () {
  /* GestureAnalyzer class, analyzes the gesture by examining each frame. */
  this.frames = []; // The rolling window
  this.hands = ["left","right"];
  this.prevDistance = null; // Previous distance of two palms, initially null
  this.deltaDistance = 3.0; // Delta distance threshold of palms
  this.n = 75; // Rolling windows length
  this.poll = new Poll(); // Poll class for gestures
  this.gestures = ["GRAB","ZOOM","COMBINE","EXPAND"]; // Names of the gestures.

  this.prev = {
    "left":null,
    "right":null
  } // Previous gestures, initially null
}

module.exports.prototype.isHandWideOpen = function(palm,fingers) {
  /* Returns true if hand is wide open. */
  var index = new vector(fingers.index.direction); // Index finger direction vec.
  var middle = new vector(fingers.middle.direction); // Middle finger direction
  var ring = new vector(fingers.ring.direction); // Ring finger direction vec.
  var pinky = new vector(fingers.pinky.direction); // Pinky finger direction v.


  var palm = new vector(palm); // Palm direction vector
  var pi = index.cos(palm); // Cosine of the angle b/w index finger & palm dir.
  var pm = middle.cos(palm); // Cosine of the angle b/w middle finger & palm dir.
  var pr = ring.cos(palm); // Cosine of the angle b/w ring finger & palm dir.
  var pp = pinky.cos(palm); // Cosine of the angle b/w pinky finger & palm dir.
  var avg = (pi + pm + pr + pp) / 4.0; // Average of cosines
  return (avg > 0.80);
}

module.exports.prototype.isHandFocused = function(palm) {
  /* returns true if hand is directed to the screen. */
  var basis = new vector([0,1,0]); // j basis vector of R^3
  var val = Math.abs(palm.projection(basis).v[1]); // projection of palm to j
  return (val > 0.25);
}

module.exports.prototype.isGrab = function(grabStrength,pinchStrength,angle) {
  /* Returns true the angle b/w the index and middle finger
  is small and the hand is rolled. */
  return (angle > 0.85 && Math.max(grabStrength,pinchStrength) > 0.5);
}

module.exports.prototype.isZoom = function(grabStrength,pinchStrength,angle) {
  /* Returns true if the angle between index and middle
  finger is large and pinching. */
  return (angle < 0.6 && pinchStrength > 0 );
}

module.exports.prototype.isCombine = function(distance) {
  /* Returns true if the hands are wide open and the
  distance between the palms is decreasing. */
  var isApproaching = false;
  if(this.prevDistance) {
    isApproaching = (this.prevDistance - distance > this.deltaDistance);
  }
  return isApproaching;
}

module.exports.prototype.isExpand = function(distance) {
  /* Returns true if the hands are wide open and the
  distance between the palms is increasing. */
  var isApproaching = false;
  if(this.prevDistance) {
    return (distance - this.prevDistance > this.deltaDistance);
  }
  return isApproaching;
}

module.exports.prototype.exComPreliminaries = function(leftDir,rightDir) {
  /* Returns true if the palms are paralel. */
  return (leftDir.projection(rightDir).magnitude() > 0.85);
}

module.exports.prototype.getFrame = function() {
  /* Returns a blank frame template. */
  return {
    "left":{
      "g":0,
      "z":0,
      "e":0,
      "c":0
    },
    "right":{
      "g":0,
      "z":0,
      "e":0,
      "c":0
    }
  };
};

module.exports.prototype.update = function (f) {
  /* Main function of the class. Updates the frame,
  manages the gesture analysis and finally returns
  the most probable gesture. */

  frame = this.getFrame(); // Get a blank frame template.
  var gestureData = { // Initially this frame's gestures are IDLE
    "left":"IDLE",
    "right":"IDLE"
  }

  // Analyze the gestures that require both hands.

  var leftDir = f.skeletal.left.palm.direction; // Get left palm direction
  var leftPos = f.skeletal.left.palm.position; // Get left palm position
  var leftFingers = f.pointable.left.fingers; // Get left fingers

  var rightDir = f.skeletal.right.palm.direction; // Get right palm direction
  var rightPos = f.skeletal.right.palm.position; // Get right palm position
  var rightFingers = f.pointable.right.fingers; // Get right fingers

  // If the dependencies are met..
  if( (leftDir && rightDir) && (leftPos && rightPos) ) {

    // Check if both hands are wide open.
    var isHand = this.isHandWideOpen(leftDir,leftFingers) &&
                this.isHandWideOpen(rightDir,rightFingers);


    // Vectorize the direction and position arrays.
    leftDir = new vector(leftDir);
    rightDir = new vector(rightDir);
    leftPos = new vector(leftPos);
    rightPos = new vector(rightPos);

    // Check if hands are parallel
    var isProj = this.exComPreliminaries(leftDir,rightDir);
    // Get the distance between two palms.
    var distance = leftPos.distance(rightPos);

    // Check if the data supports the gestures and register it to the frame.
    var c = isHand && isProj && this.isCombine(distance);
    var e = isHand && isProj && this.isExpand(distance);
    frame.left.c = frame.right.c = c;
    frame.left.e = frame.right.e = e;
    this.prevDistance = distance;
  }

  // Analyze one handed gestures.
  for(var i=0;i<2;i++) {

    // Get grab and pinch strength of the hand.
    var grabStrength = f.skeletal[this.hands[i]].palm.grabStrength;
    var pinchStrength = f.skeletal[this.hands[i]].palm.pinchStrength;
    // Get the palm direction
    var palmDirection = f.skeletal[this.hands[i]].palm.direction;
    // Get the fingers
    var fingers = f.pointable[this.hands[i]].fingers;

    // If the data exists...
    if(palmDirection && fingers) {

      // Vectorize palm direction
      palmDirection = new vector(palmDirection);
      // Check if the hand is focused
      var isFocused = this.isHandFocused(palmDirection);
      // Check if the hand is wide open
      var isHandW = this.isHandWideOpen(palmDirection,fingers);

      // Calculate the cosine of the angle between index and middle finger
      var index = new vector(fingers.index.direction);
      var middle = new vector(fingers.middle.direction);
      var angle = index.cos(middle);

      // If the hand is focused and hand is not wide open
      if(isFocused && !isHandW) {
        // analyze one handed gestures and update the frame
        frame[this.hands[i]].g = this.isGrab(grabStrength,pinchStrength,angle);
        frame[this.hands[i]].z = this.isZoom(grabStrength,pinchStrength,angle);

      } // No focus or hand is wide open
    } // Hand data is not intact.
  }

  // Register the frame to the poll
  this.poll.update(frame);

  // If there are enouh number of frames...
  if(this.frames.length == this.n ) {
    // Get the first frame in the window
    var lastFrame = this.frames.shift();
    // Substract it from the poll
    this.poll.substract(lastFrame);
    // Calculate gesture probabilities
    var probs = this.poll.calculateProbabilities(this.hands[i]);
    // For each hand's probabilities
    for(var i=0;i<probs.length;i++) {
      // Update the gesture state, if a gesture is probable (> 0.8)
      // and the gesture is not equal to the previous gesture
      var hand = this.hands[i];
      var prob = probs[i];

      for(var j=0;j<prob.length;j++) {
        if(prob[j]>0.8 && prob[j] !== this.prev[hand]) {
          gestureData[hand] = this.gestures[j];
          this.prev[hand] = this.gestures[j];
        }
      }
    }

  }
  this.frames.push(frame); // Push frame to the frames window
  return gestureData; // Return the gesture data

}
