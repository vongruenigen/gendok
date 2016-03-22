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
 * Exports the register function for the templates status module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  app.get('/api/status', function (req, res) {
    // TODO: Real status check maybe?
    res.send({status: 'ok'});
  });
};
