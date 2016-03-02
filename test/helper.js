var logger = require('..').logger;
    crypto = require('crypto'),
    path   = require('path');

// Default config for all tests
const DEFAULT_CONFIG = {
  database: 'gendok_test',
  username: 'gendok_test',
  password: 'gendok_test',
  storage:  ':memory:',
  dialect:  'sqlite'
};

/**
 * Exports some utility functions
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Noop function.
   */
  noop: function () {},

  /**
   * Generates a random token and returns it as a string.
   *
   * @return {String}
   */
  randomToken: function () {
    return crypto.randomBytes(64).toString('hex');
  },

  /**
   * Returns the default config for test runs.
   *
   * @return {Object} The default config.
   */
  getDefaultConfig: function () {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  },

  /**
   * Calls the supplied cb and applying all props set in the env object. After
   * the callback has finished, the environment will be reset to previous state.
   *
   * @param {Object} env
   * @param {Function} cb
   */
  withEnv: function (env, cb) {
    var keys = Object.keys(env),
        curr = {};

    if (keys.length === 0) { cb(); }

    // Sets the variables defined in the process.env object
    var overwriteEnv = function (obj) {
      Object.keys(obj).forEach(function (k) {
        curr[k] = process.env[k]; // For restore
        process.env[k] = obj[k];
      });
    };

    try {
      overwriteEnv(env);
      (cb || this.noop)();
      overwriteEnv(curr);
    } catch (err) {
      overwriteEnv(curr);
      logger.error('Error while setting environment: %s', err);
      throw err;
    }
  },

  /**
   * Convenience method to set the GENDOK_ENV value in process.env.
   *
   * @param {String}   env
   * @param {Function} cb
   */
  withGendokEnv: function (env, cb) {
    this.withEnv({'GENDOK_ENV': env}, cb);
  },

  /**
   * Shuffles the supplied array and returns it.
   *
   * @param  {Array} arr
   * @return {Array}
   */
  shuffle: function (arr) {
    // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    for(var j, x, i = arr.length; i;
        j = Math.floor(Math.random() * i),
        x = arr[--i], arr[i] = arr[j], arr[j] = x) {}

    return arr;
  },
};
