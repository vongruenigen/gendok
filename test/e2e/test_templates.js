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
  var tmplCreate = null;

  var name = element(by.model('template.name'));
  var type = element(by.model('template.type'));
  var body = element(by.model('template.body'));
  var payload = element(by.model('payload'));
  var paperFormat = element(by.model('template.paperFormat'));
  var paperMargin = element(by.model('template.paperMargin'));
  var headerHeight = element(by.model('template.headerHeight'));
  var footerHeight = element(by.model('template.footerHeight'));
  var list = element.all(by.repeater('template in templates'));
  var templateDetail = $('.template-detail-list');
  var editPayloadForm = $('.edit-payload-form');
  var editTemplateForm = $('.edit-template-form');
  var saveButton = $('[ng-click="create()"]');
  var updateButton = $('[ng-click="update()"]');
  var editButton = $('[ng-click="edit()"]');
  var cancelButton = $('[ng-click="reset()"]');
  var previewButton = $('[ng-click="openPayloadOptions()"]');
  var renderButton = $('[ng-click="render(template, payload)"]');
  var errorMessage = $('.alert-danger');
  var successMessage = $('.alert-success');

  beforeEach(function (done) {
    Template = gendok.data.db.getModel('Template');
    expect(Template.truncate()).to.eventually.be.truthy;

    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        expect(err).to.not.exist;
        user = u;

        factory.build('Template', function (err, t) {
          expect(err).to.not.exist;
          tmpl = t;
          factory.create('Template', {userId: user.id}, function (err, t) {
            expect(err).to.not.exist;
            tmplCreate = t;

            authHelper.signin(user, done);
          });
        });
      });
    });
  });

  describe('#/templates/create', function () {
    describe('when a valid input is given', function () {
      it('creates a template', function () {

        stateHelper.go('templateCreate');

        name.clear();
        name.sendKeys(tmpl.name);

        type.$(format('[value="%s"]', tmpl.type)).click();

        body.clear();
        body.sendKeys(tmpl.body);

        saveButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('templateViewUpdate');
          expect(Template.count()).to.eventually.eql(2);
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

  describe('PUT #/templates/{id}', function () {
    describe('when valid inputs are given', function () {
      it('updates a template', function () {
        stateHelper.go('templateViewUpdate', {templateId: tmplCreate.id});

        editButton.click();

        name.clear();
        name.sendKeys('new ' + tmpl.name);

        body.clear();
        body.sendKeys(tmpl.body);

        updateButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('templateViewUpdate');
          expect(templateDetail.isPresent()).to.eventually.eql(true);
          expect(editTemplateForm.isPresent()).to.eventually.eql(false);
          expect(successMessage.getInnerHtml()).to.eventually.eql(
           'Template new ' + tmpl.name + ' successfully updated!'
          );
        });
      });
    });

    describe('when invalid values are given', function () {
      it('displays errors', function () {
        stateHelper.go('templateViewUpdate', {templateId: tmplCreate.id});

        editButton.click();

        name.clear();
        name.sendKeys('');

        body.clear();
        body.sendKeys('');

        updateButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('templateViewUpdate');
          expect(templateDetail.isPresent()).to.eventually.eql(false);
          expect(editTemplateForm.isPresent()).to.eventually.eql(true);
          expect(errorMessage.getInnerHtml()).to.eventually.eql(
           'An error occured while updating the template.'
          );
        });

        cancelButton.click();

        browser.waitForAngular().then(function () {
          expect(errorMessage.isPresent()).to.eventually.eql(false);
          expect(templateDetail.isPresent()).to.eventually.eql(true);
          expect(editTemplateForm.isPresent()).to.eventually.eql(false);
        });
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

  describe('DELETE #/templates', function () {
    describe('Accept delete confirmation', function () {
      it('deletes the template', function () {

        stateHelper.go('templatesList');

        var link = list.first().all(by.css('button'));
        link.click();

        browser.switchTo().alert().accept();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('templatesList');
          expect(successMessage.getInnerHtml()).to.eventually.eql(
           'The template was successfully deleted!'
          );
          expect(Template.count()).to.eventually.eql(0);
        });
      });
    });

    describe('Abort delete confirmation', function () {
      it('deletes not the template', function () {

        stateHelper.go('templatesList');

        var link = list.first().all(by.css('button'));
        link.click();

        browser.switchTo().alert().dismiss();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('templatesList');
          var success = element(by.css('.successMessage'));
          var error = element(by.css('.errorMessage'));
          expect(success.isPresent()).to.eventually.eql(false);
          expect(error.isPresent()).to.eventually.eql(false);
          expect(Template.count()).to.eventually.eql(1);
        });
      });
    });
  });

  describe('POST #/templates/{id}/render', function () {
    describe('when a invalid payload is given', function () {
      it('display an error', function () {
        stateHelper.go('templateViewUpdate', {templateId: tmplCreate.id});
        previewButton.click();
        browser.waitForAngular();

        expect(editPayloadForm.isPresent()).to.eventually.eql(true);

        payload.sendKeys('not json');
        renderButton.click();

        expect(errorMessage.getInnerHtml()).to.eventually.eql('The payload isn\'t valid json.');

        cancelButton.click();

        browser.waitForAngular().then(function () {
          expect(errorMessage.isPresent()).to.eventually.eql(false);
          expect(templateDetail.isPresent()).to.eventually.eql(true);
          expect(editPayloadForm.isPresent()).to.eventually.eql(false);
        });
      });
    });

    /*describe('when a valid payload is given', function () {
      it('display the rendered pdf', function () {
        stateHelper.go('templateViewUpdate', {templateId: tmplCreate.id});
        previewButton.click();
        browser.waitForAngular();
        payload.sendKeys('{}');
        renderButton.click();

        browser.sleep(10000);
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.eql('url');
      });
    });*/
  });
});
