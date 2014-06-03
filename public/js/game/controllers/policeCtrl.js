define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.policeCtrl',[])
    .controller('PoliceCtrl', ['$scope','socket', 'gameProfile',      
      function ($scope, socket, gameProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('inspect village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };          

    }])
})