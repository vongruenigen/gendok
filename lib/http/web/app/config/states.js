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
      .state('usersList', {
        url: '/users',
        templateUrl: 'partials/users/list',
        controller: 'userController',
        data: {authenticated: true}
      })
      .state('userCreate', {
        url: '/users/create',
        templateUrl: 'partials/users/create',
        controller: 'userController',
        data: {authenticated: true}
      })
      .state('userViewUpdate', {
        url: '/users/{userId}',
        templateUrl: 'partials/users/view_update',
        controller: 'userController',
        data: {authenticated: true}
      })
      .state('profile', {
        url: '/profile?resetPassword',
        templateUrl: 'partials/profile/index',
        controller: 'profileController',
        data: {authenticated: true}
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'partials/profile/signup',
        controller: 'profileController',
      })
      .state('reset-password', {
        url: '/profile/reset-password',
        templateUrl: 'partials/profile/reset_password',
        controller: 'profileController'
      })
      .state('reset-password-req', {
        url: '/reset-password-req',
        templateUrl: 'partials/profile/reset_password_req',
        controller: 'profileController'
      })
      .state('notFound', {
        url: '/not-found',
        templateUrl: 'partials/not_found'
      });

    // default route
    $urlRouterProvider.otherwise('/home');
  });
})(window);
