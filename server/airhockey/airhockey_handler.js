const AIRHOCKEY_LOBBY = {
  sockets: {},
  games: {},
};
const AIRHOCKEY_GAMES = {};

module.exports = {

  addNewPlayerToLobby: function(player) {
    AIRHOCKEY_LOBBY.sockets[player.id] = {
      id: player.id,
    };
  },

  getLobby: function() {
    return AIRHOCKEY_LOBBY;
  },

  deleteFromLobby: function(socket_id) {
    delete AIRHOCKEY_LOBBY.sockets[socket_id];
  },

};

/*
const lobby = {
  sockets: [],
  games: [],
};

const games = [];

module.exports = {

  airhockey_handler: function() {

    io.on('connection', function(socket) {

      lobby.sockets.push(socket);
      socket.emit('airhockey_lobby_update', lobby);

      socket.on('disconnect', () => {
        for (let i = 0; i < lobby.sockets.length; i++) {
          if (lobby.sockets[i].id === socket.id) {
            lobby.sockets.splice(i, 1);
            socket.emit(lobby);
          }
        }
      });

      socket.on('airhockey_move', (game_id, coords) => {
        for (const game of games) {
          if (game.id === game_id) {
            for (const player of game.players) {
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
          }
        }
      });

    });
  },
  airhockey_game_updater: function(game) {

    // Dumb gameloop joka päivittää about 60 kertaa sekunissa. Tähän kaikki pelin logiikka.

        const puck = game.puck;
        const score = game.score;
        const players = game.players;

        // Move puck
        puck.x += puck.speedX;
        puck.y += puck.speedY;

        if (puck.speedY > 0) {
          puck.speedY = puck.speedY - (puck.speedY / 25);
        } else if (puck.speedY < 0) {
          puck.speedY = puck.speedY + (-puck.speedY / 25);
        }

        if (puck.speedX > 0) {
          puck.speedX = puck.speedX - (puck.speedX / 50);
        } else if (puck.speedX < 0) {
          puck.speedX = puck.speedX + (-puck.speedX / 50);
        }

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

  },

  join_airhockey_game: function(socket_id, id) {
    for (const game of lobby.games) {
      if (game.id === id && game.players.length < 2) {

        const player = {
          id: socket_id,
          x: 0,
          y: 0,
          no: 2,
          lastPosX: 0,
          lastPosY: 0,
          velX: 0,
          velY: 0,
          mass: 20,
        };

        game.players.push(player);
        games.push(game);
      }
    }
  },

  create_airhockey_game: function(socket_id) {
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

    const player = {
      id: socket_id,
      x: 0,
      y: 0,
      no: 1,
      lastPosX: 0,
      lastPosY: 0,
      velX: 0,
      velY: 0,
      mass: 20,
    };

    let players = [player];

    const game = {
      id: 'asdasdasd',
      puck: puck,
      score: score,
      players: players,
      started: false,
    };

    lobby.games.push(game);

    return game.id;

  },
}; */