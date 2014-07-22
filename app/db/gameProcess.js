var Process = exports;
var badSide = ['mafia', 'hooker'];
var GameProcess = {};

function onBadSide(character) {
  for (var i = 0; i < badSide.length; ++i) {
    if (character == badSide[i])
      return true;
  }
  return false;
}

function generateCharacters(gameCap, gameRoles) {
  var result = [];
  var pos;
  for (var i = 0; i < gameRoles.length; ++i) {
    do {
      // random from 0 - 9
      pos = Math.floor((Math.random() * 10) );
    } while ( (typeof result[pos] != 'undefined') || (pos >= gameCap));
    result[pos] = gameRoles[i];
  }
  for (var i = 0; i < gameCap; ++i) {
    if (typeof result[i] == 'undefined') {
      result[i] = 'village';
    }
  }
  return result;
}

Process.init = function (game) {
  GameProcess[game._id] = {
    state: 'GAME',
    gameCap: game.gameCap,
    role: {},
    amountRole: 0,
    currentSubmit: 0,
    votePlayers: {},
    voteAmount: 0,
    mapPlayer: {},
    badSide: {}
  };

  var characterList = generateCharacters(game.gameCap, game.gameRoles);
  var count = 0;
  for (var role = 0; role < characterList.length; ++role) {
    GameProcess[game._id].role[characterList[role]] = {};
    if (characterList[role] != 'village') {
      count += 1;
    }
  }
  GameProcess[game._id].amountRole = count;

  for (var i = 0; i < characterList.length; ++i) {
    GameProcess[game._id].mapPlayer[game.currentPlayers[i]] = characterList[i];
  }

  return GameProcess[game._id];
}


