/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var user = require('../../..').data.model.user;
var factory = require('../factories/').user;
var expect = require('chai').expect;

describe('gendok.data.model.user', function () {
  it('is a function', function () {
    expect(user).to.be.a('function');
  });

  it('insert into db', function (done) {
    factory.build('user', function(err, user) {
      user.save().then(function() {
        expect(this).to.exist;
        done();
      });
    });
  });
});
