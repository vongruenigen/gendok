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
  root.gendok.controller('templateController',
        function ($scope, $stateParams, $location, $state, $window, templateService) {
    $scope.successMessage;
    $scope.errorMessage;
    $scope.editable = false;
    $scope.payloadOptions = false;

    /*
     * Creates a new template when form is sent.
     */
    $scope.create = function () {
      $scope.resetMessages();
      $scope.concatenatePaperFormat();

      templateService.createTemplate(function success(response) {
        // rederict to the created template
        $state.go('templateViewUpdate', {templateId: response.data.id});
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        // model for status message
        $scope.errorMessage = 'An error occured while saving the template!';
      }, $scope.template);
    };

    $scope.getTemplate = function () {
      templateService.getTemplate(function success(response) {
        $scope.template = response.data;
        $scope.splitPaperFormat();
        $scope.templateOriginal = angular.copy(response.data);
      }, function error(response) {

      }, $stateParams.templateId);
    };

    $scope.getAlltemplates = function () {
      templateService.getAlltemplates(function success(response) {
        $scope.templates = response.data;
      },

      function error(response) {
        $scope.successMessage = response.status;
      });
    };

    /*
     * Updates the template with values from the form.
     */
    $scope.update = function () {
      $scope.resetMessages();
      $scope.concatenatePaperFormat();

      templateService.updateTemplate(function success(response) {
        $scope.editable = false;
        $scope.templateOriginal = angular.copy($scope.template);
        $scope.successMessage = response.status;
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        // model for status message
        $scope.errorMessage = response.status;
      }, $scope.template);
    };

    /*
     * Deletes the template with the given Id.
     */
    $scope.delete = function (templateId) {
      $scope.resetMessages();
      if ($window.confirm('Are you sure you want to delete this template?')) {
        // delete template via the api
        templateService.deleteTemplate(function success(response) {
          //reload all templates via the api
          templateService.getAlltemplates(function success(response) {
            $scope.templates = response.data;
          }, function error(response) {
            // TODO: handle error response
          });

          $scope.successMessage = response.status;
        },

        function error(response) {
          $scope.errorMessage = response.status;
        }, templateId);
      }
    };

    $scope.edit = function () {
      $scope.editable = true;
    };

    $scope.reset = function () {
      $scope.editable = false;
      $scope.payloadOptions = false;
      $scope.resetMessages();
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

    $scope.resetMessages = function () {
      $scope.errorMessage = '';
      $scope.sucessMessage = '';
    };

    /*
     * Concatenate value and unit of paper margin, header height and footer height
     * and saves them in to the corresponding ng-model attributes.
     */
    $scope.concatenatePaperFormat = function () {
      if ($scope.template.paperMarginValue !== undefined) {
        $scope.template.paperMargin = $scope.template.paperMarginValue +
            $scope.template.paperMarginUnit;
      }

      if ($scope.template.headerHeightValue !== undefined) {
        $scope.template.headerHeight = $scope.template.headerHeightValue +
            $scope.template.headerHeightUnit;
      }

      if ($scope.template.footerHeightValue !== undefined) {
        $scope.template.footerHeight = $scope.template.footerHeightValue +
            $scope.template.footerHeightUnit;
      }
    };

    /*
     * Splits the ng-model attributes paper margin, header height and footer height
     * in to value and unit for displaying them in the html form.
     */
    $scope.splitPaperFormat = function () {
      var marginUnit = $scope.template.paperMargin.slice(-2);
      var headerHeightUnit = $scope.template.headerHeight.slice(-2);
      var footerHeightUnit = $scope.template.footerHeight.slice(-2);

      $scope.template.paperMarginUnit = marginUnit;
      $scope.template.headerHeightUnit = headerHeightUnit;
      $scope.template.footerHeightUnit = footerHeightUnit;

      $scope.template.paperMarginValue =
        parseInt($scope.template.paperMargin.replace(marginUnit, ''));
      $scope.template.headerHeightValue =
        parseInt($scope.template.headerHeight.replace(headerHeightUnit, ''));
      $scope.template.footerHeightValue =
        parseInt($scope.template.footerHeight.replace(footerHeightUnit, ''));
    };

    /*
     * Sets all relevant default values/units for a new template.
     */
    $scope.setDefaultTemplate = function () {
      $scope.template = {};
      $scope.template.type = 'mustache';
      $scope.template.paperFormat = 'A4';
      $scope.template.paperMarginUnit = 'px';
      $scope.template.headerHeightUnit = 'px';
      $scope.template.footerHeightUnit = 'px';
    };
  });
})(window);
