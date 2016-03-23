/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var express = require('express');
var http = require('http');
var logger = require('../logger');
var db = require('../data/db');

/**
 * Constructor of the Server object. Wraps an express app which is configured
 * to handle all requests to the REST API. It also responsible for serving
 * static assets for the frontend which then uses the API.
 *
 * @param {Config} config
 */
function HttpServer(config) {
  this._app    = express();
  this._config = config;
}

/**
 * Currently calls listen and on the express app created in the constructor.
 *
 * When the underlying http server emits the 'listen' event the callback is invoked.
 *
 * @param {Function} fn
 */
HttpServer.prototype.start = function (fn) {
  var self = this;
  var port = this._config.get('http_port');
  var host = this._config.get('http_host');

  if (!fn) {
    throw new Error('callback is mandatory');
  }

  // Invoke callback if already running
  if (this.isRunning()) {
    logger.warn('start()', 'http already running, skip');
    return fn(null);
  }

  // Keep track of running state
  this._isRunning = false;

  // Create actual http server
  this._server = http.createServer(this._app);

  logger.info('start()', 'starting http server on %s:%s', host, port);

  // Start to listening and keep track of the running state
  this._server.listen(port, host, function () {
    self._isRunning = true;

    // Remove error handler again
    self._server.removeListener('error', fn);

    // Establish the mongodb after the http server has started
    db.connect(self._config);

    logger.info('successfully started http server on %s:%s', host, port);

    fn();
  });

  // Call the supplied callback when the error events occures. It will be
  // removed after the 'listening' event has been emitted.
  this._server.on('error', fn);

  // Listen to errors event of the underlying http server to keep track
  // of the running state
  this._server.on('error', function (e) {
    self._isRunning = false;
    logger.error('start()', 'error while starting http server: %s', e);
  });
};

/**
 * Returns true if the server is running, otherwise false.
 *
 * @return {Boolean}
 */
HttpServer.prototype.isRunning = function () {
  return !!this._isRunning;
};

/**
 * Stops the underlying http server and invokes the optional callback.
 *
 * @param {Function} fn
 */
HttpServer.prototype.stop = function (fn) {
  var self = this;

  if (this._server && this.isRunning()) {
    this._server.close(function (err) {
      self._isRunning = false;
      fn(err);
    });
  } else {
    fn();
  }
};

/**
 * Returns the associated config object.
 *
 * @return {Config} The config object.
 */
HttpServer.prototype.getConfig = function () {
  return this._config;
};

/**
 * Returns the associated express app.
 *
 * @return {Function} The express app
 */
HttpServer.prototype.getApp = function () {
  return this._app;
};

/**
 * Registers the module by invoking the supplied callback with the express app.
 *
 * @param {Function} fn The register callback
 */
HttpServer.prototype.registerModule = function (fn) {
  if (this.isRunning()) {
    throw new Error('modules cannot be registered after the server has started');
  }

  if (typeof fn !== 'function') {
    throw new Error('module has to be a function accepting the express app');
  }

  fn(this.getApp());
};

/**
 * Registers multiple modules at once. See registerModule() for more infos.
 *
 * @param {Array} modules
 */
HttpServer.prototype.registerModules = function (modules) {
  var self = this;

  if (!modules) {
    throw new Error('modules may not be null');
  }

  modules.forEach(function (m) {
    self.registerModule(m);
  });
};

/**
 * Export constructor of Server wrapper.
 *
 * @type {Function}
 */
module.exports = HttpServer;
