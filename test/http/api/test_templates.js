/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var templatesApi = require('../../..').http.api.templates;
var Template = require('../../..').data.model.template;
var Config = require('../../..').config;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');

describe('gendok.http.api.templates', function () {
  it('is a function', function () {
    expect(templatesApi).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  helper.runHttpServer(this, [templatesApi]);

  describe('POST /api/templates/', function () {
    it('creates a template in the database', function (done) {
      factory.build('Template', function (err, templ) {
        request.post('/api/templates')
               .send(templ.toJSON())
               .end(function (err, res) {
                 expect(err).to.not.exist;
                 expect(res.statusCode).to.eql(201);

                 var createdAttrs = JSON.parse(res.body);

                 Template.findById(createdAttrs.id).then(function (err, templ) {
                   expect(err).to.not.exist;
                   expect(templ.id).to.eql(createdAttrs.id);
                   done();
                 });
               });
      });
    });

    it('returns the created template as JSON object');
  });
});
