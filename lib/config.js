/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var env = require('./env')
var defaultConfig = require('../config/default.json');

const AVAILABLE_OPTIONS = [
  'http_host',
  'http_port',
  'username',  // DB user
  'password',  // DB password
  'host',      // DB host
  'dialect',   // DB dialect
];

/**
 * Constructor for a Config object. It tries to load an environment specific
 * section if one exists, otherwise it'll just interpret the whole object as
 * the configuration. It uses the environment specific section if it matches
 * the current running environment.
 *
 * @param cfg The object containing the config values.
 */
function Config(cfg) {
  var currentEnv = env.get()
  var configObj = cfg || {};

  // Load environment specific section from the config
  if (configObj[currentEnv]) {
    configObj = configObj[currentEnv];
  }

  configObj = Config.sanitizeOptions(configObj);

  // Merge the default config
  Object.keys(defaultConfig).forEach(function (k) {
    if ((configObj[k] || '') === '') {
      configObj[k] = defaultConfig[k];
    }
  });

  this.configObj = configObj;
}

/**
 * Returns the value for the option with the given key.
 *
 * @param key The key to retrieve the value for.
 * @return {String} Value for the given key
 */
Config.prototype.get = function (key) {
  return this.configObj[key] || '';
};

/**
 * Returns the current configuration as a javascript object.
 *
 * @return {Object} The current configuration as an object.
 */
Config.prototype.toObject = function () {
  var obj = {};
  var self = this;

  Object.keys(this.configObj).forEach(function (k) {
    obj[k] = self.configObj[k];
  });

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
 * Returns the default config stored in config/default.json as an object.
 *
 * @return {Object} The default config
 */
Config.getDefault = function () {
  return new Config(defaultConfig);
};

/**
 * Sanitizes the options object by removing unknown/unavailable
 * options from the object.
 *
 * @returns {Object} The sanitized object
 */
Config.sanitizeOptions = function (opts) {
  var sanitizedOpts = {};
  var availableOpts = this.getAvailableOptions();

  Object.keys(opts).forEach(function (k) {
    if (availableOpts.indexOf(k) !== -1) {
      sanitizedOpts[k] = opts[k];
    }
  });

  return sanitizedOpts;
};

module.exports = Config;
