define(["angular", "btford.socket-io"], function (angular) {
  "use strict";

  return angular.module("utils.services", ["btford.socket-io"])
    
    .factory("socket", ["socketFactory", function (socketFactory) {
      return socketFactory({
        ioSocket: io.connect("http://localhost", {port: 8080, transports: ["websocket"]})
      });
    }])
    .factory("userProfile", function () {
      return  {
        userName:"",
        userID: "",
        userCharacter: ""
      };
    })
    .factory("gameProfile", function () {
      return {
        init: function (data) {
          angular.extend(this, {
            roomName: data.roomName,
            gameID: data.gameID,
            gameCap: data.gameCap,
            currentPlayers: data.currentPlayers,
            gameRoles: data.gameRoles,
            mafiaAmount: data.mafiaAmount,
            isCreator: data.isCreator
          });
        },
        joinPlayer: function (userName) {
          this.currentPlayers.push(userName);
        },
        getCurrentPlayers: function () {
          var list = [];
          for (var player in this.currentPlayers) {
            list.push(this.currentPlayers[player]);
          }
          return list;
        },
        onMafiaSide: function(character) {
          if (character == 'mafia' || character=='hooker') {
            return true;
          }
          return false;
        }
      };
    })
    .factory("gameProcess", function () {
      return {
        init: function (gameCap, playerList, mafiaAmount) {
          angular.extend(this, {
            day: 1,
            gameCap: gameCap,
            isDead: false,
            playerList: playerList,
            deadList: [],
            sleepAmount: 0,
            mafiaAmount: mafiaAmount
          });
        },
        reset: function () {
          angular.extend(this, {
            isNight: false,
            isSleep: false,
            isVoted: false,
            sleepAmount: 0
          });
        }
      }
    })
    .factory("gameLog", function () {

      function putPlayer(playerList) {
        var playerColor = [];
        for (var i = 0; i < playerList.length; ++i) {
          playerColor[i] = playerList[i];
        }
        return playerColor;
      }
      return {
        init: function (playerList, playerAmount) {
          this.gameLog = [];
          this.dayChatLog = [];
          this.nightChatLog = [];
          this.playerColor = putPlayer(playerList);
          this.playerAmount = playerAmount;
        },
        refreshLog: function () {
          this.gameLog = [];
        },
        addPlayer: function (player) {
          this.playerAmount += 1;
          for (var i =0; i < this.playerAmount; ++i) {
            if (!angular.isDefined(this.playerColor[i]) || this.playerColor[i] == null) {
              this.playerColor[i] = player;
            }
          };
        },
        removePlayer: function (player) {
          this.playerAmount -=1;
          this.playerColor[this.getColor(player)] = null;
        },
        getColor: function (player) {
          return this.playerColor.indexOf(player);
        },
        addLog: function (command, votePlayer, data) {
          var aLog = {};
          switch(command) {
            case 'vote':
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = data + ' voted ' + votePlayer;
              this.gameLog.push(aLog);
              break;
            case 'kill':
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = votePlayer + ' (' + data + ') has been killed';
              this.gameLog.push(aLog);
              break;
            case 'join':
              this.addPlayer(votePlayer);
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = votePlayer + ' has joined the game';
              this.gameLog.push(aLog);
              break;
            case 'leave':
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = votePlayer + ' has left the game';
              this.gameLog.push(aLog);
              this.removePlayer(votePlayer);
              break;
            case 'confirm':
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = votePlayer + ' is ready';
              this.gameLog.push(aLog);
              break;
            case 'cancel':
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = votePlayer + ' is not ready';
              this.gameLog.push(aLog);
              break;
            case 'sleep':
              aLog['color'] = this.getColor(votePlayer);
              aLog['content'] = votePlayer + ' is going to sleep';
              this.gameLog.push(aLog);
              break;
            case 'general':
              aLog['color'] = 'general';
              aLog['content'] = data;
              this.gameLog.push(aLog);
              break;
          }
          console.log(this.gameLog, this.playerColor, this.playerAmount);
        },
        addDayChat: function(userName, msg) {
          var aLog = {};
          aLog['color'] = this.playerColor[userName];
          aLog['player'] = userName;
          aLog['content'] = msg;
          this.dayChatLog.push(aLog);
        },
        addNightChat: function(userName, msg) {
          var aLog = {};
          aLog['color'] = this.playerColor[userName];
          aLog['player'] = userName;
          aLog['content'] = msg;
          this.nightChatLog.push(aLog);
        }
      };
    })
    
});