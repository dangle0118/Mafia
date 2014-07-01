define(['angular',
  './controllers/gameBoardCtrl',
  './controllers/villageCtrl',
  './controllers/mafiaCtrl',
  './controllers/doctorCtrl',
  './controllers/policeCtrl',
  './controllers/hookerCtrl',
  './controllers/gameLogCtrl',
  './controllers/chatRoomCtrl'

  ], function (angular) {
  'use strict';

  return angular.module('game.controllers',[
    'game.controllers.gameboardCtrl',
    'game.controllers.villageCtrl',
    'game.controllers.mafiaCtrl',
    'game.controllers.doctorCtrl',
    'game.controllers.policeCtrl',
    'game.controllers.hookerCtrl',
    'game.controllers.gameLogCtrl',
    'game.controllers.chatRoomCtrl'
    ]) 
})
