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
  root.gendok.factory('templateService', function ($http) {
    return {
      getAlltemplates: function (fn) {
        $http.get('/api/templates').success(function (res, status) {
          fn(res);
        }).error(function (err) {
          fn(err);
        });
      },
      getTemplate: function (success, error, id) {
        $http.get('/api/templates/' + id).then(success, error);
      },
      updateTemplate: function (success, error, payload) {
        $http.put('/api/templates/' + payload.id, payload).then(success, error);
      },
      deleteTemplate: function (success, error, id) {
        $http.delete('/api/templates/' + id).then(success, error);
      }
    };
  });
})(window);
