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
var expect = require('chai').expect;
var bcrypt = require('bcrypt');

describe('gendok.data.model.user', function () {
  var factory = helper.loadFactories(this);
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

  describe('defaults', function () {
    it('automatically generates an apiToken', function () {
      var u = User.build();
      expect(u.apiToken).to.not.be.empty;
    });
  });

  describe('setter functions', function () {
    describe('.password', function () {
      it('updates salt and passwordHash', function () {
        var password = 'asdfghjkkl';
        var user = User.build({password: password});
        var expectedHash = bcrypt.hashSync(password, user.salt);
        expect(user.passwordHash).to.eql(expectedHash);
      });
    });
  });

  describe('validation', function () {
    describe('.password', function () {
      it('error if length < 7', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.password = 'asdf';
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

      it('email adress has to be unique', function (done) {
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
