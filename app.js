const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 3000;

/* GAME SETTINGS */
let gameOver = false;
let players = [];

io.on('connection', function(socket){

  if (players.length < 3) {

    let playerNo = 1;

    if (players.length === 1) {
      playerNo = 2;
    }

    players.push({
      id: socket.id,
      x: 0,
      y: 0,
      no: playerNo,
    });
  }

  socket.on('disconnect', () => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players.splice(i, 1);
      }
    }
  });

  socket.on('move', (coords) => {
    for (let player of players) {
      if (player.id === socket.id) {
        player.x = coords[0];
        player.y = coords[1];
      }
    }
  });


  setInterval(() => {

    if (players.length === 2) {
      // Calculate collision

      // Determine if goal

      //
    }
    socket.emit('update', players);
  }, (17))


});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(process.env.PORT || port, function(){
  console.log('listening on *:3000');
});