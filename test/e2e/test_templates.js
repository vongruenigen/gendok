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
  var paperFormat = element(by.model('template.paperFormat'));
  var paperMargin = element(by.model('template.paperMargin'));
  var headerHeight = element(by.model('template.headerHeight'));
  var footerHeight = element(by.model('template.footerHeight'));
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

  describe('GET #/templates/{id}', function () {
    describe('when a valid id is given', function () {
      it('displays the template', function () {
        tmpl.save(function () {
          stateHelper.go('templatesList');

          var link = list.first().all(by.css('a'));
          link.click();

          browser.waitForAngular();

          expect(stateHelper.current()).to.eventually.eql('templateViewUpdate');
          expect(name.getInnerHtml()).to.eventually.eql(tmpl.name);
          expect(type.getInnerHtml()).to.eventually.eql(tmpl.type);
          expect(body.getInnerHtml()).to.eventually.eql(tmpl.body);
          expect(paperFormat.getInnerHtml()).to.eventually.eql(tmpl.paperFormat);
          expect(paperMargin.getInnerHtml()).to.eventually.eql(tmpl.paperMargin);
          expect(headerHeight.getInnerHtml()).to.eventually.eql(tmpl.headerHeight);
          expect(footerHeight.getInnerHtml()).to.eventually.eql(tmpl.footerHeight);
        });
      });
    });

    describe('when an invalid id is given', function () {
      it('displays the 404 page', function () {
        browser.get('#templates/98329');

        browser.waitForAngular();

        expect(stateHelper.current()).to.eventually.eql('notFound');
      });
    });
  });
});
