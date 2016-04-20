/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var logger = require('../../logger');
var errors = require('../api/errors');

/**
 * Exports the register function error middleware module.
 *
 * @param {express} app
 * @type  {Function}
 */
module.exports = function (app) {
  /* istanbul ignore next */
  app.use(function (err, req, res, next) {
    logger.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    logger.error(err);
    logger.error('stack:');
    logger.error(err.stack);
    logger.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    res.status(errors.internal.code).send(errors.internal.data);
  });
};
