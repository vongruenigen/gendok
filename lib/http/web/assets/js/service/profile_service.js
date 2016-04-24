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
   * This service is responsible for reading, updating the profile.
   */
  root.gendok.factory('profileService', function ($http) {
    return {
      getProfile: function (success, error, id) {
        $http.get('/api/profile/').then(success, error);
      },

      updateProfile: function (success, error, payload) {
        $http.put('/api/profile/', payload).then(success, error);
      }
    };
  });
})(window);