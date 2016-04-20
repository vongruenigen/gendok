/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

;(function (root) {
  'use strict';

  /**
   * This controller handles all actions with templates
   */
  root.gendok.controller('templatesController', function ($scope, templateService, $window) {
    $scope.success_message;
    $scope.error_message;

    templateService.getAlltemplates( function (array) {
      $scope.templates = array;
    });

    $scope.delete = function (templateId) {
      if ($window.confirm('Are you sure you want to delete this template?')) {
        templateService.deleteTemplate( function success(response) {
          templateService.getAlltemplates( function (array) {
            $scope.templates = array;
          });
          $scope.success_message = response.status;
          $scope.error_message = "";
        }, function error(response) {
          $scope.error_message = response.status;
          $scope.success_message = "";
        }, templateId);
      }
    };
  });
})(window);
