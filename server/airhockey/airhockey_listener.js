exports = module.exports = function(socket, io) {

  const handler = require('./airhockey_handler');

  socket.on('airhockey_new_game', (data) => {
    handler.createNewGame(io, socket, data);
  });

  socket.on('airhockey_join_game', (data) => {
    handler.joinGame(io, socket, data);
  });

  socket.on('airhockey_move', (data) => {
    handler.movePlayer(io, socket, data);
  });

  socket.on('airhockey_game_update', () => {
    handler.updateGame(io, socket);
  });

  socket.on('airhockey_leave', () => {
    console.log('airhockey_leave');
    handler.deleteFromLobby(socket.id);
    handler.deleteFromGames(socket.id);
  });

};