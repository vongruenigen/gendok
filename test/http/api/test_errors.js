
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
var templates = gendokHttp.api.templates;
var all = gendokHttp.middleware.all;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var simple = require('simple-mock');
var format = require('util').format;

describe('gendok.http.api.errors', function () {
  var factory = helper.loadFactories(this);
  var server = helper.runHttpServer(this, [all, templates]);
  var config = server.getConfig();
  var url = format('%s:%d/api/templates',
                   config.get('http_host'), config.get('http_port'));
  var Template = null;
  var Job = null;

  describe('generate error data', function () {
    it('generate useful error data for validation errors', function (done) {
      var ValidationErrorItem = db.getConnection().sequelize.ValidationErrorItem;
      var ValidationError = db.getConnection().sequelize.ValidationError;
      var message = 'Type blub is not available';
      var path = 'type';
      var type = '';
      var value = '';
      var validationErrorItem = new ValidationErrorItem(message, type, path, value);
      var validationError = new ValidationError(message, [validationErrorItem]);
      var originalError = { error: 'validation errors',
                  validationErrors: { type: ['Type blub is not available'] } };
      var generatedError = errors.validation.data.generateData(validationError);
      expect(originalError).to.eql(generatedError);
      done();
    });
  });
});
