module.exports = function(io, mongoose) {
  
  io.sockets.on('connection', onConnection);

  function onConnection(client) {
    console.log("new client connected: " + client.id);

    client.on('new player', onNewPlayer);


    function onNewPlayer(data) {
      console.log('new player: ' + client.id);
      client.emit('new player', {status: 'success', username: data.username, id: client.id});
      
    }



  }


}