define(["text!html/dashboard/dashboard.html",
  "angular","ui-router"], function (dashboardTpl, angular) {
  "use strict";

  return angular.module("dashboard.ui", ["ui.router"])
    .config(["$stateProvider", "$urlRouterProvider", 
      function ($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state("dashboard", {
            url: "/dashboard",
            views: {
              "root1": {
                template: dashboardTpl
                
              }
            }

          })

      }])

})