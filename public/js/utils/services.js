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
        init: function (gameCap, playerList) {
          angular.extend(this, {
            day: 1,
            gameCap: gameCap,
            isDead: false,
            playerList: playerList,
            deadList: [],
            sleepAmount: 0
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
    
});