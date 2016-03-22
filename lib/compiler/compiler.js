/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

function Compiler(type) {
  if (typeof type === 'undefined') {
    type = 'html';
  }else {
    this.type = type;
  }

  this.compile = this.getAvailableCompilers()[type].compile;
}

Compiler.prototype.getAvailableCompilers = function () {
  return require('./available/');
};

module.exports = Compiler;
