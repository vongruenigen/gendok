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
   * This service is responsible for creating, reading, updating and deleting users.
   */
  root.gendok.factory('userService', function ($http) {
    return {
      /**
       * Does the HTTP request to /api/users/ to create a new user.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       * @param {Object} payload Payload to create the user with
       */
      createUser: function (success, error, payload) {
        $http.post('/api/users', payload).then(success, error);
      },

      /**
       * Does the HTTP request to /api/users/ to get a list of all users.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       */
      getAllUsers: function (success, error) {
        $http.get('/api/users').then(success, error);
      },

      /**
       * Does the HTTP request to /api/users/{id} to get a specific user.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       * @param {Number} id Id which is used to get the referencing user
       */
      getUser: function (success, error, id) {
        $http.get('/api/users/' + id).then(success, error);
      },

      /**
       * Does the HTTP request to /api/users/{id} to update a specific user.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       * @param {Object} payload Payload to update the user with
       */
      updateUser: function (success, error, payload) {
        $http.put('/api/users/' + payload.id, payload).then(success, error);
      },

      /**
       * Does the HTTP request to /api/users/{id} to delete a specific user.
       *
       * @param {Function} success The callback to invoke after a successful request
       * @param {Function} error The callback to invoke after a request with errors
       * @param {Number} id Id which is used to delete the referencing user
       */
      deleteUser: function (success, error, id) {
        $http.delete('/api/users/' + id).then(success, error);
      }
    };
  });
})(window);
