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
   * This controller handles all actions done on the signin page.
   */
  root.gendok.controller('signinController', function ($scope, $state, authService) {
    /**
     * Action for handling the submit on the signin form.
     */
    $scope.signin = function (user) {
      // Sign out user before sign it again
      authService.signout(function () {
        authService.signin($scope.username, $scope.password, function (res, unconfirmed) {
          if (res) {
            $state.go('home');
          } else {
            $scope.error = unconfirmed ?
                'Please confirm your e-mail address before signing in.' :
                'Invalid username and/or password entered.';
          }
        });
      });
    };
  });
})(window);
