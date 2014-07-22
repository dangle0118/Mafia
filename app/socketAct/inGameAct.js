module.exports = function (io, client, db) {
  var User = db.User;
  var Game = db.Game;
  var GameProcess = db.GameProcess;

  client.on('vote player', onVotePlayer);
  client.on('sleep', onSleep);
  client.on('kill village', onNightAction);
  client.on('save village', onNightAction);
  client.on('inspect village', onNightAction);
  client.on('hook village', onNightAction);

  function getHighestVote(ID) {
    var highest = 0;
    var name = '';
    for (var player in GameProcess[ID].votePlayers) {
      if (GameProcess[ID].votePlayers[player].vote > highest ) {
        highest = GameProcess[ID].votePlayers[player].vote;
        name = player;
      }
    }
    return name;
  }

  function checkEqualVote(player, ID) {
    for (var temp in GameProcess[ID].votePlayers) {
      if (GameProcess[ID].votePlayers.hasOwnProperty(temp)) {
        if ((temp !== player) && (GameProcess[ID].votePlayers[temp].vote === GameProcess[ID].votePlayers[player].vote)) {
          return true;
        }
      }
    }
    return false;
  }

  function onVotePlayer(data) {
    io.sockets.in(data.gameID).emit('vote player', {status: 'success', votePlayer: data.votePlayer, fromUser: data.userName});
    GameProcess[data.gameID].votePlayers[data.votePlayer].vote += 1;
    GameProcess[data.gameID].voteAmount += 1;

    if (GameProcess[data.gameID].voteAmount == GameProcess[data.gameID].gameCap) {
      var player = getHighestVote(data.gameID);
      if (!checkEqualVote(player, data.gameID)) {
        io.sockets.in(data.gameID).emit('kill player', {status: 'success', player: player, character: GameProcess[data.gameID].votePlayers[player].character});
        GameProcess[data.gameID].gameCap -=1;
        if (GameProcess[data.gameID].votePlayers[player].character != "village") {
          GameProcess[data.gameID].amountRole -=1;
        }
      }
    }
  }

  function executeAction(ID) {
    var killList = {};
    if (GameProcess[ID].role.hasOwnProperty('hooker')) {
      for (var character in GameProcess[ID].role) {
        if (GameProcess[ID].role[character].userName === GameProcess[ID].role['hooker'].votePlayer) {
          GameProcess[ID].role[character].userName = '';
          break;
        }
      }
    }
    if (GameProcess[ID].role.hasOwnProperty('mafia')) {
      for (var character in GameProcess[ID].role) {
        if (GameProcess[ID].role[character].userName === GameProcess[ID].role['mafia'].votePlayer) {
          GameProcess[ID].role[character].userName = '';
          break;
        }
      }
    }
    if (GameProcess[ID].role.hasOwnProperty('doctor')) {
      if (GameProcess[ID].role['mafia'].votePlayer === GameProcess[ID].role['doctor'].votePlayer) {
        GameProcess[ID].role['mafia'].votePlayer = '';
      }
    }
    if (GameProcess[ID].role.hasOwnProperty('police')) {
      var msg = '';
      if(GameProcess[ID].role['police'].userName !== '') {
        if (GameProcess.onBadSide(GameProcess[ID].votePlayers[GameProcess[ID].role['police'].votePlayer].character)) {
          msg = 'not a village';
        } else {
          msg = 'is a village';
        }
        io.sockets.in(GameProcess[ID].role['police'].userName).emit('inspect village', {result: msg});
      }
    }
    if (GameProcess[ID].role['mafia'].votePlayer !== '') {
      killList[GameProcess[ID].role['mafia'].votePlayer] = GameProcess[ID].votePlayers[GameProcess[ID].role['mafia'].votePlayer].character;
    }
    return killList;
  }

  function onNightAction(data) {
    GameProcess[data.gameID].role[data.role] = {userName: data.userName, votePlayer: data.votePlayer};
    GameProcess[data.gameID].currentSubmit +=1;
    if (GameProcess[data.gameID].currentSubmit == GameProcess[data.gameID].amountRole) {
      var killList = executeAction(data.gameID);
      //broad cast wake up to all players
      io.sockets.in(data.gameID).emit('wake up', {status: 'wakeup'});

      GameProcess[data.gameID].currentSubmit = 0;
      GameProcess[data.gameID].voteAmount = 0;
      for (var player in killList) {
        io.sockets.in(data.gameID).emit('kill player', {status: 'success', player: player, character: killList[player]});
        GameProcess[data.gameID].gameCap -=1;
        if (GameProcess[data.gameID].votePlayers[player].character != "village") {
          GameProcess[data.gameID].amountRole -=1;
        }
      }
    }
  }

  function onSleep(data) {
    io.sockets.in(data.gameID).emit('sleep', {status: 'success', userName: data.userName});
  }






}