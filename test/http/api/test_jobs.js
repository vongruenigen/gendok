/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendokHttp = require('../../..').http;
var jobsApi = gendokHttp.api.jobs;
var basicMiddleware = gendokHttp.middleware.basic;
var authMiddleware = gendokHttp.middleware.authorization;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var Template = require('../../..').data.model.Template;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var format = require('util').format;

describe('gendok.http.api.jobs', function () {
  var factory = helper.loadFactories(this);
  var middleware = [basicMiddleware, authMiddleware, jobsApi];
  var server = helper.runHttpServer(this, middleware);
  var config = server.getConfig();
  var url = format('%s:%d/api/jobs',
                  config.get('http_host'), config.get('http_port'));
  var Job = null;

  beforeEach(function () {
    Job = db.getModel('Job');
  });

  it('is a function', function () {
    expect(jobsApi).to.be.a('function');
  });

  describe('POST /api/jobs/:id', function () {
    it('returns the state of the given job', function () {
      // TODO: Implement test-case 'returns the state of the given job'
    });

    it('returns an error if an invalid jobId is posted', function () {
      // TODO: Implement test-case 'returns an error if an invalid jobId is posted'
    });
  });

  describe('POST /api/jobs/:id/download', function () {
    it('returns the resulting pdf of the given job', function () {
      // TODO: Implement test-case 'returns the resulting pdf of the given job'
    });

    it('returns an error if the job state is not finished', function () {
      // TODO: Implement test-case 'returns an error if the job state is not finished'
    });
  });
});
