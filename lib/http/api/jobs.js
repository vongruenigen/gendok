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
  app.post('/api/jobs/:id', function (req, res) {
    // TODO: Implement '/api/jobs/:id' request function
  });

  app.post('/api/jobs/:id/download', function (req, res) {
    // TODO: Implement '/api/jobs/:id/download' request function
  });
};
