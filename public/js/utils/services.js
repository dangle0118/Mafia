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
            list.push(player);
          }
          return list;
        }
      };
    })
    .factory("gameProcess", function () {
      return {
        init: function (data) {
          angular.extend(this, {
            day: 1,
            gameCap: data.gameCap,
            isDead: false,
            playerList: data.getCurrentPlayers(),
            deadList: []
          });
        },
        reset: function () {
          angular.extend(this, {
            isNight: false,
            isSleep: false,
            isVoted: false,

          });
        }
      }
    })
    
});