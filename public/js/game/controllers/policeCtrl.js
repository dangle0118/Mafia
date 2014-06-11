define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.policeCtrl',[])
    .controller('PoliceCtrl', ['$scope','socket', 'gameProfile','userProfile',
      function ($scope, socket, gameProfile, userProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('inspect village', {role: userProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };          

    }])
})