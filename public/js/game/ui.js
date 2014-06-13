define(['text!html/game/mafia.html',
  'text!html/game/village.html',
  'text!html/game/police.html',
  'text!html/game/doctor.html',
  'text!html/game/gameboard.html',
  'text!html/game/ghost.html',
  'text!html/game/end.html',
  'angular','ui-router'], function (mafiaTpl, villageTpl, policeTpl, doctorTpl, gameBoardTpl,ghostTpl, endGameTpl, angular) {
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
                template: villageTpl
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
          .state('game.police', {
            url: '/police',
            views: {
              'CharacterAction': {
                template: policeTpl,
                controller: "PoliceCtrl"
              }
            }
          })
          .state('game.doctor', {
            url: '/doctor',
            views: {
              'CharacterAction': {
                template: doctorTpl,
                controller: "DoctorCtrl"
              }
            }
          })

          .state('game.dead', {
            url: '/dead',
            views: {
              'CharacterAction': {
                  template: ghostTpl
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