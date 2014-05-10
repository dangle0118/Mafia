define(["angular","./controllers", "./ui"], function (angular) {
  "use strict";

  return angular.module("dashboard",["dashboard.controllers", "dashboard.ui"])
    .run(["$rootScope","$state","$stateParams", 
      function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;


      }])

})