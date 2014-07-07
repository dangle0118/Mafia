define(['angular'], function (angular) {
  'use strict';

  return angular.module('dashboard.controllers.headerCtrl',[])
    .controller('HeaderCtrl',['$scope', 'userProfile',
      function ($scope, userProfile) {
        $scope.userProfile = userProfile;
      }])
})