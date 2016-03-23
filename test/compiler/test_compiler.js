/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendok = require('../..');
var Compiler = gendok.compiler.compiler;
var expect = require('chai').expect;

describe('gendok.compiler.compiler', function () {
  it('is a function', function () {
    expect(Compiler).to.be.a('function');
  });

  describe('constructor', function () {
    it('throws an error if a non-existing compiler type is supplied', function () {
      expect(function () {
        var compiler = new Compiler('bogus');
      }).to.throw(Error);
    });

    it('defaults to html if no type is specified', function () {
      var compiler = new Compiler();
      expect(compiler.getType()).to.eql('html');
    });
  });

  describe('getType()', function () {
    it('returns the type of the compiler', function () {
      var available = gendok.compiler.available;

      Object.keys(available).forEach(function (k) {
        var compiler = new Compiler(k);
        expect(compiler.getType()).to.eql(k);
      });
    });
  });

  describe('getAvailableCompilers()', function () {
    it('is a function', function () {
      var compiler = new Compiler();
      expect(compiler.getAvailableCompilers).to.be.a('function');
    });

    it('returns the object containing all available compilers', function () {
      var compiler = new Compiler();
      var available = gendok.compiler.available;
      
      expect(compiler.getAvailableCompilers()).to.eql(available);
    });
  });
});
