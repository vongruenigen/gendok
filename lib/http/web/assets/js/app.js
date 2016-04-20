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

  // Make the angular module for gendok visible for anybody
  root.gendok = angular.module('gendok', [
    'ui.router', // Stateful router, see states.js
    'ngStorage'  // localStorage for angular-js
  ]);

  root.gendok.run(function ($rootScope, $state, authService) {
    $state.transitionTo('home');
    $rootScope.welcomeText = 'hello world from angular-js!';

    // Put the authService into the root scope to enable views
    // to the check for the current user.
    $rootScope.authService = authService;

    // Redirect the user to home if its already logged in and tries to access
    // the signin page
    $rootScope.$on('$stateChangeStart', function (e, to) {
      if (authService.isAuthenticated() && to.name === 'signin') {
        e.preventDefault();
        $state.go('home');
      }
    });
  });
})(window);
