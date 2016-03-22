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

  describe('get compilers', function () {
    it('is a function', function () {
      var compiler = new Compiler();
      expect(compiler.getCompilers).to.be.a('function');
    });

    it('noop has compile function', function () {
      var compiler = new Compiler('noop');
      expect(compiler.compile).to.exist;
      expect(compiler.compile).to.be.a('function');
    });

    it('mustache has compile function', function () {
      var compiler = new Compiler('mustache');
      expect(compiler.compile).to.exist;
      expect(compiler.compile).to.be.a('function');
    });
  });
});
