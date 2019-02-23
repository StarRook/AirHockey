const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 3000;

/* GAME SETTINGS */
let gameOver = false;

let puck = {
  x: 900,
  y: 450,
  r: 12,
  color: '#000000',
  speedX: 2,
  speedY: 1,
};

let score = {
  player1: 0,
  player2: 0,
};

let players = [];

// Tämä firee aina kun uusi socket joinaa
io.on('connection', function(socket){

  // Tarkista onko pelaajia jo 2. Jos ei ole anna lisätä uusi pelaaja
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

  // Kun server saa "disconnect" kutsun clientiltä poista pelaaja players arraysta
  socket.on('disconnect', () => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players.splice(i, 1);
      }
    }
  });

  // Kun server saa clientiltä "move" kutsun niin päivitä pelaajan positio
  socket.on('move', (coords) => {
    for (let player of players) {
      if (player.id === socket.id) {

        // Jos pelaaja 1 niin rajoita X - suunnan liikkuminen 935px:iin.
        if (player.no === 1) {
          if (coords[0] < 935) {
            player.x = 935;
          } else {
            player.x = coords[0];
          }
          // Jos taas pelaaja 2 niin rajoita X - suunnan liikkuminen 865px:iin
        } else if (player.no === 2) {
          if (coords[0] > 865) {
            player.x = 865;
          } else {
            player.x = coords[0];
          }
        }
        // Aseta uusi y-koordinaatti pelaajalle
        player.y = coords[1];
      }
    }
  });


  // Dumb gameloop joka päivittää about 60 kertaa sekunissa. Tähän kaikki pelin logiikka.
  setInterval(() => {

    if (players.length === 2) {

      // Move puck
      puck.x += puck.speedX;
      puck.y += puck.speedY;

      // Check puck collision to walls

      if (puck.x >= 1800 - puck.r || puck.x <= puck.r) {
        puck.speedX = puck.speedX * -1;
      }
      if (puck.y >= 900 - puck.r || puck.y <= puck.r) {
        puck.speedY = puck.speedY * -1;
      }

      // Check puck collision to players
      for (const player of players) {
        const dist = Math.sqrt(Math.pow((puck.x - player.x), 2) + Math.pow((puck.y - player.y), 2));

        if (dist < puck.r + 25) {

          const collisionPointX = ((player.x * puck.r) + (puck.x * 25)) / (25 + puck.r);
          const collisionPointY = ((player.y * puck.r) + (puck.y * 25)) / (25 + puck.r);

          console.log('X:' + collisionPointX + ', Y:' + collisionPointY);

        }

      }

      // Determine if goal
    }
    socket.emit('update', {
        players: players,
        puck: puck,
        score: score,
      }
    );
  }, (17));


});

// Kun client pyytää get metodilla "/" urlia lähetä sille index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Aseta server kuuntelemaan porttia 3000.
http.listen(process.env.PORT || port, function(){
  console.log('listening on *:3000');
});