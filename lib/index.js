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
 * Export all submodules of gendok.
 *
 * @type {Object}
 */
module.exports = {
  web:    require('./web/'),
  data:   require('./data/'),
  api:    require('./api/'),
  env:    require('./env'),
  config: require('./config'),
};
