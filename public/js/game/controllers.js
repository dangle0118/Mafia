define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers',[])
    .controller('GameBoardCtrl',['$scope','socket', 'gameProfile','userProfile', 
      function ($scope, socket, gameProfile, userProfile) {

        $scope.character = userProfile.userCharacter;
        $scope.day = 1;
        $scope.isNight = false;
        $scope.choosePlayer = "";
        $scope.playerList = gameProfile.currentPlayers;
        $scope.voteList = {};
        $scope.voteAmount = 0;
        $scope.sleepAmount = 0;
        $scope.isVoted = false;
        $scope.isSleep = false;

        function getHighestVote() {
          var highest = 0;
          var name = "";
          for (var player in $scope.playerList) {
            if ($scope.playerList[player] > 0 ) {
              highest = $scope.playerList[player];
              name = player;
            }
          }
          return player;
        }

        function killPlayer(player) {
          //TODO: incomplete
          gameProfile.gameCap -=1 ;
          $scope.voteList[player] = -1;
          $scope.voteAmount = 0;  
        }

        socket.forward('vote player', $scope);
        $scope.$on('socket:vote player', onVotePlayer);
        function onVotePlayer(ev, data) {
          if ($scope.voteList.hasOwnProperty(data.votePlayer)) {
            $scope.voteList[data.votePlayer] += 1;
          } else {
            $scope.voteList[data.votePlayer] = 1;            
          }
          $scope.voteAmount += 1;
          if ($scope.voteAmount == userProfile.gameCap) {
            $scope.voteAmount = 0;
            killPlayer(getHighestVote());            
          }
        }

        socket.forward('kill player', $scope);
        $scope.$on('socket:kill player', onPlayerKilled);
        function onPlayerKilled(ev, data) {
          //TODO: implemend
        }

        socket.forward('sleep', $scope);
        $scope.$on('socket:sleep', onSleep);
        function onSleep(ev, data) {
          //TODO: implemend
          $scope.sleepAmount += 1;
          if ($scope.sleepAmount == gameProfile.gameCap) {
            
          }
        }

        $scope.votePlayer = function () {
          if ($scope.choosePlayer !== "") {
            socket.emit('vote player', {votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
          $scope.isVoted = true;
        }

        $scope.goSleep = function () {
          socket.emit('sleep', {userName: userProfile.userName});
          $scope.isSleep = true;
        }









        //$scope.$state.go('game.'+userProfile.userCharacter);
    
    }])


})