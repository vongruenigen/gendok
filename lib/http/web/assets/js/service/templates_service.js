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
   * This service is responsible for creating, reading, updating and deleting templates.
   */
  root.gendok.factory('templateService', function ($http) {
    return {
      createTemplate: function (success, error, payload) {
        $http.post('/api/templates', payload).then(success, error);
      },
      getAlltemplates: function (success, error) {
        $http.get('/api/templates').then(success, error);
      },
      getTemplate: function (success, error, id) {
        $http.get('/api/templates/' + id).then(success, error);
      },
      updateTemplate: function (success, error, payload) {
        $http.put('/api/templates/' + payload.id, payload).then(success, error);
      },
      deleteTemplate: function (success, error, id) {
        $http.delete('/api/templates/' + id).then(success, error);
      },
      renderTemplate: function (success, error, id, payload) {
        $http.post('/api/templates/' + id + '/render', payload, {responseType:'arraybuffer'}).then(success, error);
      }
    };
  });
})(window);
