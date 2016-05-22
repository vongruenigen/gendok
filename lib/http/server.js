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
var https = require('https');
var logger = require('../logger');
var config = require('../config');
var db = require('../data/db');
var util = require('../util');
var fs = require('fs');

/**
 * Constructor of the Server object. Wraps an express app which is configured
 * to handle all requests to the REST API. It also responsible for serving
 * static assets for the frontend which then uses the API.
 */
function HttpServer() {
  this._app = express();
  this._sockets = [];
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
  var port = config.get('http_port');
  var sslPort = config.get('http_ssl_port');
  var host = config.get('http_host');

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

  // Create actual http server and queue
  this._createServers();

  logger.info('start()', 'starting http server on %s:%s', host, port);

  if (this.sslEnabled()) {
    logger.info('start()', 'starting https server on %s:%s', host, sslPort);
  }

  var listenCallback = function () {
    self._isRunning = true;

    // Remove error handler again
    self._server.removeListener('error', fn);

    // Establish the mongodb after the http server has started
    db.connect();

    logger.info('start()', 'successfully started http server on %s:%s', host, port);

    if (self.sslEnabled()) {
      logger.info('start()', 'successfully started https server on %s:%s', host, sslPort);
    }

    fn();
  };

  // Start to listening and keep track of the running state
  this._server.listen(this.sslEnabled() ? sslPort : port, host, function () {
    if (self.sslEnabled()) {
      self._insecureServer.listen(port, host, listenCallback);
    } else {
      listenCallback();
    }
  });

  var onConnectionHandler = function (s) {
    self._sockets.push(s);
  };

  var onErrorHandler = function (e) {
    self._isRunning = false;
    logger.error('start()', 'error while starting http server: %s', e);
  };

  // In order to really shutdown the HTTP server when calling stop() in tests,
  // we need to keep track of all connections and close them manually at the end.
  this._server.on('connection', onConnectionHandler);

  // Call the supplied callback when the error events occures. It will be
  // removed after the 'listening' event has been emitted.
  this._server.on('error', fn);

  // Listen to errors event of the underlying http server to keep track
  // of the running state
  this._server.on('error', onErrorHandler);

  // Do the same for the insecure server in case we're running with ssl activated
  if (this.sslEnabled()) {
    this._insecureServer.on('connection', onConnectionHandler);
    this._insecureServer.on('error', fn);
    this._insecureServer.on('error', onErrorHandler);
  }
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
    this._sockets.forEach(function (s) {
      s.destroy();
    });

    var closeCb = function (err) {
      self._isRunning = false;
      fn(err);
    };

    this._server.close(function (err) {
      if (self.sslEnabled()) {
        self._insecureServer.close(closeCb);
      } else {
        closeCb(err);
      }
    });
  } else {
    fn();
  }
};

/**
 * Returns true if all ssl related values are given. This include 'ssl_cert',
 * 'ssl_key' and 'http_ssl_port'. The values are not validated here, this is
 * done when starting the servers.
 *
 * @returns {Boolean} True if the all ssl related values are given in the config
 */
HttpServer.prototype.sslEnabled = function () {
  return !!config.get('http_ssl_port') &&
         !!config.get('ssl_key') &&
         !!config.get('ssl_cert');
};

/**
 * Returns true if a ssl related value is given. This include 'ssl_cert',
 * 'ssl_key' and 'http_ssl_port'. The values are not validated here, this is
 * done when starting the servers.
 *
 * @returns {Boolean} True if a ssl related value is given in the config
 */
HttpServer.prototype.sslValueSet = function () {
  return !!config.get('http_ssl_port') ||
         !!config.get('ssl_key') ||
         !!config.get('ssl_cert');
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
 * Creates up to two http server based on the current config. If 'ssl_key' and
 * 'ssl_cert' is set, it creates two server, one with https setup on the port
 * set in 'http_ssl_port' and a second one with only http configured which
 * enforces https for each request. If SSL is not configured, the insecure server
 * will not be created.
 */
HttpServer.prototype._createServers = function () {
  var options = null;
  var mod = http;

  if (this.sslValueSet() && !this.sslEnabled()) {
    throw new Error('ssl configuration is incomplete');
  }

  if (this.sslEnabled()) {
    options = {
      key: fs.readFileSync(config.get('ssl_key')),
      cert: fs.readFileSync(config.get('ssl_cert'))
    };

    this._insecureServer = mod.createServer(this._app);

    mod = https;
  }

  this._server = options ? mod.createServer(options, this._app) :
                           mod.createServer(this._app);
};

/**
 * Export constructor of Server wrapper.
 *
 * @type {Function}
 */
module.exports = HttpServer;
