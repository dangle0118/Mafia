define([
  'text!html/dashboard/header.html',
  'text!html/utils/chatroom.html',
  'text!html/game/mafia.html',
  'text!html/game/village.html',
  'text!html/game/police.html',
  'text!html/game/doctor.html',
  'text!html/game/gameboard.html',
  'text!html/game/ghost.html',
  'text!html/game/end.html',
  'text!html/game/gamelog.html',
  'angular','ui-router'], function (headerTpl, chatRoomTpl, mafiaTpl, villageTpl, policeTpl, doctorTpl, gameBoardTpl,ghostTpl, endGameTpl, gameLogTpl, angular) {
  'use strict';

  return angular.module('game.ui', ['ui.router'])
    .config(['$stateProvider', '$urlRouterProvider', 
      function ($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state('game', {
            abstract: true,
            views: {
              'root1': {
                template: headerTpl,
                controller: 'HeaderCtrl'
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

          .state('game.day', {
            url: '/day',
            views: {

              'root2@': {
                template: gameBoardTpl,
                controller: "GameBoardCtrl"
              }
                          
            }
          })

          .state('game.village', {
            url: '/village',
            parent: 'game.day',
            views: {
              'CharacterAction': {
                template: villageTpl
              }
            }
          })
          .state('game.mafia', {
            url: '/mafia',
            parent: 'game.day',
            views: {
              'CharacterAction': {
                template: mafiaTpl,
                controller: "MafiaCtrl"
              }
            }
          })
          .state('game.police', {
            url: '/police',
            parent: 'game.day',
            views: {
              'CharacterAction': {
                template: policeTpl,
                controller: "PoliceCtrl"
              }
            }
          })
          .state('game.doctor', {
            url: '/doctor',
            parent: 'game.day',
            views: {
              'CharacterAction': {
                template: doctorTpl,
                controller: "DoctorCtrl"
              }
            }
          })

          .state('dead', {
            url: '/dead',
            views: {
              'root2': {
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