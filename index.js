var express = require("express"); // make's ExpressJS a dependency
var app = express(); // app launches a expressVM
var server = require("https").Server(app); // Http Web server started
var io = require("socket.io").listen(server); // Listen for connection to port

var players = {};
var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50,
};
var scores = {
  Nity: 0,
  Arty: 0,
};

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("New Gay man", socket.id);
  //Create New player and add to player object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? "Nity" : "Arty",
  };
  // send player object to new player
  socket.emit("currentPlayers", players);
  // send starts to new player
  socket.emit("starlocation", star);
  // send current scores
  socket.emit("scoreUpdate", scores);
  //update all players of new player
  socket.emit("newPlayer", players[socket.id]);

  // When a player disconnects, remove from player object
  socket.on("disconnect", function () {
    console.log("Gay gone:", socket.id);
    delete players[socket.id];
    // emit all players to remove the disconnected
    io.emit("disconnect", socket.id);
  }); // part 1 ended here

  // when a player moves, update the player data
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("starCollected", function () {
    if (players[socket.id].team === "Nity") {
      scores.Nity += 10;
    } else {
      scores.Arty + 10;
    }
    star.x = Math.floor(Math.random() * 700) + 50;
    star.y = Math.floor(Math.random() * 500) + 50;
    io.emit("starlocation", star);
    io.emit("scoreUpdate", scores);
  });
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});