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
 * Export all queue related submodules.
 *
 * @type {Object}
 */
module.exports = {
  runner: require('./runner'),
  worker: require('./worker/')
};
