define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.dashboardCtrl',[])
    .controller('DashboardCtrl',['$scope','socket', 'gameProfile','userProfile', 
      function ($scope, socket, gameProfile, userProfile) {

        $scope.game = {}

        function checkValidInfo () {
          return true;
        }

        function generateGameChar (charList) {
          var gameCharList = [];
          angular.forEach(charList, function (value, key) {
            if (value) {
              gameCharList.push(key);
            }
          });
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
            $scope.$state.go('waitingRoom');
          }
        }
    }])
})