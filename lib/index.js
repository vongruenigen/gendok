/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

console.log('Welcome to gendok!');

/**
 * Export all submodules of gendok.
 *
 * @type {Object}
 */
module.exports = {
    web:    require('./web'),
    api:    require('./api'),
    Config: require('./config'),
};
