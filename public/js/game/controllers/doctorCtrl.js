define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.doctorCtrl',[])
    .controller('DoctorCtrl', ['$scope','socket', 'gameProfile','userProfile',
      function ($scope, socket, gameProfile, userProfile) {

        $scope.saveVillage = function () {
          if ($scope.$parent.choosePlayer !== '') {
            socket.emit('save village', {role: userProfile.userCharacter, votePlayer: $scope.$parent.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
        }

    }])
})