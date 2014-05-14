define(["angular"], function (angular) {
  "use strict";

  return angular.module("dashboard.controllers",[])
    .controller("DashboardCtrl",["$scope","socket", "gameProfile","userProfile", 
      function ($scope, socket, gameProfile, userProfile) {

        $scope.game = {}

        function checkValidInfo () {
          return true;
        }

        $scope.createGame = function () {
          //TODO: check validation
          if (checkValidInfo()) {
            $scope.game.userName = userProfile.userName;
            socket.emit("create game", $scope.game);
          }
        }  

        socket.forward("create game", $scope);
        $scope.$on("socket:create game", onCreateGame);
        function onCreateGame(ev, data) {        
          if (data.status === "success") {          	
          	gameProfile.init(data);          	
            //TODO: add create game infor to service
            $scope.$state.go("waitingRoom");
          }
        }

    }])

    .controller("gameListCtrl",["$scope", "socket", 
      function ($scope, socket) {
        $scope.room = {};
        
        socket.emit("get list");
        socket.forward("get list", $scope);
        $scope.$on("socket:get list", onGetList);
        function onGetList(ev, data) {
          $scope.roomList = data.data;

        }


        socket.forward("add game", $scope);
        $scope.$on("socket:add game", onAddGame);
        function onAddGame(ev, data) {
          console.log('add');
        }

        socket.forward("remove game", $scope);
        $scope.$on("socket:remove game", onAddGame);
        function onAddGame(ev, data) {
          console.log('remove');
        }

        $scope.joinGame = function () {
          console.log($scope.gameChoose);
        }


    }])

})