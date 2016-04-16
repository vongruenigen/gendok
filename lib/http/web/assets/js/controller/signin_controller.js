/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

;(function () {
  'use strict';

  /**
   * This controller handles all actions done on the signin page.
   */
  gendok.controller('signinController', function ($scope, $state, authService) {
    /**
     * Action for handling the submit on the signin form.
     */
    $scope.signin = function (user) {
      $scope.loading = true;

      // Sign out user before sign it again
      authService.signout(function () {
        authService.signin($scope.username, $scope.password, function (res) {
          if (res) {
            $state.go('home');
          } else {
            $scope.error = 'invalid username and/or password';
          }

          $scope.loading = false;
        });
      });
    };
  });
})();
