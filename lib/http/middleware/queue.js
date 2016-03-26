/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var errors = require('../api/errors');

/**
 * Exports the register function queue middleware module.
 *
 * @param {express} app
 * @param {Config} config
 * @type  {Function}
 */
module.exports = function (app, config) {
  app.use(function (req, res, next) {
    /* istanbul ignore next */
    if (!app.locals.queue) {
      return next(new Error(errors.internal.data));
    }

    res.queue = app.locals.queue;
    next();
  });
};
