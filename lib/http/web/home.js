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
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app) {
  /**
   * Respond to every request with the index page since all the logic for the
   * frontend is handled via angular-js on the client.
   */
  app.get('*', function (req, res) {
    res.render('index');
  });
};
