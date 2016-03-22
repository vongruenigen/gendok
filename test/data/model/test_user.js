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

  it('is a function', function () {
    expect(User).to.be.a('function');
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
});
