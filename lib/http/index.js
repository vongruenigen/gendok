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
 * Export http related submodules of gendok.
 *
 * @type {Object}
 */
module.exports = {
  server: require('./server'),
  web:    require('./web/'),
  api:    require('./api/'),
};
