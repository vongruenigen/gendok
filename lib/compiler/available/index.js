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
 * Export all available compilers
 *
 * @type {Object}
 */
module.exports = {
  html:      require('./html'),
  mustache:  require('./mustache'),
  markdown:  require('./markdown')
};
