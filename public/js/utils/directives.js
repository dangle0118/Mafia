define(["angular"], function (angular) {
  "use strict";

  return angular.module("utils.directives", [])
    .directive('autofocus', function () {
      return function (scope, element) {
        element[0].focus();
      };
    })
    .directive('autoscrollbottom', function () {
      return function (scope, element) {
        scope.$watch(function () {
          return element[0].value;
        }, function () {
          element[0].scrollTop = element[0].scrollHeight;
        });
      };
    })
    .directive('card', function () {
      var tpl="";
      tpl += "<img class=\"{{class}}\" ";
      tpl += "     src=\"http:\/\/localhost:5000\/image\/{{card.id}}.jpg\"";
      tpl += "     popover=\"{{card.description}}\" popover-trigger=\"mouseenter\" popover-placement=\"right\" popover-append-to-body=\"true\" popover-title=\"{{name}}\">";

      return {
        restrict: "E",
        template: tpl,
        scope: {
          card: '=value'
        },
        link: function (scope, elms, attrs) {
          if (!scope.card)
            scope.card = {id: 'c0'};
          if (scope.card.alt && false) scope.name = scope.card.alt;
          else scope.name = scope.card.name;
          scope.class = attrs.class;
        }
      }
    });
});