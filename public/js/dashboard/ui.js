define(["text!html/dashboard/gamelist.html",
  "text!html/dashboard/waitingroom.html",
  "text!html/dashboard/dashboard.html",
  "text!html/dashboard/header.html",
  "angular","ui-router"], function (gameListTpl, waitingRoomTpl, dashboardTpl, headerTpl, angular) {
  "use strict";

  return angular.module("dashboard.ui", ["ui.router"])
    .config(["$stateProvider", "$urlRouterProvider", 
      function ($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state("dashboard", {
            url: "/dashboard",
            views: {
              "root1": {
                template: headerTpl                                
              },
              "root2": {
                template: dashboardTpl,
                controller: "DashboardCtrl"
              },
              "root3": {
                template: gameListTpl,
                controller: "gameListCtrl"
              }            
            }
          })
          .state("waitingRoom", {
            url: "/waitingroom",
            views: {
              "root2": {
                template: waitingRoomTpl

              }

            }
          })

      }])

})