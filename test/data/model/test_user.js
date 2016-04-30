/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var helper = require('../../helper');
var db = require('../../..').data.db;
var config = require('../../..').config;
var util = require('../../..').util;
var expect = require('chai').expect;
var bcrypt = require('bcrypt');
var format = require('util').format;

describe('gendok.data.model.user', function () {
  var factory = helper.loadFactories(this);
  var queue = helper.createQueue(this);
  var User = null;

  beforeEach(function () {
    User = db.getModel('User');
  });

  it('is a object', function () {
    expect(User).to.be.a('object');
  });

  describe('the factory', function () {
    it('inserts a user into the db', function (done) {
      factory.create('User', function (err, user) {
        expect(err).to.not.exist;
        expect(user).to.exist;
        done();
      });
    });
  });

  describe('setter functions', function () {
    describe('.password', function () {
      it('updates salt and passwordHash', function () {
        var attrs = {
          password: 'asdfghjkkl',
          passwordConfirmation: 'asdfghjkkl'
        };

        var user = User.build(attrs);
        var expectedHash = bcrypt.hashSync(attrs.password, user.salt);
        expect(user.passwordHash).to.eql(expectedHash);
      });

      it('updates the password in the database', function (done) {
        factory.create('User', function (err, user) {
          var attrs = {
            password: 'new-testpassword',
            passwordConfirmation: 'new-testpassword'
          };

          expect(user.isPassword('testpassword')).to.be.true;

          user.update(attrs).then(function () {
            user.reload().then(function (u) {
              expect(u.isPassword(attrs.password)).to.be.true;
              done();
            });
          });
        });
      });
    });
  });

  describe('isPassword()', function () {
    describe('with a wrong password', function () {
      it('returns false', function (done) {
        factory.create('User', function (err, user) {
          expect(user.isPassword('wrongpassword!')).to.be.false;
          done();
        });
      });
    });

    describe('with correct password', function () {
      it('returns true', function (done) {
        factory.create('User', function (err, user) {
          expect(user.isPassword(user.password)).to.be.true;
          done();
        });
      });
    });
  });

  describe('.confirmationToken', function () {
    it('generates a token when a user is created', function () {
      var u = User.build();
      expect(u.confirmationToken).to.exist;
      expect(u.confirmationToken).to.be.of.length(64);
    });
  });

  describe('isConfirmed()', function () {
    describe('when a confirmationToken is present', function () {
      it('returns false', function () {
        var u = User.build();
        expect(u.isConfirmed()).to.be.false;
      });
    });

    describe('when no confirmationToken is present', function () {
      it('returns true', function () {
        var u = User.build({confirmationToken: ''});
        expect(u.isConfirmed()).to.be.true;
      });
    });
  });

  describe('sendConfirmationMail()', function () {
    describe('when isConfirmed() returns true', function () {
      it('sends no email', function (done) {
        var u = User.build({confirmationToken: ''});

        u.sendConfirmationMail(function (err) {
          expect(err).to.exist;
          expect(queue.testMode.jobs).to.be.empty;
          done();
        });
      });
    });

    describe('when isConfirmed() returns false', function () {
      it('it sends the confirmation mail', function (done) {
        factory.create('User', {confirmationToken: 'abc123'}, function (err, u) {
          expect(err).to.not.exist;

          u.sendConfirmationMail(function (err) {
            expect(err).to.not.exist;
            expect(queue.testMode.jobs).to.be.of.length(1);

            var mailAttrs = {
              confirmationLink: u.getConfirmationLink(),
              name: u.name
            };

            var job = queue.testMode.jobs[0];
            var htmlMail = util.renderView('emails/confirmation', mailAttrs);

            expect(job).to.exist;
            expect(job.data.subject).to.exist;
            expect(job.data.to).to.eql(u.email);
            expect(job.data.html).to.eql(htmlMail);

            done();
          });
        });
      });
    });
  });

  describe('getConfirmationLink()', function () {
    describe('when a confirmationToken is present', function () {
      it('returns a link to /api/profile/confirm?token=...', function () {
        var u = User.build();

        var expectedLink = format(
          'http://%s:%s/api/profile/confirm?token=%s',
          config.get('http_host'),
          config.get('http_port'),
          u.confirmationToken
        );

        expect(u.getConfirmationLink()).to.eql(expectedLink);
      });
    });

    describe('when no confirmationToken is present', function () {
      it('returns null', function () {
        var u = User.build({confirmationToken: ''});
        expect(u.getConfirmationLink()).to.be.null;
      });
    });
  });

  describe('validation', function () {
    describe('.password', function () {
      it('error if password differs to the confirmation', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.password = 'abc123456';
          usr.passwordConfirmation = 'abc123457';
          usr.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('password');
            done();
          });
        });
      });

      it('error if password comfirmation is set when password is empty', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.password = '';
          usr.passwordConfirmation = 'abc123456';
          usr.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(3);
            expect(err.errors[0].path).to.eql('passwordConfirmation');
            done();
          });
        });
      });

      it('error if length < 7', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.password = 'asdf';
          usr.passwordConfirmation = 'asdf';
          usr.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('password');
            done();
          });
        });
      });
    });

    describe('.email', function () {
      it('email address must have a valid format', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.validate().then(function (err) {
            expect(err).to.not.exist;
          }).then(function () {
            usr.email = 'xyz';
          }).then(function () {
            usr.validate().then(function (err) {
              expect(err).to.exist;
              expect(err.errors.length).to.eql(1);
              expect(err.errors[0].path).to.eql('email');
              done();
            });
          });
        });
      });

      it('has to be unique', function (done) {
        factory.create('User', function (err, usr1) {
          expect(err).to.not.exist;
          factory.build('User', function (err, usr2) {
            expect(err).to.not.exist;
            usr2.email = usr1.email;
            usr2.validate().then(function (err) {
              expect(err).to.exist;
              done();
            });
          });
        });
      });
    });
  });
});
