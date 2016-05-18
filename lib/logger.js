/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var winston = require('winston');
var path = require('path');
var env = require('./env');
var config = require('./config');
var util = require('./util');
var transports = winston.transports;
var sliceProto = Array.prototype.slice;
var format = require('util').format;

/**
 * Module which exposes a winston logger instance once the module is required.
 *
 * @type {Object}
 */
module.exports = {
  /**
   * The instance which is used when calling log(). Is lazy initialized when the
   * log() function is called the first time.
   *
   * @type {winston.Logger}
   */
  _logger: null,

  /**
   * Configures the instance used by log(), info() etc with the given config.
   *
   * @param {Object} The config to use for this logger.
   */
  configure: function (cfg) {
    this._logger = this.create(cfg);
  },

  /**
   * Creates a logger instance with supplied config or uses a default config.
   *
   * @param  {Object} conf
   * @return {winston.Logger}
   */
  create: function (conf) {
    var logger = new winston.Logger(conf || {});
    var cfg = this._buildCfg();

    // Add file transports if the config specifies so.
    if (config.get('log_file')) {
      logger.add(transports.File, cfg);
    }

    // Add console transports if the config specifies so.
    if (config.get('log_console')) {
      logger.add(transports.Console, {
        timestamp: cfg.timestamp,
        json: cfg.json,
        level: cfg.level
      });
    }

    logger.cli();

    return logger;
  },

  /**
   * Returns the current instance used when info, warn, error or debug are
   * called directly on the module itself.
   *
   * @return {winston.Logger}
   */
  get: function () {
    return this._logger;
  },

  /**
   * Sets the current logger to the logger supplied as a parameter.
   *
   * @param {winston.Logger} logger The logger to use
   */
  set: function (logger) {
    this._logger = logger;
  },

  /**
   * Wrappers around the log methods of the instance to ensure the logger is
   * available when calling. See the winston documentation for more informations
   * on what params can be supplied.
   */
  info:  function () {
    this.log('info',  sliceProto.call(arguments));
  },

  warn:  function () {
    this.log('warn',  sliceProto.call(arguments));
  },

  error: function () {
    this.log('error', sliceProto.call(arguments));
  },

  debug: function () {
    this.log('debug', sliceProto.call(arguments));
  },

  /**
   * Calls the log() method on the logger instance.
   */
  log: function (level, args) {
    // Create on the fly if not present
    if (!this._logger) { this.configure(); }

    // Call the winston logger log() method
    this._logger.log(level, args);
  },

  /**
   * Builds the Winston transports config from the environment and default
   * config.
   *
   * @return Config which can be passed to Winston transports.
   */
  _buildCfg: function () {
    var filename = format('log/%s.log', env.get());
    var fullpath = path.join(process.cwd(), filename);

    // Default config. Overwritten by values of the passed config.
    var defaultConf = {
      filename: fullpath,
      timestamp: true,
      json: false,
      level: 'info',
      maxsize: 10485760,
      maxFiles: 4
    };

    // Config stored in the environment.
    var environmentConf = {
      timestamp: config.get('log_timestamp'),
      json: config.get('log_json'),
      level: config.get('log_level')
    };

    return util.extend(defaultConf, environmentConf);
  }
};
