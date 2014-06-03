define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.hookerCtrl',[])
    .controller('HookerCtrl', ['$scope','socket', 'gameProfile',
      function ($scope, socket, gameProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('hook village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
    }])
})