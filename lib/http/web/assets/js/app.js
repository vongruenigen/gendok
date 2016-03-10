/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

// Make the angular module for gendok visible for anybody
var gendok = window.gendok = angular.module('gendok', [/* dependencies */]);

gendok.run(function ($rootScope) {
  $rootScope.welcomeText = 'hello world from angular-js!';
});
