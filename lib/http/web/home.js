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
 * Exports the register function for the home module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('home/login');
  });
};
