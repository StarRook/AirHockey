const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const cors = require('cors');

const port = 3000;

app.use(cors());

// View Engine Setup for EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

/* GAME SETTINGS */
let gameOver = false;

let puck = {
  x: 900,
  y: 450,
  r: 12,
  color: '#000000',
  speedX: Math.round(Math.random() * 10 + 1),
  speedY: Math.round(Math.random() * 10 + 1),
  mass: 10,
  maxSpeed: 100,
};

let score = {
  player1: 0,
  player2: 0,
};

let players = [];

// Tämä firee aina kun uusi socket joinaa
io.on('connection', function(socket){

  console.log('New connection: ' + socket.id);

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
      lastPosX: 0,
      lastPosY: 0,
      velX: 0,
      velY: 0,
      mass: 20,
    });
  } else {
    socket.close();
  }

  // Kun server saa "disconnect" kutsun clientiltä poista pelaaja players arraysta
  socket.on('disconnect', () => {
    console.log('Disconnected: ' + socket.id);
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

        // Tallenna lastPosX ja lastPosY
        player.lastPosX = player.x;
        player.lastPosY = player.y;

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

        // Laske velX ja velY
        player.velX = player.x - player.lastPosX;
        player.velY = player.y - player.lastPosY;

      }
    }
  });


  // if (players.length === 1) {

    // Dumb gameloop joka päivittää about 60 kertaa sekunissa. Tähän kaikki pelin logiikka.
    setInterval(() => {

      // TODO:: CHANGE THIS TO === WHEN READY
      if (players.length <= 2) {

        // Move puck
        puck.x += puck.speedX;
        puck.y += puck.speedY;

        if (puck.speedY > 0) {
          puck.speedY = puck.speedY - (puck.speedY / 50);
        } else if (puck.speedY < 0) {
          puck.speedY = puck.speedY + (-puck.speedY / 50);
        }

        if (puck.speedX > 0) {
          puck.speedX = puck.speedX - (puck.speedX / 50);
        } else if (puck.speedX < 0) {
          puck.speedX = puck.speedX + (-puck.speedX / 50);
        }

        //console.log(puck.speedX);
        //console.log(puck.speedY);

        // Katso jos maali
        if (puck.x <= puck.r && (puck.y >= 350 && puck.y <= 550)) {
          // Maali pelaaja 1:lle
          console.log('GOAL');
          score.player1++;
        } else if (puck.x >= 1800 - puck.r && (puck.y >= 350 && puck.y <= 550)) {
          // Maali pelaaja 2:lle
          console.log('GOAL');
          score.player2++;
        }

        // Check puck collision to walls

        if (puck.x >= 1800 - puck.r) {
          puck.x = 1800 - puck.r;
          puck.speedX = puck.speedX * -1;
        } else if (puck.x <= puck.r) {
          puck.x = puck.r * 2;
          puck.speedX = puck.speedX * -1;
        }
        if (puck.y >= 900 - puck.r) {
          puck.y = 900 - puck.r;
          puck.speedY = puck.speedY * -1;
        } else if (puck.y <= puck.r) {
          puck.y = puck.r * 2;
          puck.speedY = puck.speedY * -1;
        }

        // Check puck collision to players
        for (const player of players) {
          const dist = Math.sqrt(Math.pow((puck.x - player.x), 2) + Math.pow((puck.y - player.y), 2));

          if (dist < puck.r + 35) {
            console.log('COLLISION');

            // Tallenna uudet nopeudet muuttujiin
            const newSpeedX = (puck.speedX * (puck.mass - player.mass) + (2 * player.mass * player.velX)) / (puck.mass + player.mass);
            const newSpeedY = (puck.speedY * (puck.mass - player.mass) + (2 * player.mass * player.velY)) / (puck.mass + player.mass);

            // Siirrä puckin x,y koordinaatteja heti uusien nopeuksien verran ettei puck jää pelaajaan jumiin
            puck.x = puck.x += newSpeedX;
            puck.y = puck.y += newSpeedY;

            // Muuta kiekon nopeudet ottaen kiekon maxSpeed huomioon
            if (Math.abs(newSpeedX) > puck.maxSpeed) {
              puck.speedX = puck.maxSpeed;
            } else {
              puck.speedX = newSpeedX;
            }

            if (Math.abs(newSpeedY) > puck.maxSpeed) {
              puck.speedY = puck.maxSpeed;
            } else {
              puck.speedY = newSpeedY;
            }

            console.log('Puck speed x: ' + puck.speedX);
            console.log('Puck speed y: ' + puck.speedY);

          }

        }
      }
      socket.emit('update', {
          players: players,
          puck: puck,
          score: score,
        }
      );
    }, (17));
  // }
});

// Kun client pyytää get metodilla "/" urlia lähetä sille index.html
app.get('/', function(req, res){
  res.render('index');
});

app.get('/airhockey', function(req, res) {
  console.log(req.url);
  res.render('airhockey', {
    page: req.url,
  });
});

// Aseta server kuuntelemaan porttia 3000.
http.listen(process.env.PORT || port, function(){
  console.log('listening on *:3000');
});