define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.waitingCtrl',[])
    .controller('WaitingCtrl',['$scope','socket','gameProfile','userProfile', 'gameProcess', 'gameLog',
      function ($scope, socket, gameProfile, userProfile, gameProcess, gameLog) {
        $scope.currentPlayers = gameProfile.currentPlayers;
        $scope.NumberReady = 0;
        $scope.isReady = 0;
        $scope.isCreator = gameProfile.isCreator;
        $scope.readyList = {};

        function isContain(key, arr) {
          for (var i = 0; i < arr.length; ++i) {           
            if (arr[i] === key) {        
              return true;
            }
          }
          return false;
        }

        socket.forward('player join', $scope);
        $scope.$on('socket:player join', onPlayerJoin);
        function onPlayerJoin(ev, data) {                          
          if (!isContain(data.userName, $scope.currentPlayers)){
            gameProfile.joinPlayer(data.userName);
            gameLog.addLog('join', data.userName);
          }   
        }

        socket.forward('player leave', $scope);
        $scope.$on('socket:player leave', onPlayerLeave);
        function onPlayerLeave(ev, data) {
          gameProfile.removePlayer(data.userName);
          delete $scope.readyList[data.userName];
          gameLog.addLog('leave', data.userName);
        }

        socket.forward('player confirm',$scope);
        $scope.$on('socket:player confirm', onPlayerConfirm);
        function onPlayerConfirm(ev, data) {       
          $scope.NumberReady = $scope.NumberReady + 1;
          $scope.readyList[data.userName] = true;
          gameLog.addLog('confirm', data.userName);
        }

        socket.forward('player cancel',$scope);
        $scope.$on('socket:player cancel', onPlayerCancel);
        function onPlayerCancel(ev, data) {      
          $scope.NumberReady = $scope.NumberReady - 1;
          $scope.readyList[data.userName]= false;
          gameLog.addLog('cancel', data.userName);
        }

        socket.forward('start game', $scope);
        $scope.$on('socket:start game', onStartGame);
        function onStartGame(ev, data) {
          if (data.status === 'success') {
            userProfile.userCharacter = data.character;
            gameProcess.init(gameProfile.gameCap, gameProfile.getCurrentPlayers(), gameProfile.mafiaAmount);
            gameLog.refreshLog();
            $scope.$state.go('game.day');
          } else {
            console.log('cannot start game');
          }          
        }

        $scope.ready = function () {
          if ($scope.isReady == 1) {
            $scope.isReady = 0;
            $scope.NumberReady = $scope.NumberReady - 1;
            socket.emit('player cancel', {userName: userProfile.userName, gameID: gameProfile.gameID});
            gameLog.addLog('cancel', userProfile.userName)
            $scope.readyList[userProfile.userName]= false;

          } else {
            $scope.isReady = 1;
            $scope.NumberReady = $scope.NumberReady + 1;
            socket.emit('player confirm', {userName: userProfile.userName, gameID: gameProfile.gameID});
            gameLog.addLog('confirm', userProfile.userName);
            $scope.readyList[userProfile.userName]= true;
          }
        };
        $scope.start = function () {
          if (gameProfile.isCreator && ($scope.NumberReady == gameProfile.gameCap)) {
            socket.emit('start game', {gameID: gameProfile.gameID});             
          }
        };
    }])
})