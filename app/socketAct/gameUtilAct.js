module.exports = function (io, client, db) {
  var User = db.User;
  var GameProcess = db.GameProcess;
  var clientHelper = require('../app/socketAct/clientHelper')(db);

  client.on('day chat', onDayChat);
  client.on('night chat', onNightChat);

  client.on('disconnect', onDisconnect);
  client.on('leave game', onLeaveGame);



  function onDayChat(data) {
    client.broadcast.to(data.gameID).emit('day chat', {userName: data.userName, msg: data.msg});
  }

  function onNightChat(data) {
    var gameInfo = GameProcess.getGameProcess(data.gameID);
    var playerList = gameInfo.mapPlayer;

    for (var player in playerList) {
      if (playerList.hasOwnProperty(player) && gameInfo.onBadSide(player)) {
        io.sockets.in(player).emit('night chat', {userName: data.userName, msg: data.msg})
      }
    }
  }

  function onDisconnect() {
    User.find({socket: client.id }, function (err, userInfo) {
      if (!err && userInfo.length > 0) {
        var user = userInfo[0];
        if (user.inState && user.inState == 'WAITING') {
          clientHelper.onLeaveRoom(client, {gameID: user.inGame, userName: user.userName});
        } else if (user.inState && user.inState == 'GAME') {
          client.broadcast.to(user.inGame).emit('player disconnect', {userName: data.userName});
        }
      }
    });
  }

  function onLeaveGame(data) {
    var gameInfo = GameProcess.getGameProcess(data.gameID);
    if (gameInfo.deadList.indexOf(data.userName) < 0) {
      gameInfo.killPlayer(data.userName);
    }
    client.broadcast.to(data.gameID).emit('player leave', {userName: data.userName, character: gameInfo.mapPlayer[data.userName]});
  }




};