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
var defaultExt = '.pug';

/**
 * Exports the register function for the partials module. This module is
 * responsible for delivering the compile pug template to the angular-js
 * frontend which then uses them to render the HTML frontend.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app) {
  /**
   * GET /partials/:path*
   */
  app.get('/partials/*', function (req, res) {
    var view = req.params[0];
    var filename = view + defaultExt;
    var requestedView = path.join(viewsPath, 'partials', filename);

    fs.stat(requestedView, function (err, stat) {
      if (err) {
        res.status(404).end();
      } else {
        res.render('partials/' + view);
      }
    });
  });
};
