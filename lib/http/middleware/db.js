/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var db = require('../../data/db');

/**
 * Exports the register function database middleware module.
 *
 * @param {express} app
 * @param {Config} config
 * @type  {Function}
 */
module.exports = function (app, config) {
  app.use(function (req, res, next) {
    /* istanbul ignore next */
    if (!db.isConnected()) {
      db.connect(config);
    }

    res.db = req.db = db;
    next();
  });
};
