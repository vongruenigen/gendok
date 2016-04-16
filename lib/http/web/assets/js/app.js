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

  // Make the angular module for gendok visible for anybody
  var gendok = window.gendok = angular.module('gendok', [
    'ui.router', // Stateful router, see states.js
    'ngStorage'  // localStorage for angular-js
  ]);

  gendok.run(function ($rootScope, $state, authService) {
    $state.transitionTo('home');
    $rootScope.welcomeText = 'hello world from angular-js!';

    // Put the authService into the root scope to enable views
    // to the check for the current user.
    $rootScope.authService = authService;
  });
})();
