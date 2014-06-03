define(['text!html/game/mafia.html',
  'text!html/game/village.html',
  'text!html/game/gameboard.html',
  'text!html/game/end.html',  
  'angular','ui-router'], function (mafiaTpl, villageTpl, gameBoardTpl, endGameTpl, angular) {
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
                template: gameBoardTpl,
                controller: "GameBoardCtrl"
              }
                          
            }
          })
          .state('game.day', {
            url: '/day',
            views: {

            }

          })

          .state('game.village', {
            url: '/village', 
            views: {
              'CharacterAction': {
                template: villageTpl,
                controller: "VillageCtrl"
              }
            }
          })
          .state('game.mafia', {
            url: '/mafia', 
            views: {
              'CharacterAction': {
                template: mafiaTpl,
                controller: "MafiaCtrl"
              }
            }
          })

          .state('end', {
            url: '/end', 
            views: {
              'root2': {
                template: endGameTpl
              }
            }
          })

          

      }])

})