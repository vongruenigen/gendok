/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var AVAILABLE_OPTIONS = [
    'host',
    'port',
    'workingDirectory'
];

/**
 * Constructor for a Config object. This config object
 * is used for configurating the web/api backends.
 *
 * @param cfg The object containing the config values.
 */
function Config(cfg) {
    this.cfg = cfg || {};
}

/**
 * Returns all available config options. All options which
 * are not part of this list are simply ignored by the Config
 * object.
 *
 * @returns {Array} The array with the available config options
 */
Config.getAvailableOptions = function () {
    return AVAILABLE_OPTIONS.slice();
};

/**
 * Sanitizes the options object by removing unknown/unavailable
 * options from the object.
 *
 * @returns {Object} The sanitized object
 */
Config.sanitizeOptions = function (opts) {
    var sanitizedOpts = {},
        availableOpts = this.getAvailableOptions();

    for (var k in opts) {
        if (opts.hasOwnProperty(k) && availableOpts.indexOf(k) !== -1) {
            sanitizedOpts[k] = opts[k];
        }
    }

    return sanitizedOpts;
};

module.exports = Config;
