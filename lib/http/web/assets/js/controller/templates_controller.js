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
  root.gendok.controller('templatesController', function ($scope, templateService) {
    $scope.templates = templateService.getAlltemplates;

  /*  $http.get('/api/templates').success(function (res) {
      $scope.templates = res;
      fn(true);
    }).error(function (err) {
      fn(false);
    });*/
  });
})(window);
