/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

const VALID_ENVS = ['development', 'production', 'test'];

/**
 * Object containing helper methods for getting the current running
 * environment through the 'GENDOK_ENV' environment variable.
 *
 * @type {Object}
 */
module.exports = {
  /**
   * List of all valid environments as strings.
   *
   * @type {Array}
   */
  getValidEnvs: function () {
    return VALID_ENVS.slice();
  },

  /**
   * Returns the running environment as a string.
   *
   * @return {String}
   */
  get: function () {
    var env = (process.env.GENDOK_ENV || 'development').toLowerCase();
    return this.getValidEnvs().indexOf(env) === -1 ? 'development' : env;
  },

  /**
   * Sets the running environment. An error will be thrown if the environment
   * is invalid.
   */
  set: function (env) {
    if (this.getValidEnvs().indexOf(env) === -1) {
      throw new Error('"%s" is not a valid running environment');
    }

    process.env.GENDOK_ENV = env;
  },

  /**
   * Returns true if the supplied env param equals the return value of get().
   *
   * @param  {String} env
   * @return {Boolean}
   */
  is: function (env) {
    return (env || '').toLowerCase() === this.get();
  }
};
