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
var path = require('path');

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
   * @param {Boolean} isAdmin Signifies if the user has to be admin
   * @param {Array} excludes Paths excluded from the authentication
   */
  ensureAuthorizedUser: function (app, pattern, isAdmin, excludes) {
    isAdmin = !!isAdmin;

    app.use(pattern, function (req, res, next) {
      // Skip the request if the path is included in the excludes array
      var isExcluded = excludes && excludes.some(function (e) {
        return path.join(pattern, req.path).endsWith(e);
      });

      if (!isExcluded) {
        if (!res.user) {
          logger.error('User not in response object: ' + res.user);
          res.status(errors.unauthorized.code).json(errors.unauthorized.data);
          next(new Error('unauthorized access'));
        } else {
          if (isAdmin && !res.user.isAdmin) {
            logger.error('User not an admin: ' + res.user);
            res.status(errors.unauthorized.code).json(errors.unauthorized.data);
            next(new Error('unauthorized access'));
          } else {
            next();
          }
        }
      } else { next(); }
    });
  },

  /**
   * Checks if the given property is in the request and returns it. If it is not
   * there, the property from the response object will be returned.
   * Use this for PUT Request. With statements like "property = req.property | res.property"
   * the DB Validation will fail because i.e. empty string is falsy.
   *
   * @param {String} res The current response object
   * @param {Request} job The job
   * @param {Response} job The job object
   * @param {Model} job The job object
   * @return the property from one of the objects
   */
  getIfInAttrs: function (property, req, res, model) {
    if (property in req.body) {
      return req.body[property];
    } else {
      return res[model][property];
    }
  },

  /**
   * Sends back the job results in the correct format with the correct HTTP
   * headers 'Content-Type' and 'Content-Disposition'. It uses the job id
   * for creating the name. It sends the result back with the HTTP code 200.
   *
   * @param {Response} res The current response object
   * @param {Job} job The job object
   */
  sendJobResult: function (res, job) {
    // Return an internal error in case the job failed somehow
    if (job.state === 'failed') {
      return res.status(errors.internal.code).send(errors.internal.data);
    }

    var filename = 'result_' + job.id + '.' + job.getContentType().split('/')[1];

    res.set('Content-Type', job.getContentType())
       .set('Content-Disposition', 'attachment; filename="' + filename + '";')
       .status(200)
       .send(job.result);
  }
};
