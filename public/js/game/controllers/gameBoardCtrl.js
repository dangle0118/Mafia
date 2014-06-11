define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.gameboardCtrl',[])
    .controller('GameBoardCtrl',['$scope','socket', 'gameProfile','userProfile', 'gameProcess', 
      function ($scope, socket, gameProfile, userProfile, gameProcess) {
        $scope.gameProcess = gameProcess;
        console.log($scope.gameProcess)
        $scope.character = userProfile.userCharacter;        
        $scope.isNight = false;
        $scope.choosePlayer = '';     

        function killPlayer(player, character) {
          console.log('kill ' + player + ' ' + character );
          if (player === userProfile.userName) {
              $scope.$state.go('game.dead');
          }


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
          $scope.$state.go('game');          
        }

        socket.forward('vote player', $scope);
        $scope.$on('socket:vote player', onVotePlayer);
        function onVotePlayer(ev, data) {
          
        }

        socket.forward('kill player', $scope);
        $scope.$on('socket:kill player', onPlayerKilled);
        function onPlayerKilled(ev, data) {
          killPlayer(data.player, data.character);
        }

        socket.forward('sleep', $scope);
        $scope.$on('socket:sleep', onSleep);
        function onSleep(ev, data) {
          console.log(userProfile.userCharacter);
          gameProcess.sleepAmount += 1;
            console.log(gameProcess.sleepAmount);
          if (gameProcess.sleepAmount == gameProcess.gameCap) {
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