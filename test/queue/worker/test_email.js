/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendok = require('../../../');
var config = require('../../../lib/config');
var email = require('../../../lib/queue/worker/email');
var expect = require('chai').expect;

describe('gendok.queue.worker.email', function () {
  it('is a function', function (done) {
    expect(email).to.be.a('function');
    done();
  });

  describe('returns an error if there are missing parameters', function () {
    it('"to" is missing', function (done) {
      var data = {
        subject: 'Blubb',
        html: '<b>This is an email</b>'
      };

      email(data, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('"subject" is missing', function (done) {
      var data = {
        to: 'blubb@gendok.ch',
        html: '<b>This is an email</b>'
      };

      email(data, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('"html" is missing', function (done) {
      var data = {
        to: 'blubb@gendok.ch',
        subject: 'Blubb',
      };

      email(data, function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });

  it('should send an email with the specified options');

  it('should not send an email if there is an error');

  it('should use the SMTP credentials specified in the config');
});
