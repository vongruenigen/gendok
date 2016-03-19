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
        expect(token).to.be.of.length(i*2);
        expect(token).to.match(/^[a-z0-9]+$/);
      }
    });

    it('defaults to the length 8', function () {
      expect(util.randomToken()).to.be.of.length(8);
    });
  });
});
