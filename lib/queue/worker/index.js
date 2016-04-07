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
 * Export queue workers used in gendok.
 *
 * @type {Object}
 */
module.exports = {
  convert: require('./convert'),
  cleanup: require('./cleanup'),
  email:   require('./email')
};
