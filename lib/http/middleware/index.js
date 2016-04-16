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
 * Export middleware related submodules of gendok.
 *
 * @type {Object}
 */
module.exports = {
  all:   require('./all'),
  basic: require('./basic'),
  db:    require('./db'),
  auth:  require('./auth'),
  error: require('./error')
};
