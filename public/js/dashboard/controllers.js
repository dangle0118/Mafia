define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers',[])
    .controller('DashboardCtrl',['$scope','socket', 'gameProfile','userProfile', 
      function ($scope, socket, gameProfile, userProfile) {

        $scope.game = {}

        function checkValidInfo () {
          return true;
        }

        $scope.createGame = function () {
          //TODO: check validation
          if (checkValidInfo()) {
            $scope.game.userName = userProfile.userName;
            socket.emit('create game', $scope.game);
          }
        }  

        socket.forward('create game', $scope);
        $scope.$on('socket:create game', onCreateGame);
        function onCreateGame(ev, data) {        
          if (data.status === 'success') {          	
          	gameProfile.init(data);          	            
            $scope.$state.go('waitingRoom');
          }
        }
    }])

    .controller('GameListCtrl',['$scope', 'socket', 'gameProfile', 'userProfile',
      function ($scope, socket, gameProfile, userProfile) {
        $scope.room = {};
        
        socket.emit('get list');
        socket.forward('get list', $scope);
        $scope.$on('socket:get list', onGetList);
        function onGetList(ev, data) {
          $scope.roomList = data.data;
        }

        socket.forward('add game', $scope);
        $scope.$on('socket:add game', onAddGame);
        function onAddGame(ev, data) {
          //TODO: add content
          console.log('add');
        }

        socket.forward('remove game', $scope);
        $scope.$on('socket:remove game', onAddGame);
        function onAddGame(ev, data) {
          //TODO: add content
          console.log('remove');
        }

        $scope.joinGame = function () {
          socket.emit('join game', {userName: userProfile.userName, 
                                    userID: userProfile.userID,
                                    gameID: $scope.gameChoose});          
        }

        socket.forward('join game', $scope);
        $scope.$on('socket:join game', onJoinGame);
        function onJoinGame(ev, data) {
          if (data.status === 'success'){
            console.log(data);
            
            gameProfile.init(data.data);
            $scope.$state.go('waitingRoom');            
          } else {
            console.log("cannot join game");
          };
        }    
    }])
    
    .controller('WaitingCtrl',['$scope','socket','gameProfile','userProfile',
      function ($scope, socket, gameProfile, userProfile) {        
        $scope.currentPlayers = gameProfile.currentPlayers;
        $scope.NumberReady = 1;
        $scope.isReady = 0;
        $scope.isCreator = gameProfile.isCreator;
        
        function isContain(key, arr) {
          for (var i = 0; i < arr.length; ++i) {           
            if (arr[i] === key) {
              console.log('here');
              return true;
            }
          }
          return false;
        }

        socket.forward('player join', $scope);
        $scope.$on('socket:player join', onPlayerJoin);
        function onPlayerJoin(ev, data) {
          console.log($scope.currentPlayers);                    
          if (!isContain(data.userName, $scope.currentPlayers)){
            gameProfile.joinPlayer(data.userName);
          }   
        }

        socket.forward('player leave', $scope);
        $scope.$on('socket:player leave', onPlayerLeave);
        function onPlayerLeave(ev, data) {
          //TODO: implemend removePlayer
          gameProfile.removePlayer(data.userName);
        }

        socket.forward('player confirm',$scope);
        $scope.$on('socket:player confirm', onPlayerConfirm);
        function onPlayerConfirm(ev, data) {
          //TODO: implemend
          $scope.NumberReady = $scope.NumberReady + 1;
          console.log(data.userName);
        }

        socket.forward('player cancel',$scope);
        $scope.$on('socket:player cancel', onPlayerCancel);
        function onPlayerCancel(ev, data) {
          //TODO: implemend
          $scope.NumberReady = $scope.NumberReady - 1;
          console.log(data.userName);
        }

        socket.forward('start game', $scope);
        $scope.$on('socket:start game', onStartGame);
        function onStartGame(ev, data) {
          //TODO: implemend
          if (data.status === 'success') {
            userProfile.userCharacter = data.character;
            $scope.$state.go('game');

          } else {
            console.log('cannot start game');
          }
          
        }



        $scope.ready = function () {
          if ($scope.isReady == 1) {
            $scope.isReady = 0;
            $scope.NumberReady = $scope.NumberReady - 1;
            socket.emit('player cancel', {userName: userProfile.userName, gameID: gameProfile.gameID});
          } else {
            $scope.isReady = 1;
            $scope.NumberReady = $scope.NumberReady + 1;
            socket.emit('player confirm', {userName: userProfile.userName, gameID: gameProfile.gameID});         
          }
        }

        $scope.start = function () {
          if (gameProfile.isCreator && ($scope.NumberReady == gameProfile.gameCap)) {
            socket.emit('start game', {gameID: gameProfile.gameID});             
          }
        }

    }])

})