module.exports = function (io, client, db) {
  var GameProcess = db.GameProcess;
  var clientHelper = require('../app/socketAct/clientHelper')(io, client, db);

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
        if (user.inState && user.inState !== 'WAITING') {
          clientHelper.onLeaveGame(client, {gameID: user.inGame, userName: user.userName});
        }
      }

    });
  }




}