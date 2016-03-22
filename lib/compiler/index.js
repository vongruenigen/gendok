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
 * Export compiler related submodules of gendok.
 *
 * @type {Object}
 */
module.exports = {
  noop:        require('./noop/'),
  mustache:    require('./mustache/'),
  compiler:    require('./compiler')
};
