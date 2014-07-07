define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.policeCtrl',[])
    .controller('PoliceCtrl', ['$scope','socket', 'gameProfile','userProfile', 'gameLog',
      function ($scope, socket, gameProfile, userProfile, gameLog) {
        var choosePlayer;

        $scope.inspect = function () {
          console.log(userProfile);
          if ($scope.$parent.choosePlayer !== '') {
            choosePlayer = $scope.$parent.choosePlayer;
            socket.emit('inspect village', {role: userProfile.userCharacter, votePlayer: $scope.$parent.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
        }

        socket.forward('inspect village', $scope);
        $scope.$on('socket:inspect village', onInspect);
        function onInspect(ev, data) {
          gameLog.addLog('general', null, choosePlayer + ' ' + data.result);
        }

    }])
})