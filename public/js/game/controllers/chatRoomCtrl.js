define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers.chatRoomCtrl',[])
    .controller('ChatRoomCtrl', ['$scope','socket', 'gameProfile','gameProcess', 'userProfile', 'gameLog',
      function ($scope, socket, gameProfile, gameProcess, userProfile, gameLog) {
        $scope.dayLog = gameLog.dayChatLog;
        $scope.nightLog = gameLog.nightChatLog;
        $scope.badSide = gameProfile.onMafiaSide(userProfile.userCharacter);
        $scope.$watch(function () {return gameProcess.isNight}, function (newValue) {$scope.isNight = newValue; });




        socket.forward('day chat', $scope);
        $scope.$on('socket:day chat', onDayChat);
        function onDayChat(ev, data) {
          console.log(data);
          gameLog.addDayChat(data.userName, data.msg);
          console.log(gameLog);
        }

        socket.forward('night chat', $scope);
        $scope.$on('socket:night chat', onNightChat);
        function onNightChat(ev, data) {
          gameLog.addNightChat(data.userName, data.msg);
        }

        $scope.sendMessage = function () {
          if ($scope.msg) {
            if (gameProcess.isNight == null || !gameProcess.isNight) {
              socket.emit('day chat', {userName: userProfile.userName, gameID: gameProfile.gameID, msg: $scope.msg});
              gameLog.addDayChat(userProfile.userName, $scope.msg);
              $scope.msg = '';
              console.log(gameLog);
            } else {
              socket.emit('night chat', {userName: userProfile.userName, gameID: gameProfile.gameID, msg: $scope.msg});
              gameLog.addNightChat(userProfile.userName, $scope.msg);
              $scope.msg = '';
            }
          }
        };


      }])
})