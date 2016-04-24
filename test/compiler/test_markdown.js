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

describe('gendok.compiler.markdown', function () {
  it('has compile function', function () {
    var compiler = new Compiler('markdown');
    expect(compiler.compile).to.exist;
    expect(compiler.compile).to.be.a('function');
  });

  describe('compile()', function () {
    it('returns the compiled template', function (done) {
      var compiler = new Compiler('markdown');
      var template = '# Hello Markdown!';
      var expected = '<h1>Hello Markdown!</h1>';
      compiler.compile(template, {}, function (err, rendered) {
        expect(rendered).to.eql(expected);
        done();
      });
    });
  });

  describe('getType()', function () {
    it('returns "markdown" as the type', function () {
      var compiler = new Compiler('markdown');
      expect(compiler.getType()).to.eql('markdown');
    });
  });
});
