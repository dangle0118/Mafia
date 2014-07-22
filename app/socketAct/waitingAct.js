module.exports = function (io, client, db) {
  var User = db.User;
  var Game = db.Game;
  var GameProcess = db.GameProcess;


  client.on('leave game', onLeaveGame);
  client.on('player confirm', onPlayerConfirm);
  client.on('player cancel', onPlayerCancel );
  client.on('start game', onStartGame);

  function onLeaveGame(data) {
    clientUtil.onLeaveGame(client, data);
  }

  function onPlayerConfirm(data) {
    client.broadcast.to(data.gameID).emit('player confirm', {userName: data.userName});
  }

  function onPlayerCancel(data) {
    client.broadcast.to(data.gameID).emit('player cancel', {userName: data.userName});
  }

  function onStartGame(data) {
    Game.find({_id: data.gameID }, function (err, gameInfo) {
      if (err) {
        client.emit('start game', {status: 'error', msg: 'game not exist'});
      } else {

        var game = gameInfo[0];
        var gameProcess = GameProcess.init(game);
        for (var i =0; i < game.gameCap; ++i) {
          //User.updateCharacter(game.currentPlayers[i], gameProcess.mapPlayer[game.currentPlayers[i]]);
          io.sockets.in( game.currentPlayers[i]).emit('start game', {status: 'success', character: gameProcess.mapPlayer[game.currentPlayers[i]]});
        }
        client.broadcast.emit('remove game', {status: 'success', roomName: game.roomName,
          gameID: game._id} );
      }
    });
  }

}