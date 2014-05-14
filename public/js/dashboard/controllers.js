define(["angular"], function (angular) {
  "use strict";

  return angular.module("dashboard.controllers",[])
    .controller("DashboardCtrl",["$scope","socket", "gameProfile", 
      function ($scope, socket, gameProfile) {

        $scope.game = {}

        function checkValidInfo () {
          return true;
        }

        $scope.createGame = function () {
          //TODO: check validation
          if (checkValidInfo()) {
          	
            socket.emit("create game", $scope.game);
          }
        }  

        socket.forward("create game", $scope);
        $scope.$on("socket:create game", onCreateGame);
        function onCreateGame(ev, data) {        
          if (data.status === "success") {          	
          	gameProfile.init(data);
          	console.log(gameProfile);
            //TODO: add create game infor to service
            $scope.$state.go("waitingRoom");
          }
        }

    }])

    .controller("gameListCtrl",["$scope", "socket", 
      function ($scope, socket) {
        socket.emit("get list");
        socket.forward("get list", $scope);
        socket.$on("socket:get list", onGetList);
        function onGetList(ev, data) {
          


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


    }])

})