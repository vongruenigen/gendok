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
   * This service is responsible for creating, reading, updating and deleting users.
   */
  root.gendok.factory('userService', function ($http) {
    return {
      createUser: function (success, error, payload) {
        $http.post('/api/users', payload).then(success, error);
      },

      getAllUsers: function (success, error) {
        $http.get('/api/users').then(success, error);
      },

      getUser: function (success, error, id) {
        $http.get('/api/users/' + id).then(success, error);
      },

      updateUser: function (success, error, payload) {
        $http.put('/api/users/' + payload.id, payload).then(success, error);
      },

      deleteUser: function (success, error, id) {
        $http.delete('/api/users/' + id).then(success, error);
      }
    };
  });
})(window);
