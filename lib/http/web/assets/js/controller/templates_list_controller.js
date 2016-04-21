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
   * This controller handles all actions with the template list
   */
  root.gendok.controller('templatesListController', function ($scope, templateService, $window) {
    $scope.success_message;
    $scope.error_message;

    templateService.getAlltemplates( function success(response) {
      $scope.templates = response.data;
    }, function error(response) {
      $scope.success_message = response.status;
    });

    /*
     * Deletes the template with the given Id.
     */
    $scope.delete = function (templateId) {
      if ($window.confirm('Are you sure you want to delete this template?')) {
        // delete template via the api
        templateService.deleteTemplate( function success(response) {
          //reload all templates via the api
          templateService.getAlltemplates( function success(response) {
            $scope.templates = response.data;
          }, function error(response) {
            // TODO: handle error response
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
