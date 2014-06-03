define(['angular',
  './controllers/dashboardCtrl',
  './controllers/gameListCtrl',
  './controllers/waitingCtrl'
  ], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers',[
    'dashboard.controllers.dashboardCtrl',
    'dashboard.controllers.gameListCtrl',
    'dashboard.controllers.waitingCtrl'
    ])    

})