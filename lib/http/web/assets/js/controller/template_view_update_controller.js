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
  root.gendok.controller('templateViewUpdateController', function ($scope, $stateParams, $window, templateService) {
    $scope.error_message;
    $scope.success_message;

    templateService.getTemplate( function success(response) {
      $scope.template = response.data;
      $scope.template_original = angular.copy(response.data);
    }, function error(response) {

    },$stateParams.templateId);

    /*
     * Updates the template with values from the form.
     */
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

    $scope.render = function(template) {
      var payload = {
        "payload":{
          "customer_name": "Aurelio Malacarne",
          "customer_street": "Schiltwiesenweg 7",
          "customer_location": "8404 Winterthur",
          "customer_organisation": "GPA Switzerland GmbH",
          "components": [
            {
              "component_name": "Design-Mockup",
              "component_duration": "2",
              "component_price": "140"
            },
            {
              "component_name": "Implementation",
              "component_duration": "3",
              "component_price": "500"
            }
          ],
          "invoice_number": "17604.01.01",
          "invoice_date": "14.04.2016",
          "invoice_amount": "3333"
        },
        "format": "pdf",
        "async": false
      }
      templateService.renderTemplate( function success(response) {
        var file = new Blob([response.data], {type: 'application/pdf'});
        var fileURL = URL.createObjectURL(file);
        $window.open(fileURL);
      }, function error(response) {
        console.log(response);
      }, template.id, payload);
    }
  });
})(window);
