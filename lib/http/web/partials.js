/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var path = require('path');
var fs = require('fs');

var viewsPath = path.join(__dirname, 'views');
var defaultExt = '.jade';

/**
 * Exports the register function for the partials module.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app) {
  /**
   * GET /partials/:name
   */
  app.get('/partials/:name', function (req, res) {
    var requestedView = path.join(viewsPath, req.params.name + defaultExt);

    fs.stat(requestedView, function (err, stat) {
      if (err) {
        res.status(404).end();
      } else {
        res.render(req.params.name);
      }
    });
  });
};
