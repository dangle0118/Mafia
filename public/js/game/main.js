define(['angular','./controllers', './ui'], function (angular) {
  'use strict';

  return angular.module('game',['game.controllers', 'game.ui'])
    .run(['$rootScope','$state','$stateParams', 'socket', 'gameProfile','gameLog',
      function ($rootScope, $state, $stateParams, socket, gameProfile, gameLog) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        socket.forward('player leave', $rootScope);
        $rootScope.$on('socket:player leave', onPlayerLeave);
        function onPlayerLeave(ev, data) {
          gameProfile.removePlayer(data.userName);
          gameLog.addLog('leave', data.userName);
          $rootScope.$state.go('game.waitingPlayer');
        }

        socket.forward('player reconnect', $rootScope);
        $rootScope.$on('socket:player reconnect', onPlayerReconnect);
        function onPlayerReconnect(ev, data) {
          gameProfile.joinPlayer(data.userName);
          gameLog.addLog('reconnect', data.userName);
          if (gameProfile.currentPlayers.length == gameProfile.gameCap) {
            $rootScope.$state.go('game.day');
          }
        }

        socket.forward('end game', $rootScope);
        $rootScope.$on('socket:end game', onEndGame);
        function onEndGame(ev, data) {
          console.log(data.status);
          $rootScope.$state.go('end');
        }


      }])

})