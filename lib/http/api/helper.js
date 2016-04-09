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
  ensureAuthorizedUser: function (app, pattern) {
    app.use(pattern, function (req, res, next) {
      if (!res.user) {
        logger.error('User not in response object: ' + res.user);
        res.status(errors.unauthorized.code).json(errors.unauthorized.data);
        next(new Error('unauthorized access'));
      } else {
        next();
      }
    });
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
    var filename = 'result_' + job.id + '.' + job.getContentType().split('/')[1];

    res.set('Content-Type', job.getContentType())
       .set('Content-Disposition', 'attachment; filename="' + filename + '";')
       .status(200)
       .send(job.result);
  }
};
