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
    var isJson = req.get('Content-Type') === 'application/json';

    if (err instanceof SyntaxError && isJson) {
      res.status(errors.jsonSyntaxError.code).send(errors.jsonSyntaxError.data);
    } else {
      // We want extensive logs in this case in order to improve the error
      // handler.
      logger.error('An internal server error occured');
      logger.error(err);
      logger.error(err.stack);
      res.status(errors.internal.code).send(errors.internal.data);
    }
  });
};
