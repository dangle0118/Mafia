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
    mafiaNumber: 0,
    deadList: [],
    onBadSide: function (player) {
      var character = this.mapPlayer[player];
      return (onBadSide(character));
    },
    killPlayer: function (player) {
      this.deadList.push(player);
      this.gameCap -=1;
      if (this.mapPlayer[player] != "village")
        this.amountRole -=1;
      if (this.onBadSide(player)) {
        this.mafiaNumber -= 1;
      }
    },
    resetVote: function () {
      for (var character in this.role) {
        this.role[character].userName = '';
        this.role[character].votePlayer = '';
      }
      for (var player in this.votePlayers) {
        this.votePlayers[player] = 0;
      }
      this.currentSubmit = 0;
      this.voteAmount = 0;
    },
    isEndGame: function () {
      console.log(this.gameCap, this.mafiaNumber);
      if (this.mafiaNumber == 0)
        return "village win";
      if (this.gameCap - this.mafiaNumber <= this.mafiaNumber)
        return 'mafia win';
      return null;
    }
  };

  var characterList = generateCharacters(game.gameCap, game.gameRoles);
  var count = 0;

  for (var i = 0; i < characterList.length; ++i) {
    GameProcess[game._id].mapPlayer[game.currentPlayers[i]] = characterList[i];
    GameProcess[game._id].votePlayers[game.currentPlayers[i]] = 0;

    GameProcess[game._id].role[characterList[i]] = {};
    if (characterList[i] != 'village')
      count += 1;
    if (onBadSide(characterList[i])) {
      GameProcess[game._id].mafiaNumber += 1;
    }
  }
  GameProcess[game._id].amountRole = count;
  return GameProcess[game._id];
};

Process.getGameProcess = function (Id) { return GameProcess[Id] };

Process.updateProcess = function (Id, gameInfo) { GameProcess[Id] = gameInfo};

Process.getHighestVote = function (Id) {
  var highest = 0;
  var name = '';
  for (var player in GameProcess[Id].votePlayers) {
    if (GameProcess[Id].votePlayers[player] > highest ) {
      highest = GameProcess[Id].votePlayers[player];
      name = player;
    }
  }
  return name;
};

Process.checkEqualVote = function (Id, player) {
  for (var temp in GameProcess[Id].votePlayers) {
    if (GameProcess[Id].votePlayers.hasOwnProperty(temp))
      if ((temp !== player) && (GameProcess[Id].votePlayers[temp] === GameProcess[Id].votePlayers[player]))
        return true;
  }
  return false;
}


