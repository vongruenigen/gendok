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

/**
 * Exports the register function for the status api module.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app, config) {
  app.get('/api/status', function (req, res) {
    if (res.user) {
      // TODO: Real status check maybe?
      res.json({status: 'ok'});
    } else {
      res.status(errors.unauthorized.code).json(errors.unauthorized.data);
    }
  });
};
