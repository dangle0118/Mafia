define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.gameLogCtrl', [])
    .controller('GameLogCtrl', ['$scope', 'socket', 'gameProfile', 'userProfile', 'gameProcess', 'gameLog',
      function ($scope, socket, gameProfile, userProfile, gameProcess, gameLog) {
        $scope.gameLog = gameLog.gameLog;
      }])
})