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
   * This controller handles all actions for creating templates
   */
  root.gendok.controller('templateCreateController', function ($scope, $location, templateService) {
    $scope.errorMessage;

    /*
     * Creates a new template when form is sent.
     */
    $scope.create = function (template) {
      templateService.createTemplate(function success(response) {
        // rederict to the created template
        $location.path('templates/' + response.data.id);
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        // model for status message
        $scope.errorMessage = response.status;
      }, template);
    };
  });
})(window);
