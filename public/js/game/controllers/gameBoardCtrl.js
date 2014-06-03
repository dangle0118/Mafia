define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.gameboardCtrl',[])
    .controller('GameBoardCtrl',['$scope','socket', 'gameProfile','userProfile', 'gameProcess', 
      function ($scope, socket, gameProfile, userProfile, gameProcess) {

        $scope.character = userProfile.userCharacter;        
        $scope.isNight = false;
        $scope.choosePlayer = '';     

        function killPlayer(player, character) {
          //TODO: incomplete
          gameProcess.gameCap -= 1 ;            
          gameProcess.deadList.push(player);
          if (gameProfile.onMafiaSide(character)) {
            gameProcess.mafiaAmount -=1;
          }
        }

        $scope.$watch('gameProcess.gameCap', function (newValue) {
          if ((newValue - gameProcess.mafiaAmount) <= gameProcess.mafiaAmount ) {
            $scope.$state.go('end');
          }

        });

        $scope.isDead = function(player) {
          if (gameProcess.deadList.indexOf(player) === -1)
            return true;
          return false;
        }

        socket.forward('wake up', $scope);
        $scope.$on('socket:wake up', onWakeUp);
        function onWakeUp(ev, data) {
          gameProcess.day += 1;
          $scope.$state.go('game');          
        }

        socket.forward('vote player', $scope);
        $scope.$on('socket:vote player', onVotePlayer);
        function onVotePlayer(ev, data) {
          if ($scope.voteList.hasOwnProperty(data.votePlayer)) {
            $scope.voteList[data.votePlayer] += 1;
          } else {
            $scope.voteList[data.votePlayer] = 1;            
          }   
        }

        socket.forward('kill player', $scope);
        $scope.$on('socket:kill player', onPlayerKilled);
        function onPlayerKilled(ev, data) {
          //TODO: implemend
          console.log(data);
        }

        socket.forward('sleep', $scope);
        $scope.$on('socket:sleep', onSleep);
        function onSleep(ev, data) {
          //TODO: implemend
          $scope.sleepAmount += 1;
          if ($scope.sleepAmount == gameProfile.gameCap) {
            $scope.$state.go('game.'+gameProfile.userCharacter);
            
          }
        }

        $scope.votePlayer = function () {
          if ($scope.choosePlayer !== '') {
            socket.emit('vote player', {votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
          $scope.isVoted = true;
        }

        $scope.goSleep = function () {
          socket.emit('sleep', {gameID: gameProfile.gameID, userName: userProfile.userName});
          $scope.isSleep = true;          
        }   
    }])

})