/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

// Order matters! The home module has to be the last, otherwise the used
// catch-all route ('*') is used for all requests which breaks gendok.
var allWebModules = [
  require('./partials'),
  require('./home')
];

/**
 * Exports the register function for all web modules. This is required because
 * order matters here since we use a catch-all route ('*') which has to be reg-
 * istered at last, otherwise it will catch all requests to stuff we've setup
 * before (e.g. static assets, api requests, ...).
 *
 * @param {express} app
 * @type  {Function}
 */
module.exports = function (app) {
  allWebModules.forEach(function (m) {
    m(app);
  });
};
