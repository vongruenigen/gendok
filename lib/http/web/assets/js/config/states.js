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

  root.gendok.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'partials/home/index',
        controller: 'homeController'
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'partials/home/signin',
        controller: 'signinController'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'partials/home/profile',
        controller: 'profileController'
      });

    // default route
    $urlRouterProvider.otherwise('/home');
  });
})(window);
