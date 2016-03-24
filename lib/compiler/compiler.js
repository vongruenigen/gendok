/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var available = require('./available/');

/**
 * Acts as a wrapper around the specific compilers liste in available/index.js.
 * It uses the type to choose which compiler should be used for the actual
 * compilation. An error is thrown ff a type is specified which does not exist.
 *
 * @param {String} type The type for the compiler.
 */
function Compiler(type) {
  this.type = type || 'html';

  var availableCompilers = this.getAvailableCompilers();

  // Check if a compiler for the given type exists
  if (!availableCompilers[this.type]) {
    throw new Error('invalid compiler type ' + this.type);
  }

  this.compile = availableCompilers[this.type].compile;
  this.getType = availableCompilers[this.type].getType;
}

/**
 * Returns the object containing the available compilers.
 *
 * @return {Object} The object containing all available compilers
 */
Compiler.prototype.getAvailableCompilers = function () {
  return available;
};

module.exports = Compiler;
