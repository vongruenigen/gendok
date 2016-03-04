/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var logger = require('..').logger;
var crypto = require('crypto');
var path = require('path');

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
   * Sets the given options as environment variables.
   *
   * @param {Object} env
   * @param {Function} cb
   */
  withEnv: function (env, cb) {
    var keys = Object.keys(env);
    var curr = {};
    var overwriteEnv;

    if (keys.length === 0) { cb(); }

    // Sets the variables defined in the process.env object
    overwriteEnv = function (obj) {
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
   * Shuffles the supplied array and returns it. Source:
   * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
   *
   * @param  {Array} arr
   * @return {Array}
   */
  shuffle: function (arr) {
    var counter = arr.length;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      var index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  },
};
