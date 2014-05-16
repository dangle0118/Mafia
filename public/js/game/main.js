define(["angular","./controllers", "./ui"], function (angular) {
  "use strict";

  return angular.module("game",["game.controllers", "game.ui"])
    .run(["$rootScope","$state","$stateParams", 
      function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        
      }])

})