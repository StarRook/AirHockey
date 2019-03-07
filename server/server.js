exports = module.exports = function(io) {

  io.on('connection', (socket) => {

    require('./airhockey/airhockey_listener')(socket, io);
    const airhockey_handler = require('./airhockey/airhockey_handler');

    // Setup airhockey game loop
    const airhockey_updater = setInterval(() => {
      airhockey_handler.updateGames(io);
    }, 1000/60);

    console.log('New connection: ' + socket.id);

    socket.on('disconnect', () => {
      console.log('Disconnect', socket.id);
      airhockey_handler.deleteFromLobby(socket.id);
      airhockey_handler.deleteFromGames(socket.id);
      io.sockets.emit('airhockey_lobby_update', airhockey_handler.getLobby());
    });

    socket.on('lobby_enter', (data) => {
      const lobby = data.lobby;
      const username = data.username;
      switch (lobby) {
        case 'airhockey':
          airhockey_handler.addNewPlayerToLobby({
            id: socket.id,
            username: username
          });
          io.sockets.emit('airhockey_lobby_update', airhockey_handler.getLobby());
          break;
      }
    });

    socket.on('lobby_leave', (data) => {

    });

  });

};