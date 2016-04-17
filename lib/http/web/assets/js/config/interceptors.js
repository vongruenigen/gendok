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
   * This module incercepts every HTTP request done via $http and sets the
   * current JWT if available via the AuthService.
   */
  root.gendok.factory('jwtInterceptor', function ($injector) {
    // Use the injector directly to break circular dependencies between:
    // $http -> jwtInterceptor -> authService -> $http
    var authService = null;

    return {
      request: function (config) {
        if (!authService) {
          authService = $injector.get('authService');
        }

        if (authService.isAuthenticated()) {
          var user = authService.getUser();

          if (user.token) {
            config.headers = config.headers || {};
            config.headers.Authorization = 'Bearer ' + user.token;
          }
        }

        return config;
      }
    };
  });

  /**
   * Add our JwtInterceptor to the default inceptors of the $httpProvider.
   */
  root.gendok.config(function ($httpProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
  });
})(window);
