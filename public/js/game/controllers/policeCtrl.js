define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.policeCtrl',[])
    .controller('PoliceCtrl', ['$scope','socket', 'gameProfile','userProfile',
      function ($scope, socket, gameProfile, userProfile) {

        $scope.inspect = function () {
          if ($scope.$parent.choosePlayer !== '') {
            socket.emit('inspect village', {role: userProfile.userCharacter, votePlayer: $scope.$parent.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
        }

        socket.forward('inspect village', $scope);
        $scope.$on('socket:inspect village', onInspect);
        function onInspect(ev, data) {
          console.log(data);
        }

    }])
})