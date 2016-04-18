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
var util = gendok.util;
var email = require('../../../lib/queue/worker/email');
var expect = require('chai').expect;
var mockTransport = require('nodemailer-mock-transport');

describe('gendok.queue.worker.email', function () {
  var transport = null;

  beforeEach(function () {
    transport = mockTransport();
    util.createMailer(transport, true);
  });

  it('is a function', function (done) {
    expect(email).to.be.a('function');
    done();
  });

  describe('returns an error if there are missing options', function () {
    it('"to" is missing', function (done) {
      var data = {data: {
        subject: 'Blubb',
        html: '<b>This is an email</b>'
      }};

      email(data, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('"subject" is missing', function (done) {
      var data = {data: {
        to: 'blubb@gendok.ch',
        html: '<b>This is an email</b>'
      }};

      email(data, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('"html" is missing', function (done) {
      var data = {data: {
        to: 'blubb@gendok.ch',
        subject: 'Blubb',
      }};

      email(data, function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });

  it('sends an email according to options', function (done) {
    var data = {data: {
      to: 'blubb@gendok.ch',
      subject: 'Blubb',
      html: '<b>This is an email</b>'
    }};

    email(data, function (err) {
      expect(err).to.not.exist;
      expect(transport.sentMail.length).to.eql(1);
      expect(transport.sentMail[0].data.to).to.eql(data.data.to);
      expect(transport.sentMail[0].data.subject).to.eql(data.data.subject);
      expect(transport.sentMail[0].message.content).to.eql(data.data.html);
      done();
    });
  });

  it('doesn\'t send an email if there is an error', function (done) {
    var data = {data: {
      to: 'blubb@gendok.ch',
      subject: 'Blubb',
    }};

    email(data, function (err) {
      expect(err).to.exist;
      expect(transport.sentMail.length).to.eql(0);
      done();
    });
  });
});
