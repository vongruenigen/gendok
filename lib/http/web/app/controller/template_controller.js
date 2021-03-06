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
   * This controller handles all actions for creating, updating, deleting and
   * rendering  templates.
   */
  root.gendok.controller('templateController',
        function ($scope, $stateParams, $location, $state, $window, $element, templateService) {
    $scope.editable = false;
    $scope.payloadOptions = false;

    /*
     * Creates a new template when form is sent and switchs to the view/update
     * view of the created template.
     */
    $scope.create = function () {
      resetMessages();
      concatenatePaperFormat();

      templateService.createTemplate(function success(response) {
        // rederict to the created template
        $state.go('templateViewUpdate', {templateId: response.data.id});
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while saving the template.';
      }, $scope.template);
    };

    /*
     * Sets $scope.template to the template with the id from the url and saves
     * a copy from the template in $scope.templateOriginal.
     */
    $scope.getTemplate = function () {
      templateService.getTemplate(function success(response) {
        $scope.template = response.data;
        $scope.payload = '{}';
        splitPaperFormat();
        $scope.updateFormatPreview();
        $scope.templateOriginal = angular.copy(response.data);
      }, function error(response) {

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while showing the template.';
      }, $stateParams.templateId);
    };

    var handleErrorCodes = function (status) {
      switch (status) {
        case 401:
          $state.go('signin');
          break;
        case 404:
          $state.go('notFound');
          break;
      }
    };

    /*
     * Sets $scope.templates to the array with all templates of the current user.
     */
    $scope.getAlltemplates = function () {
      templateService.getAlltemplates(function success(response) {
        $scope.templates = response.data;
      }, function error(response) {

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while retrieving all templates.';
      });
    };

    /*
     * Updates the template with values from the form.
     */
    $scope.update = function () {
      resetMessages();
      concatenatePaperFormat();
      $scope.hightlightFormatAttribute('');

      templateService.updateTemplate(function success(response) {
        $scope.editable = false;
        $scope.templateOriginal = angular.copy($scope.template);
        $scope.successMessage = 'Template ' + response.data.name + ' successfully updated!';
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;
        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while updating the template.';
      }, $scope.template);
    };

    /*
     * Deletes the template with the given Id.
     */
    $scope.delete = function (templateId) {
      resetMessages();

      // delete template via the api
      templateService.deleteTemplate(function success(response) {
        //reload all templates via the api
        templateService.getAlltemplates(function success(response) {
          $scope.templates = response.data;
          $scope.successMessage = 'The template was successfully deleted!';
        }, function error(response) {

          handleErrorCodes(response.status);
          $scope.errorMessage = 'An error occured while retrieving all templates.';
        });
      }, function error(response) {

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while deleting the template.';
      }, templateId);

      $scope.confirmMessage = false;
    };

    /*
     * Shows the confirm message for deleting the given template
     */
    $scope.openConfirmMessage = function (template) {
      $scope.confirmTemplate = template;
      $scope.confirmMessage = true;
    };

    /*
     * Enables the html form for editing the template.
     */
    $scope.edit = function () {
      resetMessages();
      $scope.editable = true;
    };

    /*
     * Disables the current form and resets the values of the template.
     */
    $scope.reset = function () {
      $scope.editable = false;
      $scope.confirmMessage = false;
      $scope.payloadOptions = false;
      resetMessages();
      $scope.hightlightFormatAttribute('');
      $scope.template = angular.copy($scope.templateOriginal);
      $scope.updateFormatPreview();
    };

    /*
     * Enables the html form for adding the payload.
     */
    $scope.openPayloadOptions = function () {
      resetMessages();
      $scope.hightlightFormatAttribute('');
      $scope.payloadOptions = true;
    };

    /*
     * Updates the format preview on window resize.
     */
    angular.element($window).bind('resize', function () {
      if ($state.current.name === 'templateViewUpdate' ||
                $state.current.name === 'templateCreate') {
        $scope.$apply(function () {
          $scope.updateFormatPreview();
        });
      }
    });

    /*
     * Sets the css values for the paper format preview dependent on the values
     * in the template upadte form.
     */
    $scope.updateFormatPreview = function () {
      var paperFormat = $scope.template.paperFormat;
      var windowWidth = $window.innerWidth;

      var paperFormatWidth = (windowWidth < 1000 ? 200 : 300);

      $scope.template.formatPreviewWidth = paperFormatWidth + 'px';
      $scope.template.formatPreviewHeight = (Math.sqrt(2) * paperFormatWidth) + 'px';

      templateService.calculateFormatPreviewValue(paperFormat, $scope.template.paperMarginUnit,
        $scope.template.paperMarginValue, paperFormatWidth, function (value) {
        $scope.template.formatPreviewMargin = value + 'px';
      });

      templateService.calculateFormatPreviewValue(paperFormat, $scope.template.headerHeightUnit,
        $scope.template.headerHeightValue, paperFormatWidth, function (value) {
        $scope.template.formatPreviewHeaderHeight = value + 'px';
      });

      templateService.calculateFormatPreviewValue(paperFormat, $scope.template.footerHeightUnit,
        $scope.template.footerHeightValue, paperFormatWidth, function (value) {
        $scope.template.formatPreviewFooterHeight = value + 'px';
      });
    };

    /*
     * Sets the color of the current paper format attribute in the paper format
     * preview to turquoise.
     */
    $scope.hightlightFormatAttribute = function (formatAttribute) {
      resetHighlightFormatAttribute();

      switch (formatAttribute) {
        case 'paperMargin':
          $scope.template.formatPreviewPaperMarginColor = 'rgba(108, 221, 171, 0.68)';
          break;
        case 'headerHeight':
          $scope.template.formatPreviewHeaderHeightColor = 'rgba(108, 221, 171, 0.68)';
          break;
        case 'footerHeight':
          $scope.template.formatPreviewFooterHeightColor = 'rgba(108, 221, 171, 0.68)';
          break;
        case 'paperFormat':
          $scope.template.formatPreviewPaperFormatColor = 'rgba(108, 221, 171, 0.68)';
          break;
      }
    };

    /*
     * Sets the color of all paper format attributes in the paper format
     * preview to the default values.
     */
    var resetHighlightFormatAttribute = function () {
      $scope.template.formatPreviewPaperMarginColor = 'white';
      $scope.template.formatPreviewHeaderHeightColor = 'white';
      $scope.template.formatPreviewFooterHeightColor = 'white';
      $scope.template.formatPreviewPaperFormatColor = 'rgba(255, 255, 255, 0.68)';
    };

    /*
     * Renders the given template with the given payload and opens the rendered pdf
     * in a new browser tab.
     */
    $scope.render = function (template, payload) {
      resetMessages();
      var jsonIsValid = true;

      try {
        JSON.parse(payload);
      } catch (err) {
        jsonIsValid = false;
        $scope.errorMessage = 'The payload isn\'t valid JSON.';
      }

      if (jsonIsValid) {
        var payloadObject = {
          payload: JSON.parse(payload),
          format: 'pdf',
          async: false
        };

        templateService.renderTemplate(function success(response) {
          var file = new Blob([response.data], {type: 'application/pdf'});
          var fileURL = URL.createObjectURL(file);
          $window.open(fileURL);
        },

        function error(response) {
          $scope.errorMessage = 'An error occured while rendering the template.';
        }, template.id, payloadObject);
      }
    };

    var resetMessages = function () {
      $scope.errorMessage = null;
      $scope.successMessage = null;
      $scope.validationErrors = null;
    };

    /*
     * Concatenate value and unit of paper margin, header height and footer height
     * and saves them in to the corresponding ng-model attributes.
     */
    var concatenatePaperFormat = function () {
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
    var splitPaperFormat = function () {

      if ($scope.template.paperMargin !== null) {
        var marginUnit = $scope.template.paperMargin.slice(-2);
        $scope.template.paperMarginUnit = marginUnit;
        $scope.template.paperMarginValue =
          parseInt($scope.template.paperMargin.replace(marginUnit, ''));
      }

      if ($scope.template.headerHeight !== null) {
        var headerHeightUnit = $scope.template.headerHeight.slice(-2);
        $scope.template.headerHeightUnit = headerHeightUnit;
        $scope.template.headerHeightValue =
          parseInt($scope.template.headerHeight.replace(headerHeightUnit, ''));
      }

      if ($scope.template.footerHeight !== null) {
        var footerHeightUnit = $scope.template.footerHeight.slice(-2);
        $scope.template.footerHeightUnit = footerHeightUnit;
        $scope.template.footerHeightValue =
          parseInt($scope.template.footerHeight.replace(footerHeightUnit, ''));
      }
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
      $scope.template.paperMarginValue = 0;
      $scope.template.headerHeightValue = 0;
      $scope.template.footerHeightValue = 0;
      $scope.updateFormatPreview();
    };
  });
})(window);
