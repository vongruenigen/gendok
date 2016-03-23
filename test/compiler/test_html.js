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

describe('gendok.compiler.html', function () {
  it('has compile function', function () {
    var compiler = new Compiler('html');
    expect(compiler.compile).to.exist;
    expect(compiler.compile).to.be.a('function');
  });

  describe('compile()', function () {
    it('returns the compiled tempalte', function (done) {
      var compiler = new Compiler('html');
      var template = '<h1>Hello {{name}}</h1>';
      compiler.compile(template, {}, function (err, rendered) {
        expect(rendered).to.eql(template);
        done();
      });
    });
  });

  describe('getType()', function () {
    it('returns "html" as the type', function () {
      var compiler = new Compiler('html');
      expect(compiler.getType()).to.eql('html');
    });
  });
});
