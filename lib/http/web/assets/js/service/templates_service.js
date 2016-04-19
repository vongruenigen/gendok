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
      getAlltemplates: function () {
        $http.post('/api/templates').success(function (res) {
          return res.body;
          fn(true);
        }).error(function (err) {
          fn(false);
        });
      }
    };
  });
})(window);
