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
  env:      require('./env'),
  config:   require('./config'),
  logger:   require('./logger'),
  data:     require('./data/'),
  http:     require('./http/'),
  compiler: require('./compiler/')
};
