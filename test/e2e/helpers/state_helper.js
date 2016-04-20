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
  go: function (state) {
    return browser.executeAsyncScript(function () {
      var callback = arguments[arguments.length - 1];
      var state = arguments[0];
      var injector = angular.element(document.body).injector();
      var $state = injector.get('$state');
      $state.go(state).then(callback);
    }, state);
  },

  current: function () {
    browser.driver.sleep(200);
    return browser.executeAsyncScript(function () {
      var callback = arguments[arguments.length - 1];
      var injector = angular.element(document.body).injector();
      var $state = injector.get('$state');
      return callback($state.current.name);
    });
  }
};
