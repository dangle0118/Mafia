define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.mafiaCtrl',[])
    .controller('MafiaCtrl', ['$scope','socket', 'gameProfile','userProfile',
      function ($scope, socket, gameProfile, userProfile) {

        socket.forward('kill village', $scope);
        $scope.$on('socket:kill village', onKillVillage);
        function onKillVillage(ev, data) {
          //TODO: implemend
        }

        $scope.killVillage = function () {
          if ($scope.$parent.choosePlayer !== '') {
            socket.emit('kill village', {role: userProfile.userCharacter, votePlayer: $scope.$parent.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
        }    
    }])
})