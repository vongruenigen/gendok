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
  'redis_host',
  'redis_host',
  'http_host',
  'http_port',
  'database',
  'username',  // DB user
  'password',  // DB password
  'host',      // DB host
  'dialect',   // DB dialect
  'log_file',
  'log_console',
  'log_timestamp',
  'log_json',
  'log_level',
];

// Helper function for retrieving the default config as an object.
var getDefaultConfig = function () {
  return require('../config/default.json')[env.get()];
};

/**
 * Loader function for the current config. It tries to load an env specific
 * section if one exists, otherwise it'll just interpret the whole object as
 * the configuration. It uses the environment specific section if it matches
 * the current running environment.
 *
 * It then stores the current config in an environment variable.
 *
 * @param cfg The object containing the config values.
 */
module.exports = {
  /**
   * Sets the given config object as the current config.
   *
   * @param {Object} cfg The config to set.
   */
  load: function (cfg) {
    var self = this;
    var currentEnv = env.get();
    var configObj = cfg || {};

    // Load environment specific section from the config
    if (configObj[currentEnv]) {
      configObj = configObj[currentEnv];
    }

    configObj = this.sanitizeOptions(configObj);
    var defaultConfig = getDefaultConfig();

    // Merge the default config
    Object.keys(defaultConfig).forEach(function (k) {
      if (self._isNullOrUndefined(configObj[k])) {
        configObj[k] = defaultConfig[k];
      }
    });

    this._store(configObj);
  },

  /**
   * Returns the name of the environment variable where the config is stored
   * as a JSON-serialized javascript object.
   *
   * @return {String} The name of the environment variable where the config
   *                  is stored
   */
  envKey: function () {
    return 'GENDOK_' + env.get().toUpperCase() + '_CONFIG';
  },

  /**
   * Returns the default config stored in config/default.json as an object.
   *
   * @return {Object} The default config
   */
  getDefault: function () {
    return getDefaultConfig();
  },

  /**
   * Returns the value for the option with the given key.
   *
   * @param key The key to retrieve the value for.
   * @return {String} Value for the given key
   */
  get: function (key) {
    var value = this._read()[key];
    return this._isNullOrUndefined(value) ? '' : value;
  },

  /**
   * Sets the value for the option with the given key.
   *
   * @param key The key to set the value for
   * @param value The value to set
   * @return {String} Value for the given key
   */
  set: function (key, value) {
    var obj = this._read();
    obj[key] = value;
    this._store(obj);
  },

  /**
   * Returns the current configuration as a javascript object.
   *
   * @return {Object} The current configuration as an object.
   */
  toObject: function () {
    var obj = {};
    var cfg = this._read();

    Object.keys(cfg).forEach(function (k) {
      obj[k] = cfg[k];
    });

    return obj;
  },

  /**
   * Returns all available config options. All options which
   * are not part of this list are simply ignored by the Config
   * object.
   *
   * @returns {Array} The array with the available config options
   */
  getAvailableOptions: function () {
    return AVAILABLE_OPTIONS.slice();
  },

  /**
   * Sanitizes the options object by removing unknown/unavailable
   * options from the object.
   *
   * @returns {Object} The sanitized object
   */
  sanitizeOptions: function (opts) {
    var sanitizedOpts = {};
    var availableOpts = this.getAvailableOptions();

    Object.keys(opts).forEach(function (k) {
      if (availableOpts.indexOf(k) !== -1) {
        sanitizedOpts[k] = opts[k];
      }
    });

    return sanitizedOpts;
  },

  /**
   * Internal helper method to read the config from the environment.
   *
   * @return {Object} The current config object.
   */
  _read: function () {
    var envString = process.env[this.envKey()];

    // Store the default config if no config has beend loaded via load()
    if (!envString) {
      this.load(getDefaultConfig());
      envString = process.env[this.envKey()];
    }

    return JSON.parse(envString);
  },

  /**
   * Internal helper method to store the config in the environment.
   *
   * @param {Object} cfg The config to store.
   */
  _store: function (cfg) {
    process.env[this.envKey()] = JSON.stringify(cfg);
  },

  /**
   * Internal helper for checking if a given value is null or undefined.
   *
   * @param {Object} obj Object to check if it is null or undefined.
   */
  _isNullOrUndefined: function (obj) {
    return typeof obj === 'undefined' || obj === null;
  }
};
