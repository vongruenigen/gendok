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
  root.gendok.controller('templateViewUpdateController', function ($scope, $stateParams, templateService) {
    $scope.error_message;
    $scope.success_message;

    templateService.getTemplate( function success(response) {
      $scope.template = response.data;
      $scope.template_original = angular.copy(response.data);
    }, function error(response) {

    },$stateParams.templateId);

    $scope.update = function(template) {
      templateService.updateTemplate( function success(response) {
        $scope.editable = false;
        $scope.template_original = angular.copy(template);
        $scope.success_message = response.status;
      }, function error(response) {
        $scope.error_message = response.status;
      }, template);
    };

    $scope.edit = function() {
      $scope.editable = true;
    }

    $scope.reset = function() {
      $scope.editable = false;
      $scope.template = angular.copy($scope.template_original);
    }
  });
})(window);
