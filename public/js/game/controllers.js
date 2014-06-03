define(['angular',
  './controllers/gameBoardCtrl',
  './controllers/villageCtrl',
  './controllers/mafiaCtrl',
  './controllers/doctorCtrl',
  './controllers/policeCtrl',
  './controllers/hookerCtrl',

  ], function (angular) {
  'use strict';

  return angular.module('game.controllers',[
    'game.controllers.gameboardCtrl',
    'game.controllers.villageCtrl',
    'game.controllers.mafiaCtrl',
    'game.controllers.doctorCtrl',
    'game.controllers.policeCtrl',
    'game.controllers.hookerCtrl'
    ]) 
})
