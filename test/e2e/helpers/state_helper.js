/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

/**
 * Helper for manipulating the current angular-js ui.router state.
 *
 * @type {Object}
 */
module.exports = {
  go: function (state, toParams) {
    var self = this;

    browser.executeAsyncScript(function () {
      var callback = arguments[arguments.length - 1];
      var state = arguments[0];
      var stateParams = arguments[1];
      var injector = angular.element(document.body).injector();
      var $state = injector.get('$state');
      $state.go(state, stateParams).then(callback);
    }, state, toParams);

    // Wait until the state transition has been done
    browser.driver.wait(function () {
      return self.current().then(function (s) {
        return s === state;
      });
    }, 5000);
  },

  current: function () {
    return browser.executeAsyncScript(function () {
      var callback = arguments[arguments.length - 1];
      var injector = angular.element(document.body).injector();
      var $state = injector.get('$state');
      return callback($state.current.name);
    });
  }
};
