define(['angular'], function (angular) {
  'use strict';

  return angular.module('game.controllers',[])
    .controller('GameBoardCtrl',['$scope','socket', 'gameProfile','userProfile', 
      function ($scope, socket, gameProfile, userProfile) {

        $scope.character = userProfile.userCharacter;
        $scope.day = 1;
        $scope.isNight = false;
        $scope.choosePlayer = '';
        $scope.playerList = gameProfile.getCurrentPlayers();
        $scope.voteList = {};
        $scope.voteAmount = 0;
        $scope.sleepAmount = 0;
        $scope.isVoted = false;
        $scope.isSleep = false;

        
        function killPlayer(player) {
          //TODO: incomplete
          gameProfile.gameCap -=1 ;
          $scope.voteAmount = 0;  

          for (var temp in $scope.playerList) {
            $scope.playerList[temp] = 0;
          }
          $scope.playerList[player] = -1;
        }
      

        socket.forward('wake up', $scope);
        $scope.$on('socket:wake up', onWakeUp);
        function onWakeUp(ev, data) {
          $scope.$state.go('game');          
        }

        socket.forward('vote player', $scope);
        $scope.$on('socket:vote player', onVotePlayer);
        function onVotePlayer(ev, data) {
          if ($scope.voteList.hasOwnProperty(data.votePlayer)) {
            $scope.voteList[data.votePlayer] += 1;
          } else {
            $scope.voteList[data.votePlayer] = 1;            
          }
          $scope.voteAmount += 1;    
        }

        socket.forward('kill player', $scope);
        $scope.$on('socket:kill player', onPlayerKilled);
        function onPlayerKilled(ev, data) {
          //TODO: implemend
        }

        socket.forward('sleep', $scope);
        $scope.$on('socket:sleep', onSleep);
        function onSleep(ev, data) {
          //TODO: implemend
          $scope.sleepAmount += 1;
          if ($scope.sleepAmount == gameProfile.gameCap) {
            $scope.$state.go('game.'+gameProfile.userCharacter);
            
          }
        }

        $scope.votePlayer = function () {
          if ($scope.choosePlayer !== '') {
            socket.emit('vote player', {votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };
          $scope.isVoted = true;
        }

        $scope.goSleep = function () {
          socket.emit('sleep', {userName: userProfile.userName});
          $scope.isSleep = true;          
        }   
    }])
    
    .controller('VillageCtrl', ['$scope','socket', 'gameprofile',
      function ($scope, socket, gameProfile) {      

    }])

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

    .controller('DoctorCtrl', ['$scope', 'socket', 'gameProfile',
      function ($scope, socket, gameProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('save village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };      
    }])
    
    .controller('PoliceCtrl', ['$scope', 'socket', 'gameProfile',
      function ($scope, socket, gameProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('inspect village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };      
    }])

    .controller('HookerCtrl', ['$scope', 'socket', 'gameProfile',
      function ($scope, socket, gameProfile) {
        if ($scope.choosePlayer !== '') {
            socket.emit('hook village', {role: gameProfile.userCharacter, votePlayer: $scope.choosePlayer, gameID: gameProfile.gameID, userID: userProfile.userID, userName: userProfile.userName});
          };      
    }])
    




})