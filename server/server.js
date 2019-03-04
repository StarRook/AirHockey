exports = module.exports = function(io) {

  io.on('connection', (socket) => {

    require('./airhockey/airhockey_listener')(socket);
    const airhockey_handler = require('./airhockey/airhockey_handler');

    console.log('New connection: ' + socket.id);

    socket.on('disconnect', () => {
      console.log('Disconnect', socket.id);
      airhockey_handler.deleteFromLobby(socket.id);
    });

    socket.on('lobby_enter', (data) => {
      const lobby = data.lobby;
      switch (lobby) {
        case 'airhockey':
          airhockey_handler.addNewPlayerToLobby(socket);
          socket.emit('airhockey_lobby_update', airhockey_handler.getLobby());
          break;
      }
    });

    socket.on('lobby_leave', (data) => {

    });

  });

};