module.exports = function (io, client, db) {
  var GameProcess = db.GameProcess;
  var clientHelper = require('../socketAct/clientHelper')(db);

  client.on('vote player', onVotePlayer);
  client.on('sleep', onSleep);
  client.on('kill village', onNightAction);
  client.on('save village', onNightAction);
  client.on('inspect village', onNightAction);
  client.on('hook village', onNightAction);



  function onVotePlayer(data) {
    var gameInfo = GameProcess.getGameProcess(data.gameID);

    io.sockets.in(data.gameID).emit('vote player', {status: 'success', votePlayer: data.votePlayer, fromUser: data.userName});
    gameInfo.votePlayers[data.votePlayer] += 1;
    gameInfo.voteAmount += 1;

    if (gameInfo.voteAmount == gameInfo.gameCap) {
      var player = GameProcess.getHighestVote(data.gameID);
      if (!GameProcess.checkEqualVote(data.gameID, player)) {
        io.sockets.in(data.gameID).emit('kill player', {status: 'success', player: player, character: gameInfo.mapPlayer[player]});
        gameInfo.killPlayer(player);
        clientHelper.onEndGame(io, data.gameID, gameInfo);
      }
    }
    //GameProcess.updateProcess(data.gameID, gameInfo);
  }

  function executeAction(gameInfo) {
    console.log(gameInfo)
    var killList = [];
    if (gameInfo.role.hasOwnProperty('hooker')) {
      for (var character in gameInfo.role) {
        if (gameInfo.role[character].userName === gameInfo.role['hooker'].votePlayer) {
          gameInfo.role[character].userName = '';
          break;
        }
      }
    }
    if (gameInfo.role.hasOwnProperty('doctor')) {
      if (gameInfo.role['mafia'].votePlayer === gameInfo.role['doctor'].votePlayer) {
        gameInfo.role['mafia'].votePlayer = '';
      }
    }
    if (gameInfo.role.hasOwnProperty('mafia')) {
      for (var character in gameInfo.role) {
        if (gameInfo.role[character].userName === gameInfo.role['mafia'].votePlayer) {
          gameInfo.role[character].userName = '';
          break;
        }
      }
    }
    if (gameInfo.role.hasOwnProperty('police')) {
      var msg = '';
      if(gameInfo.role['police'].userName !== '') {
        if (gameInfo.onBadSide(gameInfo.role['police'].votePlayer)) {
          msg = 'not a village';
        } else {
          msg = 'is a village';
        }
        io.sockets.in(gameInfo.role['police'].userName).emit('inspect village', {result: msg});
      }
    }
    if (gameInfo.role['mafia'].votePlayer !== '') {
      killList.push(gameInfo.role['mafia'].votePlayer);
    }
    return killList;
  }

  function onNightAction(data) {
    var gameInfo = GameProcess.getGameProcess(data.gameID);
    gameInfo.role[data.role] = {userName: data.userName, votePlayer: data.votePlayer};
    gameInfo.currentSubmit +=1;
    if (gameInfo.currentSubmit == gameInfo.amountRole) {
      var killList = executeAction(gameInfo);
      //broad cast wake up to all players
      io.sockets.in(data.gameID).emit('wake up', {status: 'wakeup'});
      gameInfo.currentSubmit = 0;
      gameInfo.voteAmount = 0;
      for (var i = 0; i < killList.length; ++i) {
        var player = killList[i];
        console.log('kill ' + player);
        io.sockets.in(data.gameID).emit('kill player', {status: 'success', player: player, character: gameInfo.mapPlayer[player]});
        gameInfo.killPlayer(player);
      }
      clientHelper.onEndGame(io, data.gameID, gameInfo);
      gameInfo.resetVote();
    }
  }

  function onSleep(data) {
    io.sockets.in(data.gameID).emit('sleep', {status: 'success', userName: data.userName});
  }






}