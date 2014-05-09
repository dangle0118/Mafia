define(["text!html/login.html", "angular", "ui-router"], function (loginHtml, angular) {
  "use strict";

  return angular.module("login", ["ui.router"])
    .config(["$stateProvider", "$urlRouterProvider",
      function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");
        $stateProvider
          .state("login", {
            url: "/login",
            views: {
              "root1": {
                template: loginHtml,
                controller: "LoginCtrl"
              }
            }
          })
      }])

    .run(["$rootScope", "$state", "$stateParams", "socket",
      function ($rootScope, $state, $stateParams, socket) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;       
    }])

    .controller("LoginCtrl", ["$scope", "socket",
      function($scope, socket) {
        $scope.username = "";
 
        socket.forward("new player", $scope);
        $scope.$on("socket:new player", onNewPlayer);
        function onNewPlayer (ev, data) {
          if (data.status === "success") {
            //TODO: save user name
            //$scope.$state.go("dashboard");           
            console.log(data);
            $scope.$state.go("dashboard");
          } else {
            $scope.username = "";
          }
        }

        $scope.createPlayer = function () {
          socket.emit("new player",{username: $scope.username});
          console.log('we here')
        };
      }]);
});