module.exports = function(io, db) {


//  var InGameAct = require('socketAct/inGameAct')(db);


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


    client.on('disconnect', onDisconnect);




    client.on('day chat', onDayChat);
    client.on('night chat', onNightChat);







    function onDayChat(data) {
      client.broadcast.to(data.gameID).emit('day chat', {userName: data.userName, msg: data.msg});
    }

    function onNightChat(data) {
      var playerList = GameProcess[data.gameID].votePlayers;

      for (var player in playerList) {
        if (GameProcess[data.gameID].badSide.hasOwnProperty(player) && player !== data.userName) {
          io.sockets.socket(GameProcess[data.gameID].badSide[player]).emit('night chat', {userName: data.userName, msg: data.msg})
        }
      }
    }

    function onDisconnect() {
      User.find({socket: client.id }, function (err, userInfo) {
        if (!err && userInfo.length > 0) {
          var user = userInfo[0];
          if (user.inState && user.inState !== 'LOBBY') {
            clientUtil.onLeaveGame(client, {gameID: user.inGame, userName: user.userName});
          };
        };

      });
    }





  }


}