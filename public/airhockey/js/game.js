$(function () {

  const socket = io();

  socket.emit('testi', 'message');

  socket.emit('lobby_enter', {
    lobby: 'airhockey',
  });

  socket.on('airhockey_lobby_update', (data) => {
    const sockets = data.sockets;
    const games = data.games;

    const playersElement = document.getElementById('players');
    playersElement.innerHTML = '';
    const gamesElement = document.getElementById('games');
    gamesElement.innerHTML = '';

    for (const key in sockets) {
      const data = sockets[key];
      const el = document.createElement('li');
      el.innerHTML = data.id;
      playersElement.appendChild(el);
    }

  });

  // Näiden muuttaminen vaatisi myös server puolen muutoksia. Tai sitten kaikki nää pitää saada serveriltä jotta serverillä voidaan laskea esim pelaajan rajoittaminen keskiviivaan
  const canvasWidth = 1800;
  const canvasHeight = 900;
  const playerRadius = 35;

  /* FUNCTIONS START */

  const drawScore = (player1, player2) => {

    const size = (canvasWidth / 30);

    ctx.font =  size + 'px Arial';
    ctx.fillText(player1, canvasWidth / 2 - 100, size);
    ctx.fillText(player2, canvasWidth / 2 + 60, size);
  };

  const drawLine = (color, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawArc = (color, x, y, r, fill) => {
    ctx.beginPath();
    if (fill) {
      ctx.fillStyle = color;
    } else {
      ctx.strokeStyle = color;
    }
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };

  const drawLinesToField = () => {

    // LINES

    //        color       X1                                      Y1  X2                                      Y2
    drawLine( '#9d0000',  canvasWidth / 2,                        0,  canvasHeight,                           canvasHeight);
    drawLine( '#00009d',  canvasWidth / 2 - canvasWidth * 0.2,    0,  canvasWidth / 2 - canvasWidth * 0.2,    canvasHeight);
    drawLine( '#00009d',  canvasWidth / 2 + canvasWidth * 0.2,    0,  canvasWidth / 2 + canvasWidth * 0.2,    canvasHeight);

    // ARCS

    //        color       X                   Y                                       R                   Fill
    drawArc(  '#9d0000',  canvasWidth / 2,    canvasHeight / 2,                       canvasWidth / 36,   false);
    drawArc(  '#9d0000',  canvasWidth / 2,    canvasHeight / 2,                       canvasWidth / 150,  true);
    drawArc(  '#4a81f5',  canvasWidth,        canvasHeight / 2,                       canvasHeight / 9,   true);
    drawArc(  '#4a81f5',  0,                  canvasHeight / 2,                       canvasHeight / 9,   true);
    drawArc(  '#cf2729',  0,                  canvasHeight / 2 - canvasHeight / 9,    5,                  true);
    drawArc(  '#cf2729',  0,                  canvasHeight / 2 + canvasHeight / 9,    5,                  true);
    drawArc(  '#cf2729',  canvasWidth,        canvasHeight / 2 - canvasHeight / 9,    5,                  true);
    drawArc(  '#cf2729',  canvasWidth,        canvasHeight / 2 + canvasHeight / 9,    5,                  true);
  };

  /* FUNCTIONS END */

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext("2d");

  canvas.addEventListener('mousemove', (event) => {
    socket.emit('airhockey_move', [event.clientX, event.clientY]);
  });

  // Draw lines
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawLinesToField();

  socket.on('airhockey_update', (data) => {

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawLinesToField();

    for (const player of data.players) {

      let fillStyle = '#0c2984';

      if (player.no === 1) {
        fillStyle = '#ad222d';
      }

      drawArc(fillStyle, player.x, player.y, playerRadius, true);
    }

    const puck = data.puck;

    drawArc(puck.color, puck.x, puck.y, puck.r, true);

    drawScore(data.score.player1, data.score.player2);

  });
});