module.exports = function (db) {
  var GameProcess = db.GameProcess;
  var Game = db.Game;

  function onLeaveRoom(client, data) {
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
        }
      }
    });
  }

  function onEndGame(io, gameId, gameInfo) {
    var result = gameInfo.isEndGame();
    console.log(result);
    if (result !== null) {
      io.sockets.in(gameId).emit('end game',{status: result});
    }
  }

  return {
    onLeaveRoom: onLeaveRoom,
    onEndGame: onEndGame
  }
}

