define(['text!html/game/gameboard.html'
  'angular','ui-router'], function (gameBoardTpl, angular) {
  'use strict';

  return angular.module('game.ui', ['ui.router'])
    .config(['$stateProvider', '$urlRouterProvider', 
      function ($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state('game', {
            url: '/game',
            views: {
              'root1': {                                
              },
              'root2': {
                template: gameBoardTpl
              }
                          
            }
          })
          

      }])

})