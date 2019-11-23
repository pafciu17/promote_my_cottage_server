const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(1917);

io.on('connection', (socket) => {

  socket.on('fetch_map_suggestions', (mapLocation) => {
    console.log('Recived map data');
    console.log(mapLocation);
    console.log('Preparing map suggestions....');
    setTimeout(() => {
      socket.emit('fetch_map_suggestions_done', { status: 'all good!!'});
    }, 2000)
  })

});
