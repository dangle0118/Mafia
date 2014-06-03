define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.mafiaCtrl',[])
    .controller('MafiaCtrl', ['$scope','socket', 'gameProfile',
      function ($scope, socket, gameProfile) {

        socket.forward('kill village', $scope);
        $scope.$on('socket:kill village', onKillVillage);
        function onKillVillage(ev, data) {
          //TODO: implemend
        }

        $scope.killVillage = function () {
          if ($scope.choosePlayer !== '') {
            socket.emit('kill village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
        }    
    }])
})