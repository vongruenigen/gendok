/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var stateHelper = require('./state_helper');

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

        stateHelper.go('signin');

        usernameField.sendKeys(user.email);
        usernameField.sendKeys(user.email);
        signinButton.click();

        // Login takes some time, so wait until it's done. For the test app's
        // login, we know it's done when it redirects to home.
        browser.driver.wait(function () {
          return stateHelper.current().then(function (s) {
            return s === 'home';
          });
        }, 5000).then(function () { fn(); });
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

      stateHelper.go('home');

      dropdownToggle.click();
      signoutLink.click();

      // Signout takes some time, so wait until it's done.
      browser.driver.wait(function () {
        return stateHelper.current().then(function (s) {
          return s === 'home';
        });
      }, 5000).then(function () { fn(); });
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
