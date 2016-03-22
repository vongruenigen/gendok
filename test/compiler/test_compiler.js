/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Compiler = require('../..').compiler.compiler;
var expect = require('chai').expect;

describe('gendok.compiler.compiler', function () {
  it('is an object', function () {
    var compiler = new Compiler();
    expect(compiler).to.be.a('object');
  });

  describe('get available compilers', function () {
    it('is a function', function () {
      var compiler = new Compiler();
      expect(compiler.getAvailableCompilers).to.be.a('function');
    });
  });
});
