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
 * Exports the register function for the jobs api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  // TODO: Implement jop-api request functions
  app.post('/api/jobs/:id', function (req, res) {
    // req.params.id
  });

  app.post('/api/jobs/:id/download', function (req, res) {
    // res.header('Content-Type', 'application/pdf')
  });
};
