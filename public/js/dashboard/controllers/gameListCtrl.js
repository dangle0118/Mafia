define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.gameListCtrl',[])    
    .controller('GameListCtrl',['$scope', 'socket', 'gameProfile', 'userProfile',
      function ($scope, socket, gameProfile, userProfile) {
        $scope.room = {};
        
        socket.emit('get list');
        socket.forward('get list', $scope);
        $scope.$on('socket:get list', onGetList);
        function onGetList(ev, data) {
          $scope.roomList = data.data;
        }

        socket.forward('add game', $scope);
        $scope.$on('socket:add game', onAddGame);
        function onAddGame(ev, data) {
          //TODO: add content
          console.log('add');
        }

        socket.forward('remove game', $scope);
        $scope.$on('socket:remove game', onAddGame);
        function onAddGame(ev, data) {
          //TODO: add content
          console.log('remove');
        }

        $scope.joinGame = function () {
          socket.emit('join game', {userName: userProfile.userName, 
                                    userID: userProfile.userID,
                                    gameID: $scope.gameChoose});          
        }

        socket.forward('join game', $scope);
        $scope.$on('socket:join game', onJoinGame);
        function onJoinGame(ev, data) {
          if (data.status === 'success'){
            console.log(data);
            
            gameProfile.init(data.data);
            $scope.$state.go('waitingRoom');            
          } else {
            console.log("cannot join game");
          };
        }    
    }])
})