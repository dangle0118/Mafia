define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.gameboardCtrl',[])
    .controller('GameBoardCtrl',['$scope','socket', 'gameProfile','userProfile', 'gameProcess','gameLog',
      function ($scope, socket, gameProfile, userProfile, gameProcess, gameLog) {
        $scope.gameProcess = gameProcess;
        $scope.character = userProfile.userCharacter;

        $scope.choosePlayer = '';     

        function killPlayer(player, character) {
          gameLog.addLog('kill', player, character);
          gameProcess.gameCap -= 1 ;
          gameProcess.deadList.push(player);
          if (gameProfile.onMafiaSide(character)) {
            gameProcess.mafiaAmount -=1;
          }
          if (player === userProfile.userName) {
            $scope.$state.go('dead');
          }
          //check end game condition
          if ((gameProcess.gameCap - gameProcess.mafiaAmount <= gameProcess.mafiaAmount) || (gameProcess.mafiaAmount === 0)) {
            $scope.$state.go('end');
          }
        }

        $scope.isDead = function(player) {
          if ((gameProcess.deadList != []) && (gameProcess.deadList.indexOf(player) === -1))
          {
            return false;
          }
          return true;
        }

        socket.forward('wake up', $scope);
        $scope.$on('socket:wake up', onWakeUp);
        function onWakeUp(ev, data) {
          gameProcess.day += 1;
          gameProcess.sleepAmount = 0;
          gameProcess.isNight = false;
          $scope.$state.go('game.day');
        }

        socket.forward('vote player', $scope);
        $scope.$on('socket:vote player', onVotePlayer);
        function onVotePlayer(ev, data) {
          gameLog.addLog('vote', data.votePlayer, data.fromUser);
        }

        socket.forward('kill player', $scope);
        $scope.$on('socket:kill player', onPlayerKilled);
        function onPlayerKilled(ev, data) {
          killPlayer(data.player, data.character);
        }

        socket.forward('sleep', $scope);
        $scope.$on('socket:sleep', onSleep);
        function onSleep(ev, data) {
          gameProcess.sleepAmount += 1;
          gameLog.addLog('sleep', data.userName);
          if (gameProcess.sleepAmount == gameProcess.gameCap) {
            gameProcess.isNight = true;
            $scope.$state.go('game.'+userProfile.userCharacter);
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