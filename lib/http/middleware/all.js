/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

// Order matters! This means that for example the db middleware should be
// loaded first and then all others which depend on a working datbase connection.
var allMiddleware = [
  require('./enforce_ssl'),
  require('./basic'),
  require('./db'),
  require('./auth'),
  require('./error')
];

/**
 * Exports the register function authorization middleware module. This function
 * basically imports all other middleware modules and configures them on the
 * given app.
 *
 * The point of this module is that it configures all middleware to be executed
 * in the right order. This is require for example for our authorization middle-
 * ware since it dependes on an open database connection which is established
 * in db.js.
 *
 * @param {express} app
 * @param {Config} config
 * @type  {Function}
 */
module.exports = function (app, config) {
  allMiddleware.forEach(function (m) {
    m(app, config);
  });
};
