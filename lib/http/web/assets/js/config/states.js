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
      .state('templatesList', {
        url: '/templates',
        templateUrl: 'partials/templates/list',
        controller: 'templateController',
        data: {authenticated: true}
      })
      .state('templateCreate', {
        url: '/templates/create',
        templateUrl: 'partials/templates/create',
        controller: 'templateController',
        data: {authenticated: true}
      })
      .state('templateViewUpdate', {
        url: '/templates/{templateId}',
        templateUrl: 'partials/templates/view_update',
        controller: 'templateController',
        data: {authenticated: true}
      })
      .state('profileConfirm', {
        url: '/profile/confirm?token',
        templateUrl: 'partials/profile/confirm',
        controller: 'profileController'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'partials/profile/index',
        controller: 'profileController'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'partials/profile/signup',
        controller: 'profileController',
      })
      .state('notFound', {
        url: '/not-found',
        templateUrl: 'partials/not_found'
      });

    // default route
    $urlRouterProvider.otherwise('/home');
  });
})(window);
