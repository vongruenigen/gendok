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
 * Convinience function for registering all API modules.
 *
 * @param {express} app
 * @type  {Function}
 */
module.exports = function (app) {
  var allApiModules = require(__dirname);

  Object.keys(allApiModules).forEach(function (k) {
    var apiModule = allApiModules[k];

    if (typeof apiModule === 'function' && k !== 'all') {
      apiModule(app);
    }
  });
};
