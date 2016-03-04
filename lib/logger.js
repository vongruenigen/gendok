/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var winston    = require('winston'),
    util       = require('util'),
    path       = require('path'),
    env        = require('./env'),
    transports = winston.transports,
    sliceProto = Array.prototype.slice;

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

    // If their is a config, return the logger immediately..
    if (conf) {
      return logger;
    } else {
      // ..or add the default config otherwie
      var filename = util.format('%s.log', env.get());
      var fullpath = path.join(process.cwd(), filename);
      logger.add(transports.File, {filename: fullpath, timestamp: true});

      // If we're in development, we also want to also log to stdout
      if (env.is('development')) {
        logger.add(transports.Console, {timestamp: true});
      }

      logger.cli();
    }

    return logger;
  },

  /**
   * Returns the current instance used when info, warn, error or debug are
   * called directly on the module itself.
   *
   * @return {winston.Logger}
   */
  get: function () { return this._logger; },

  /**
   * Wrappers around the log methods of the instance to ensure the logger is
   * available when calling. See the winston documentation for more informations
   * on what params can be supplied.
   */
  info:  function () { this.log('info',  sliceProto.call(arguments)); },
  warn:  function () { this.log('warn',  sliceProto.call(arguments)); },
  error: function () { this.log('error', sliceProto.call(arguments)); },
  debug: function () { this.log('debug', sliceProto.call(arguments)); },

  /**
   * Calls the log() method on the logger instance.
   */
  log: function (level, args) {
    // Create on the fly if not present
    if (!this._logger) { this.configure(); }

    // Call the winston logger log() method
    this._logger.log(level, args);
  }
};
