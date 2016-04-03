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
  describe('validation', function () {
    describe('.email', function () {
      it('email address must have a valid format', function (done) {
        factory.create('User', function (err, usr) {
          expect(err).to.not.exist;
          usr.validate().then(function (err) {
            expect(err).to.not.exist;
          }).then (function () {
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
      // it('email adress has to be unique', function (done) {
      //   var values = {email: 'test@gendok.ch'}
      //   factory.build('User', values, function (err, usr) {
      //     expect(err).to.not.exist;
      //   }).then (function () {
      //     usr.validate().then(function (err) {
      //       expect(err).to.exist;
      //       done();
      //     });
      //   });
      // });
    });
  });
});
