/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var util = require('../').util;
var Config = require('../').config;
var env = require('../').env;
var expect = require('chai').expect;
var os = require('os');
var fs = require('fs');

describe('gendok.util', function () {
  it('is an object', function () {
    expect(util).to.be.an('object');
  });

  describe('randomFile()', function () {
    it('creates a temporary file in os.tmpdir()', function (done) {
      util.randomFile(function (ws) {
        expect(ws).to.exist;
        expect(ws.path).to.include(os.tmpdir());

        fs.access(ws.path, fs.W_OK | fs.R_OK, function (err) {
          if (err) {
            return done(err);
          }

          ws.close(done);
        });
      });
    });
  });

  describe('randomToken()', function () {
    it('returns a random token of the the specified length', function () {
      for (var i = 1; i < 255; i++) {
        var token = util.randomToken(i);
        expect(token).to.be.of.length(i * 2);
        expect(token).to.match(/^[a-z0-9]+$/);
      }
    });

    it('defaults to the length 8', function () {
      expect(util.randomToken()).to.be.of.length(8);
    });
  });

  describe('addCssToHtml()', function () {
    it('adds the given css within the <head> element', function () {
      var htmlTmpl = '<html><head>%%</head><body><h1>gendok</h1></body></html>';
      var html = htmlTmpl.replace('%%', '');
      var css = 'h1 { color: green; }';
      var expected = htmlTmpl.replace('%%', '<style>' + css + '</style>');

      expect(util.addCssToHtml(html, css)).to.eql(expected);
    });
  });

  describe('createQueue()', function () {
    var config = Config.getDefault();

    it('creates a new queue with the given config', function () {
      var queue = util.createQueue(config);
      expect(queue).to.exist;
    });

    it('sets the prefix to gendok_$ENV', function () {
      var queue = util.createQueue(config);
      expect(queue.client.prefix).to.eql('gendok_' + env.get());
    });
  });
});
