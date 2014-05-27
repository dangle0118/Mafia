define(['text!html/game/mafia.html',
  'text!html/game/village.html',
  'text!html/game/gameboard.html',
  'angular','ui-router'], function (mafiaTpl, villageTpl, gameBoardTpl, angular) {
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
                templatte: villageTpl,
                controller: "VillageCtrl"
              }
            }
          })
          .state('game.mafia', {
            url: '/mafia', 
            views: {
              'CharacterAction': {
                templatte: mafiaTpl,
                controller: "MafiaCtrl"
              }
            }
          })

          

      }])

})