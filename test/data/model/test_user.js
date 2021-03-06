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
var simple = require('simple-mock');

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
        var u = User.build({confirmationToken: 'my-fake-conf-token'});
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
        factory.create('User', function (err, u) {
          u.update({confirmationToken: 'abc123'}).then(function (u) {
            expect(err).to.not.exist;

            var jobsCounterBefore = queue.testMode.jobs.length;

            u.sendConfirmationMail(function (err) {
              expect(err).to.not.exist;
              expect(queue.testMode.jobs).to.be.of.length(jobsCounterBefore + 1);

              var mailAttrs = {
                confirmationLink: u.getConfirmationLink(),
                name: u.name
              };

              var htmlMail = util.renderView('emails/confirmation', mailAttrs);

              expect(queue.testMode.jobs.length).to.be.above(0);
              expect(queue.testMode.jobs.some(function (j) {
                return j.data.subject &&
                       j.data.to === u.email &&
                       j.data.html === htmlMail;
              })).to.be.true;

              done();
            });
          });
        });
      });
    });
  });

  describe('sendResetPasswordMail()', function () {
    describe('when a resetPasswordToken is set', function () {
      it('sends an email with a reset password link', function (done) {
        factory.create('User', function (err, u) {
          u.update({resetPasswordToken: 'abc123'}).then(function (u) {
            expect(err).to.not.exist;

            var jobsCounterBefore = queue.testMode.jobs.length;

            u.sendResetPasswordMail(function (err) {
              expect(err).to.not.exist;
              expect(queue.testMode.jobs).to.be.of.length(jobsCounterBefore + 1);

              var mailAttrs = {
                resetPasswordLink: u.getResetPasswordLink(),
                name: u.name
              };

              var htmlMail = util.renderView('emails/reset_password', mailAttrs);

              expect(queue.testMode.jobs.length).to.be.above(0);
              expect(queue.testMode.jobs.some(function (j) {
                return j.data.subject &&
                       j.data.to === u.email &&
                       j.data.html === htmlMail;
              })).to.be.true;

              done();
            });
          });
        });
      });
    });

    describe('when no resetPasswordToken is set', function () {
      it('returns an error and sends no email', function (done) {
        factory.create('User', function (err, u) {
          expect(err).to.not.exist;

          var jobsCounterBefore = queue.testMode.jobs.length;

          u.sendResetPasswordMail(function (err) {
            expect(err).to.exist;
            expect(queue.testMode.jobs).to.be.of.length(jobsCounterBefore);
            done();
          });
        });
      });
    });
  });

  describe('afterUpdate() hook', function () {
    describe('when the email changes', function () {
      it('sends a confirmation mail and clears the apiToken', function (done) {
        factory.create('User', function (err, u) {
          expect(err).to.not.exist;
          simple.mock(u, 'sendConfirmationMail').callOriginal();

          expect(err).to.not.exist;
          expect(u.apiToken).to.exist;
          expect(u.confirmationToken).to.not.exist;

          var newEmail = 'my-new-' + (new Date()).getTime() + '@gugus.com';

          u.update({email: newEmail}).then(function (u) {
            expect(u.apiToken).to.be.empty;
            expect(u.confirmationToken).to.be.not.empty;
            expect(u.sendConfirmationMail.callCount).to.eql(1);
            done();
          }).catch(done);
        });
      });
    });
  });

  describe('afterCreate() hook', function () {
    it('sends a confirmation e-mail', function (done) {
      var token = 'abc';

      factory.build('User', {confirmationToken: token}, function (err, u) {
        expect(err).to.not.exist;

        User.build(u.toJSON())
            .save()
            .then(function () {
              expect(queue.testMode.jobs.length).to.eql(1);
              expect(queue.testMode.jobs[0].type).to.eql('email');
              done();
            });
      });
    });
  });

  describe('getConfirmationLink()', function () {
    describe('when a confirmationToken is present', function () {
      it('returns a link to /api/profile/confirm?token=...', function () {
        factory.build('User', {confirmationToken: 'abc'}, function (err, u) {
          var expectedLink = format(
            'http://%s:%s/#/profile/confirm?token=%s',
            config.get('http_host'),
            config.get('http_port'),
            u.confirmationToken
          );

          expect(u.getConfirmationLink()).to.eql(expectedLink);
        });
      });
    });

    describe('when no confirmationToken is present', function () {
      it('returns null', function () {
        var u = User.build({confirmationToken: ''});
        expect(u.getConfirmationLink()).to.be.null;
      });
    });
  });

  describe('getResetPasswordLink()', function () {
    it('when a resetPasswordToken is set', function (done) {
      var token = 'abc123';

      factory.create('User', {resetPasswordToken: token}, function (err, u) {
        expect(err).to.not.exist;

        var expectedLink = format(
          'http://%s:%s/#/profile/reset-password?token=%s',
          config.get('http_host'),
          config.get('http_port'),
          u.resetPasswordToken
        );

        expect(u.getResetPasswordLink()).to.eql(expectedLink);
        done();
      });
    });

    describe('when no resetPasswordToken is set', function () {
      it('returns null', function (done) {
        factory.create('User', {resetPasswordToken: null}, function (err, u) {
          expect(err).to.not.exist;
          expect(u.getResetPasswordLink()).to.be.null;
          done();
        });
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

      it('error if password and passwordConfirmation is not set', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.password = '';
          usr.passwordConfirmation = '';
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
