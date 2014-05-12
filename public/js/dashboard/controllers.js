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
})