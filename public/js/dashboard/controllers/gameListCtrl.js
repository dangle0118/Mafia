define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.gameListCtrl',[])    
    .controller('GameListCtrl',['$scope', 'socket', 'gameProfile', 'userProfile', 'gameLog',
      function ($scope, socket, gameProfile, userProfile, gameLog) {
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
          $scope.roomList[data.gameID] = data;
        }

        socket.forward('remove game', $scope);
        $scope.$on('socket:remove game', onRemoveGame);
        function onRemoveGame(ev, data) {
          delete $scope.roomList[data.gameID];
        }

        $scope.joinGame = function (gameID) {
          socket.emit('join game', {userName: userProfile.userName,
                                    userID: userProfile.userID,
                                    gameID: gameID});
        }

        socket.forward('join game', $scope);
        $scope.$on('socket:join game', onJoinGame);
        function onJoinGame(ev, data) {
          if (data.status === 'success'){
            gameProfile.init(data.data);
            gameLog.init(gameProfile.currentPlayers, gameProfile.currentPlayers.length);
            $scope.$state.go('waitingRoom');            
          } else {
            console.log("cannot join game");
          };
        }

    }])
})