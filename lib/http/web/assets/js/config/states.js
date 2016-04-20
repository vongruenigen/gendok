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
      .state('templates', {
        url: '/templates',
        templateUrl: 'partials/home/templates',
        controller: 'templatesController'
      })
      .state('template', {
        url: '/templates/{templateId}',
        templateUrl: 'partials/home/template',
        controller: 'templateController'
      });

    // default route
    $urlRouterProvider.otherwise('/home');
  });
})(window);
