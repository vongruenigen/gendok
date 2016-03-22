/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var noop = require('./noop');
var mustache = require('./mustache');

function Compiler(type){
  this.type = type || 'noop';
  this.compile = this.getCompilers()[type].compile;
}

Compiler.prototype.getCompilers = function(){
  return {
    noop:     noop,
    mustache: mustache
  };
};

module.exports = Compiler;
