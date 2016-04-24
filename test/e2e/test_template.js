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
var format = require('util').format;

describe('templates', function () {
  var factory = helper.loadFactories(this);
  helper.runHttpServer(this);

  var Template = null;
  var user = null;
  var tmpl = null;

  var name = element(by.model('template.name'));
  var type = element(by.model('template.type'));
  var body = element(by.model('template.body'));
  var list = element.all(by.repeater('template in templates'));
  var saveButton = $('[ng-click="create()"]');
  var errorMessage = $('.alert');

  beforeEach(function (done) {
    Template = gendok.data.db.getModel('Template');

    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        expect(err).to.not.exist;
        user = u;

        factory.build('Template', function (err, t) {
          expect(err).to.not.exist;
          tmpl = t;
          authHelper.signin(user, done);
        });
      });
    });
  });

  describe('#/templates/create', function () {
    describe('when a valid input is given', function () {
      it('creates a template', function () {
        expect(Template.truncate()).to.eventually.be.truthy;

        stateHelper.go('templateCreate');

        name.clear();
        name.sendKeys(tmpl.name);

        type.$(format('[value="%s"]', tmpl.type)).click();

        body.clear();
        body.sendKeys(tmpl.body);

        saveButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('templateViewUpdate');
          expect(Template.count()).to.eventually.eql(1);
        });
      });
    });

    describe('when invalid values are given', function () {
      it('displays errors', function () {
        stateHelper.go('templateCreate');
        saveButton.click();

        expect(errorMessage.getInnerHtml()).to.eventually.eql(
          'An error occured while saving the template.'
        );

        expect(body.getCssValue('border-bottom-color')).to.eventually.eql(
          'rgba(255, 0, 0, 1)' // === 'red'
        );
      });
    });
  });
});
