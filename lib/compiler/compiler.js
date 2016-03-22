/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var noop = require('./noop').noop;
var mustache = require('./mustache').mustache;

function Compiler(type){
  if (typeof type === 'undefined') {
    type = 'noop';
  }else{
    this.type = type;
  }
  this.compile = this.getCompilers()[type].compile;
}

Compiler.prototype.getCompilers = function(){
  return {
    noop:     noop,
    mustache: mustache
  };
};

module.exports = Compiler;
