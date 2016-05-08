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

  /**
   * This service is responsible for reading, updating the profile.
   */
  root.gendok.factory('profileService', function ($http) {
    return {
      /**
       * Does a HTTP request to /api/profile/signup to signup the user with
       * the given payload.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       * @param {Object} payload The payload to send
       */
      signup: function (success, error, payload) {
        $http.post('/api/profile/signup', payload).then(success, error);
      },

      /**
       * Does a HTTP request to /api/profile/confirm?token=... to confirm the
       * user with the given token.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       */
      confirm: function (success, error, token) {
        $http.get('/api/profile/confirm?token=' + token).then(success, error);
      },

      /**
       * Does the HTTP request to /api/profile/ to get the users profile.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       */
      getProfile: function (success, error) {
        $http.get('/api/profile/').then(success, error);
      },

      /**
       * Does the HTTP request to /api/profile/ to update the users profile.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       * @param {Object} payload Payload to update the profile with
       */
      updateProfile: function (success, error, payload) {
        $http.put('/api/profile/', payload).then(success, error);
      }
    };
  });
})(window);
