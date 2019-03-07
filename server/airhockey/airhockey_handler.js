const AIRHOCKEY_LOBBY = {};
const AIRHOCKEY_GAMES = {};

module.exports = {

  joinGame: function(io, socket, data) {
    AIRHOCKEY_GAMES[data.gameId].players.push({
      name: data.username,
      id: socket.id,
      x: 0,
      y: 0,
      no: 2,
      lastPosX: 0,
      lastPosY: 0,
      velX: 0,
      velY: 0,
      mass: 20,
      radius: 35,
    });
    this.deleteFromLobby(socket.id);
    io.sockets.emit('airhockey_lobby_update', this.getLobby());
    AIRHOCKEY_GAMES[data.gameId].gameStarted = true;
  },

  createNewGame: function(io, socket, data) {
    AIRHOCKEY_GAMES[socket.id] = {
      gameName: data.username + "'s game",
      players: [{
        name: data.username,
        id: socket.id,
        x: 0,
        y: 0,
        no: 1,
        lastPosX: 0,
        lastPosY: 0,
        velX: 0,
        velY: 0,
        mass: 20,
        radius: 35,
      }],
      gameStarted: false,
      gameOver: false,
      score: {
        player1: 0,
        player2: 0,
      },
      puck: {
        x: 900,
        y: 450,
        r: 12,
        color: '#000000',
        speedX: Math.round(Math.random() * 10 + 1),
        speedY: Math.round(Math.random() * 10 + 1),
        mass: 10,
        maxSpeed: 100,
      }
    };
    this.deleteFromLobby(socket.id);
    io.sockets.emit('airhockey_lobby_update', this.getLobby());
  },

  addNewPlayerToLobby: function(player) {
    AIRHOCKEY_LOBBY[player.id] = {
      id: player.id,
      username: player.username,
    };
  },

  getLobby: function() {
    return {lobby: AIRHOCKEY_LOBBY, games: AIRHOCKEY_GAMES};
  },

  deleteFromLobby: function(socket_id) {
    delete AIRHOCKEY_LOBBY[socket_id];
  },

  movePlayer: function(io, socket, data) {

    const coords = data;

    for (const key in AIRHOCKEY_GAMES) {
      const game = AIRHOCKEY_GAMES[key];
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
  },

  deleteFromGames: function(socket_id) {
    for (const key in AIRHOCKEY_GAMES) {
      const game = AIRHOCKEY_GAMES[key];
      for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].id === socket_id) {
          game.players.splice(i, 1);
          if (game.players.length < 1) {
            console.log('Game empty deleting it');
            delete AIRHOCKEY_GAMES[key];
            break;
          }
        }
      }
    }
  },

  updateGames: function(io) {
    for (const key in AIRHOCKEY_GAMES) {
      const game = AIRHOCKEY_GAMES[key];

      if (game.gameStarted) {
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

          }

        }

        // Update sockets
        io.sockets.emit('airhockey_update', AIRHOCKEY_GAMES[key]);
      }

    }
  }

};