define(['angular',
  './controllers/dashboardCtrl',
  './controllers/gameListCtrl',
  './controllers/waitingCtrl',
  './controllers/headerCtrl'
  ], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers',[
    'dashboard.controllers.dashboardCtrl',
    'dashboard.controllers.gameListCtrl',
    'dashboard.controllers.waitingCtrl',
    'dashboard.controllers.headerCtrl'
    ])    

})