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
 * Export all data related submodules.
 *
 * @type {Object}
 */
module.exports = {
  db:    require('./db'),
  model: require('./model/')
};
