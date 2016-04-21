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
   * This controller handles all actions for editing and viewing templates
   */
  root.gendok.controller('templateViewUpdateController',
      function ($scope, $stateParams, $window, templateService) {
    $scope.editable = false;
    $scope.payloadOptions = false;

    templateService.getTemplate(function success(response) {
      console.log(response.data);
      $scope.template = response.data;
      $scope.templateOriginal = angular.copy(response.data);
    }, function error(response) {

    }, $stateParams.templateId);

    /*
     * Updates the template with values from the form.
     */
    $scope.update = function (template) {
      templateService.updateTemplate(function success(response) {
        $scope.editable = false;
        $scope.templateOriginal = angular.copy(template);
        $scope.successMessage = response.status;
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        // model for status message
        $scope.errorMessage = response.status;
        $scope.successMessage = '';
      }, template);
    };

    $scope.edit = function () {
      $scope.editable = true;
    };

    $scope.reset = function () {
      $scope.editable = false;
      $scope.payloadOptions = false;
      $scope.successMessage = '';
      $scope.errorMessage = '';
      $scope.template = angular.copy($scope.templateOriginal);
    };

    $scope.openPayloadOptions = function () {
      $scope.payloadOptions = true;
    };

    $scope.render = function (template, payload) {
      templateService.renderTemplate(function success(response) {
        var file = new Blob([response.data], {type: 'application/pdf'});
        var fileURL = URL.createObjectURL(file);
        $window.open(fileURL);
      },

      function error(response) {
        $scope.errorMessage = response.status;
      }, template.id, payload);
    };
  });
})(window);
