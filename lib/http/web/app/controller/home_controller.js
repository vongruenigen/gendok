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
   * This controller handles all actions done on the home page.
   */
  root.gendok.controller('homeController', function ($scope, $state, authService) {
    /**
     * This logs out the user and redirects it to the home page.
     */
    $scope.logoutUser = function () {
      if (authService.getUser()) {
        authService.signout(function (res) {
          $state.go('home');
        });
      }
    };
  });
})(window);
