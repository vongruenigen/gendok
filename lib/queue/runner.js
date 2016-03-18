/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var env = require('../env');
var logger = require('../logger');
var kue = require('kue');

/**
 * Helper function to create a kue.js queue with the config settings specified
 * in the given config object.
 *
 * @param {Config} cfg The config object to use.
 * @return The newly created kue.js queue.
 */
var createQueue = function (cfg) {
  var connectionSettings = {
    host: cfg.get('redis_host'),
    port: cfg.get('redis_port'),
    auth: cfg.get('redis_auth')
  };

  return kue.createQueue({
    prefix: 'gendok_' + env.get(),
    redis: connectionSettings
  });
};

/**
 * Constructor of the Runner object. Wraps an a kue.js queue and runs workers
 * in the background which receive jobs via redis. It expects a Config object,
 * otherwise it will use the default config.
 *
 * @param {Config} cfg The config to use.
 */
function Runner(cfg) {
  this._config = cfg;
}

/**
 * Starts the worker queue and begins processing jobs
 *
 * @param {Function} fn Callback which is invoked after the queue has started.
 */
Runner.prototype.start = function (fn) {
  if (!fn) {
    throw new Error('callback is mandatory');
  }

  // Invoke callback if already running
  if (this.isRunning()) {
    logger.warn('start()', 'queue runner already running, skip');
    return fn(null);
  }

  // Keep track of running state
  this._isRunning = true;
  this._queue = createQueue(this._config);

  fn();
};

/**
 * Returns true if the worker queue is running, otherwise false.
 *
 * @return {Boolean}
 */
Runner.prototype.isRunning = function () {
  return !!this._isRunning;
};

/**
 * Stops the worker queue and invokes the optional callback.
 *
 * @param {Function} fn Callback which is invoked after the queue has been stopped.
 */
Runner.prototype.stop = function (fn) {
  var self = this;

  if (this._queue && this.isRunning()) {
    this._queue.shutdown(function (err) {
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
Runner.prototype.getConfig = function () {
  return this._config;
};

/**
 * Returns the associated kue.js queue.
 *
 * @return {Queue} The kue.js queue object.
 */
Runner.prototype.getQueue = function () {
  return this._queue;
};

/**
 * Registers the worker by providing a key on which job it should listen and
 * a function which is called when the worker receives a job.
 *
 * @param {String} key The key to receive jobs for
 * @param {Function} fn The callback which is invoked as soon as a job arrives
 */
Runner.prototype.registerWorker = function (key, fn) {
  if (typeof(fn) !== 'function') {
    throw new Error('worker has to be a function');
  }

  this._queue.process(key, fn);
};

/**
 * Registers multiple workers at once. See registerWorker() for more infos.
 *
 * @param {Object} workers Object containing the workers.
 */
Runner.prototype.registerWorkers = function (workers) {
  var self = this;

  if (!workers) {
    throw new Error('workers may not be null');
  }

  Object.keys(workers).forEach(function (k) {
    var workerFn = workers[k];
    self.registerWorker(k, workerFn);
  });
};

/**
 * Export constructor of queue runner.
 *
 * @type {Function}
 */
module.exports = Runner;
