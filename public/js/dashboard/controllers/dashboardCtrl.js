define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.dashboardCtrl',[])
    .controller('DashboardCtrl',['$scope','socket', 'gameProfile','userProfile', 'gameLog',
      function ($scope, socket, gameProfile, userProfile, gameLog) {

        $scope.game = {}

        function checkValidInfo () {
          return true;
        }

        function generateGameChar (charList) {
          var gameCharList = [];
          var countChar = 0;
          angular.forEach(charList.goodSide, function (value, key) {
            if (value) {
              gameCharList.push(key);
            }
          });
          angular.forEach(charList.badSide, function (value, key) {
            if (value) {
              gameCharList.push(key);
              countChar += 1;
            }
          });
          while (countChar < $scope.game.mafiaAmount) {
            gameCharList.push('mafia');
            countChar += 1;
          }
          return gameCharList;
        }

        $scope.createGame = function () {
          $scope.game.gameChar = generateGameChar($scope.gameChar);
          //TODO: check validation

          if (checkValidInfo()) {
            $scope.game.userName = userProfile.userName;
            socket.emit('create game', $scope.game);
          }
        }  

        socket.forward('create game', $scope);
        $scope.$on('socket:create game', onCreateGame);
        function onCreateGame(ev, data) {        
          if (data.status === 'success') {            
            gameProfile.init(data);
            gameLog.init(gameProfile.currentPlayers, gameProfile.currentPlayers.length);
            $scope.$state.go('waitingRoom');
          }
        }
    }])
})