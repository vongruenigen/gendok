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
    return browser.executeAsyncScript(state, function (state, callback) {
      var injector = angular.element(document.body).injector();
      var $state = injector.get('$state');
      $state.go(state).then(callback);
    });
  },

  current: function () {
    return browser.executeScript(function () {
      var injector = angular.element(document.body).injector();
      var $state = injector.get('$state');
      return $state.current.name;
    });
  }
};
