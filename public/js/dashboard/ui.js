define([
  'text!html/utils/chatroom.html',
  'text!html/dashboard/gamelist.html',
  'text!html/dashboard/waitingroom.html',
  'text!html/dashboard/dashboard.html',
  'text!html/dashboard/header.html',
  'text!html/game/gamelog.html',
  'angular','ui-router'], function (chatRoomTpl, gameListTpl, waitingRoomTpl, dashboardTpl, headerTpl, gameLogTpl, angular) {
  'use strict';

  return angular.module('dashboard.ui', ['ui.router'])
    .config(['$stateProvider', '$urlRouterProvider', 
      function ($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state('dashboard', {
            url: '/dashboard',
            views: {
              'root1': {
                template: headerTpl,
                controller: 'HeaderCtrl'
              },
              'root2': {
                template: dashboardTpl,
                controller: 'DashboardCtrl'
              },
              'root3': {
                template: gameListTpl,
                controller: 'GameListCtrl'
              }            
            }
          })
          .state('waitingRoom', {
            url: '/waitingroom',
            views: {
              'root2': {
                template: waitingRoomTpl,
                controller: 'WaitingCtrl'
              },
              'root3': {
                template: gameLogTpl,
                controller: "GameLogCtrl"
              },
              'root4@': {
                template: chatRoomTpl,
                controller: "ChatRoomCtrl"
              }

            }
          })

      }])

});