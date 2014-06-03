define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.dashboardCtrl',[])
    .controller('DashboardCtrl',['$scope','socket', 'gameProfile','userProfile', 
      function ($scope, socket, gameProfile, userProfile) {

        $scope.game = {}

        function checkValidInfo () {
          return true;
        }

        $scope.createGame = function () {
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