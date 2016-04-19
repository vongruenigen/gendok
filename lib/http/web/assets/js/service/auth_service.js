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

  var LOCAL_KEY = 'gendok_current_user';

  /**
   * This service is responsible for storing the current user and is exposing
   * functions for checking if the current user is logged in or not. It also
   * stores the token and ensures that the user logs in again after its expiry.
   */
  root.gendok.factory('authService', function ($http, $localStorage) {
    return {
      /**
       * Does the HTTP request to /api/auth/signin to sign in the user. It stores
       * the token returned by the user in the browsers localStorage.
       *
       * @param {String} username Username to sign in
       * @param {String} password Password to use to sign in
       */
      signin: function (username, password, fn) {
        var payload = {
          username: username,
          password: password
        };

        var self = this;

        $http.post('/api/auth/signin', payload).success(function (res) {
          self.setUser(username, res.token);
          fn(true);
        }).error(function (err) {
          fn(false);
        });
      },

      /**
       * Logs out the user from the current browser and invalidates its token.
       *
       * @param {Function} fn The callback to invoke after signout
       */
      signout: function (fn) {
        var user = this.getUser();
        this.setUser(null, null);

        if (user.username && user.password) {
          $http.post('/api/auth/signout').success(function (res) {
            // bad request means we're not signed in currently
            fn(res.statusCode === 200 ||
               res.statusCode === 400);
          });
        } else {
          fn(true);
        }
      },

      /**
       * Returns true if the user is signed in and authenticated.
       *
       * @param {Boolean} True if the user is signed in and authenticated
       */
      isAuthenticated: function () {
        var user = this.getUser();
        return user && user.username && user.token;
      },

      /**
       * Returns the current user if it is logged in.
       *
       * @return {Object} Object containing the token and the username
       */
      getUser: function () {
        return $localStorage[LOCAL_KEY];
      },

      /**
       * Stores the current username with the associated token in
       * the local storage of the browser.
       *
       * @param {String} username Username to store
       * @param {String} token Token to store
       */
      setUser: function (username, token) {
        $localStorage[LOCAL_KEY] = {
          username: username,
          token: token
        };
      }
    };
  });
})(window);
