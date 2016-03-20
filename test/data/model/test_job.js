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
var Job = require('../../..').data.model.Job;
var expect = require('chai').expect;

describe('gendok.data.model.job', function () {
  var factory = helper.loadFactories(this);

  it('is a function', function () {
    expect(Job).to.be.a('function');
  });

  describe('the factory', function () {
    it('inserts a job into the db', function (done) {
      factory.create('Job', function (err, job) {
        expect(err).to.not.exist;
        expect(job).to.exist;
        done();
      });
    });
  });
});
