/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var expect = require('chai').expect;
var gendok = require('../../');
var helper = require('../helper');
var stateHelper = require('./helpers/state_helper');
var authHelper = require('./helpers/auth_helper');

describe('templates', function () {
  var factory = helper.loadFactories(this);
  helper.runHttpServer(this);

  var user = null; // set in beforeEach

  var name   = element(by.model('template.name'));
  var type   = element(by.model('template.type'));
  var body   = element(by.model('template.body'));
  var list   = element.all(by.repeater('template in templates'));
  var saveButton    = $('[ng-click="create()"]');

  beforeEach(function (done) {
    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        user = u;
        authHelper.signin(user, function () {
          done(err);
        });
      });
    });
  });

  describe('create', function () {
    describe('when a valid input is given', function () {
      it('create a template', function (done) {
        stateHelper.go('templateCreate');
        factory.build('Template', function (err, template) {
          name.clear();
          name.sendKeys(template.name);

          type.clear();
          type.sendKeys(template.type);

          body.clear();
          body.sendKeys(template.body);

          saveButton.click();

          expect(stateHelper.current()).to.eventually.eql('templateViewUpdate');
          done();
        });
      });
    });
  });
});
