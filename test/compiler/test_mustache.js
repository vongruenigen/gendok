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

describe('gendok.compiler.mustache', function () {
  it('has compile function', function () {
    var compiler = new Compiler('mustache');
    expect(compiler.compile).to.exist;
    expect(compiler.compile).to.be.a('function');
  });

  describe('compile()', function () {
    it('returns the compiled tempalte', function (done) {
      var compiler = new Compiler('mustache');
      var template = '<h1>Hello {{name}}</h1>';
      var expected = '<h1>Hello Name</h1>';
      compiler.compile(template, {name: 'Name'}, function (err, rendered) {
        expect(rendered).to.eql(expected);
        done();
      });
    });
  });

  describe('getType()', function () {
    it('returns "mustache" as the type', function () {
      var compiler = new Compiler('mustache');
      expect(compiler.getType()).to.eql('mustache');
    });
  });
});
