/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var config = require('../../config');
var format = require('util').format;

/**
 * Exports the register function for the home module.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app) {
  var httpsActivated = config.get('ssl_key') && config.get('ssl_cert');

  app.all('*', function (req, res, next) {
    if (httpsActivated && !req.secure) {
      var newLocation = format('https://%s:%s%s',
                               config.get('http_host'),
                               config.get('http_ssl_port'),
                               req.originalUrl);

      res.writeHead(301, {Location: newLocation});
      return res.end();
    }

    next();
  });
};
