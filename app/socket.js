module.exports = function(io, db) {

  var clientUtil = {
    onLeaveGame: function (client, data) {
      Game.find({_id: data.gameID}, function (err, gameInfo) {
        if (!err) {
          var game = gameInfo[0];
          var pos = game.currentPlayers.indexOf(data.userName);
          game.currentPlayers.splice(pos, 1);
          client.broadcast.to(game._id).emit('player leave', {userName: data.userName});
          if (game.currentPlayers.length == 0) {
            client.broadcast.emit('remove game', {gameID: game._id});
            game.remove();
          } else {
            game.save();
          };
        };
      });
    }
  };

  io.sockets.on('connection', onConnection);

  function onConnection(client) {
    console.log('new client connected: ' + client.id);

    require('../app/socketAct/lobbyAct')(io, client, db);
    require('../app/socketAct/waitingAct')(io, client, db);
    require('../app/socketAct/inGameAct')(io, client, db);
    require('../app/socketAct/gameUtilAct')(io, client, db);




	
	  








  }


}