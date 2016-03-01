/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var env = require('./env');

const AVAILABLE_OPTIONS = [
    'username', // DB user
    'password', // DB password
    'host',     // DB host
    'dialect'   // DB dialect
];

/**
 * Constructor for a Config object. It tries to load an environment specific
 * section if one exists, otherwise it'll just interpret the whole object as
 * the configuration.
 *
 * @param cfg The object containing the config values.
 */
function Config(cfg) {
    var currentEnv = env.get();

    cfg = cfg || {};
    this.cfg = Config.sanitizeOptions(cfg[currentEnv] ? cfg[currentEnv] : cfg);
}

/**
 * Returns the value for the option with the given key.
 *
 * @param key The key to retrieve the value for.
 * @return {String} Value for the given key
 */
Config.prototype.get = function (key) {
  return this.cfg[key] || '';
};

/**
 * Returns the current configuration as a javascript object.
 *
 * @return {Object} The current configuration as an object.
 */
Config.prototype.toObject = function () {
  var obj = {};

  for (var k in this.cfg) {
    if (this.cfg.hasOwnProperty(k)) {
      obj[k] = this.cfg[k];
    }
  }

  return obj;
};

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
