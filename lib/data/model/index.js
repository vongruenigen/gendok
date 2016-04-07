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
 * Export all model related submodules.
 *
 * @type {Object}
 */
module.exports = {
  Template: require('./template'),
  User:     require('./user'),
  Job:      require('./job')
};
