/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

/**
 * Exports the register function database middleware module.
 *
 * @param {express} app
 * @param {Config} config
 * @param {Queue} queue
 * @type  {Function}
 */
module.exports = function (app, config, queue) {
  app.use(function (req, res, next) {
    // TODO: We need to require the db.js file here instead of the top, because
    // we currently have problems of istanbul intercepting and breaking (!) the
    // require function somehow. This should be fixed!
    var db = require('../../data/db');

    if (!db.isConnected()) {
      db.connect(config);
    }

    res.db = db;
    next();
  });
};
