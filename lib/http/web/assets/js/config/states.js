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
      .state('templates_list', {
        url: '/templates',
        templateUrl: 'partials/home/templates_list',
        controller: 'templatesListController'
      })
      .state('template_create', {
        url: '/templates/create',
        templateUrl: 'partials/home/template_create',
        controller: 'templateCreateController'
      })
      .state('template_view_update', {
        url: '/templates/{templateId}',
        templateUrl: 'partials/home/template_view_update',
        controller: 'templateViewUpdateController'
      });

    // default route
    $urlRouterProvider.otherwise('/home');
  });
})(window);
