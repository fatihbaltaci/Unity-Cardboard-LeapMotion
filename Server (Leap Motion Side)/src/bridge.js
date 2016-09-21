var vector = require("./vector.js");
var Leap = require('leapjs');
var dataTemplate = require('../templates/socketTemplate.js');
var GestureAnalyzer = require('./gesturizer.js');
var WebSocket = require('ws');
var net = require('net');

//Finger and Bone Names
var fingerNames = ["thumb", "index", "middle", "ring", "pinky"];
var boneNames = ["metacarpal", "proximal phalange", "intermediate phalange", "distal phalange"];

// Initial State of the system
var initialState = dataToSend;
var isGrabbing = false;
function boneAnalyzer(bones){
  /* takes bones object and returns a bone
   dictionary with each bone's specifications */

  var bonesDict = {};
  for(var i = 0;i<bones.length;i++) {
    var bone = bones[i];
    var boneName = boneNames[bone.type];
    var averageWidth = bone.width;
    var length = bone.length;
    var boneDirection = bone.direction;

    var bonePack = {
      "width":averageWidth,
      "length":length,
      "direction":boneDirection
    }
    bonesDict[boneName] = bonePack;
  }
  return bonesDict;
}

var handLookUp = {};
var gesture = new GestureAnalyzer(); // Gesture analyzer
var dataToSend = new dataTemplate(); // Empty gesture data template


// Copied from https://gist.github.com/creationix/707146

// Keep track of the chat clients
var clients = [];

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort

  // Put this new client in the list
  clients.push(socket);

  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });

  // Send a message to all clients
  function broadcast(message) {
    clients.forEach(function (client) {
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(6500);

// Copied from LeapJS Web Communication template

// Open the socket
function connectToWebSocket() {
  // Create and open the socket
  ws = new WebSocket("ws://localhost:6437/v6.json");

  // On successful connection
  ws.onopen = function(event) {
    var enableMessage = JSON.stringify({enableGestures: true});
    ws.send(enableMessage); // Enable gestures
    var backgroundMessage = JSON.stringify({background: true});
    ws.send(backgroundMessage); // Get frames in background
    console.log("open");
  };

  // On message received
  ws.onmessage = function(event) {
      // Stream data
      var obj = JSON.parse(event.data);
      // Default gestures
      obj.gestures = {"left":"IDLE","right":"IDLE"};

      // Register hands to be served to the GestureAnalyzer
      if(obj.hands) {
        // For each hands, register...
        for(var i=0;i<obj.hands.length;i++) {
          hand = obj.hands[i];
          handName = hand.type;
          handLookUp[hand.id] = handName;
          palmData = {
            "direction":hand.direction,
            "normal":hand.palmNormal,
            "position":hand.palmPosition,
            "palm velocity":hand.palmVelocity,
            "grabStrength":hand.grabStrength,
            "pinchStrength":hand.pinchStrength,
            "confidence":hand.confidence,
            "sphere":{
                "center":hand.sphereCenter,
                "radius":hand.sphereRadius
            }
          }
          dataToSend["skeletal"][handName].id = hand.id;
          dataToSend["skeletal"][handName]["palm"] = palmData;
         }

         // Do the same for the pointables (fingers)
         if(obj.pointables) {

           for (var i=0;i<obj.pointables.length;i++) {
             var finger = obj.pointables[i];
             var fingerType = fingerNames[finger.type];
             fingerData = {
               "direction":finger.direction,
               "tip position":finger.btipPosition,
               "carp position":finger.carpPosition,
               "dip position":finger.dipPosition
             }
             dataToSend["pointable"][handLookUp[finger.handId]].id = finger.id;
             dataToSend["pointable"][handLookUp[finger.handId]]["fingers"][fingerType] = fingerData;
           }

          // When the process is finished, serve the data to the analyzer
          // and register the returned gestures to the stream JSON
          obj.gestures = gesture.update(dataToSend);
        }

        // Broadcast the json to each client.
        for(var i=0;i<clients.length;i++) {
          clients[i].write(JSON.stringify(obj));
        }

        // Reset the data
        dataToSend = new dataTemplate();
      }

  };

  // On socket close
  ws.onclose = function(event) {
    ws = null;
    console.log("close");
  }

  // On socket error
  ws.onerror = function(event) {
    console.log("error");
  };
}

connectToWebSocket();
