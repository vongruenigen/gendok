/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var errors = require('./errors');
var logger = require('../../logger');

/**
 * This module contains helpers used in all API routes (e.g. protecting routes
 * from unauthorized access). The middleware in this helper may only be regist-
 * ered in the file where routes are defined by itself because they all rely on
 * an existing database connection for example.
 *
 * @type {Object}
 */
module.exports = {
  /**
   * This middleware ensures that the user authorized before accessing the
   * referenced url. An unauthorized error is returned if the user is not
   * authorized.
   *
   * @param {Function} app The express app
   * @param {String} pattern The url pattern for which this middleware is used
   */
  ensureAuthorizedUser: function (app, pattern, isAdmin) {
    isAdmin = !!isAdmin;

    app.use(pattern, function (req, res, next) {
      if (!res.user) {
        logger.error('User not in response object: ' + res.user);
        res.status(errors.unauthorized.code).json(errors.unauthorized.data);
        next(new Error('unauthorized access'));
      } else {
        if (res.user.isAdmin === isAdmin) {
          next();
        } else {
          logger.error('User not an admin: ' + res.user);
          res.status(errors.unauthorized.code).json(errors.unauthorized.data);
          next(new Error('unauthorized access'));
        }
      }
    });
  },

  getIfInAttrs: function (property, req, res, model) {
    if (property in req.body) {
      return req.body[property];
    } else {
      return res[model][property];
    }
  }
};
