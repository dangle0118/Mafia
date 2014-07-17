define(['text!html/login.html', 'angular', 'ui-router'], function (loginHtml, angular) {
  'use strict';

  return angular.module('login', ['ui.router'])
    .config(['$stateProvider', '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
          .state('login', {
            url: '/login',
            views: {
              'root1': {
                template: loginHtml,
                controller: 'LoginCtrl'
              }
            }
          })
      }])

    .run(['$rootScope', '$state', '$stateParams',  '$location', 'userProfile',
      function ($rootScope, $state, $stateParams, $location, userProfile) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        
        $rootScope.$on('$stateChangeStart', function (event, next, current) {
          console.log('route')
          if (!userProfile.isLogged) {
            $location.path('/login');
          };
        });
        
    }])

    .controller('LoginCtrl', ['$scope', 'socket', 'userProfile',
      function($scope, socket, userProfile) {
        $scope.userName = '';
 
        socket.forward('new player', $scope);
        $scope.$on('socket:new player', onNewPlayer);
        function onNewPlayer (ev, data) {
          if (data.status === 'success') {         
            userProfile.userName = data.userName;
            userProfile.userID = data.id;
            userProfile.isLogged = true;
            $scope.$state.go('dashboard');
          } else {
            $scope.userName = '';
          }
        }

        $scope.createPlayer = function () {
          socket.emit('new player',{userName: $scope.userName});
          
        };
      }]);
});