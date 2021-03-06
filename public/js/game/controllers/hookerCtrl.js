define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.hookerCtrl',[])
    .controller('HookerCtrl', ['$scope','socket', 'gameProfile','userProfile',
      function ($scope, socket, gameProfile, userProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('hook village', {role: userProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
    }])
})