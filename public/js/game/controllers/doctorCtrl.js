define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.doctorCtrl',[])
    .controller('VillageCtrl', ['$scope','socket', 'gameProfile',
      function ($scope, socket, gameProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('save village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };        

    }])
})