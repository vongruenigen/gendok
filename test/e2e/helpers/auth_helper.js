/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var state = require('./state_helper');

/**
 * Authentication helper for our e2e tests.
 *
 * @type {Object}
 */
module.exports = {
  signin: function (user, password, fn) {
    this.isAuthenticated().then(function (isAuth) {
      if (!isAuth) {
        var signinButton   = $('.btn-signin');
        var errorParagraph = $('.alert');
        var usernameField  = $('#username');
        var passwordField  = $('#password');

        state.go('signin');

        usernameField.sendKeys(user.email);
        usernameField.sendKeys(user.email);
        signinButton.click();
        fn();
      }
    });
  },

  signout: function (fn) {
    this.isAuthenticated().then(function (isAuth) {
      if (!isAuth) {
        return fn();
      }

      var signoutLink = $('[ng-click="signoutUser()"]');
      var dropdownToggle = $('li a.dropdown-toggle');

      state.go('home');

      dropdownToggle.click();
      signoutLink.click();
      fn();
    });
  },

  currentUser: function () {
    return browser.executeScript(function () {
      var injector = angular.element(document.body).injector();
      var authService = injector.get('authService');
      return authService.getUser();
    });
  },

  isAuthenticated: function (fn) {
    return browser.executeScript(function () {
      var injector = angular.element(document.body).injector();
      var authService = injector.get('authService');
      return authService.isAuthenticated();
    });
  }
};
