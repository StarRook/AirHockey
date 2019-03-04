exports = module.exports = function(socket) {

  const handler = require('./airhockey_handler');

  socket.on('testi', (data) => {
    console.log(data);
  });

};