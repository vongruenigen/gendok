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

describe('users', function () {
  var factory = helper.loadFactories(this);
  helper.runHttpServer(this);

  var User = null;
  var admin = null;
  var user = null;
  var userCreate = null;

  var name = element(by.model('user.name'));
  var email = element(by.model('user.email'));
  var isAdmin = element(by.model('user.isAdmin'));
  var password = element(by.model('user.password'));
  var passwordConfirmation = element(by.model('user.passwordConfirmation'));
  var list = element.all(by.repeater('user in users'));
  var userDetail = $('.user-detail-list');
  var editUserForm = $('.edit-user-form');
  var saveButton = $('[ng-click="create()"]');
  var updateButton = $('[ng-click="update()"]');
  var editButton = $('[ng-click="edit()"]');
  var cancelButton = $('[ng-click="reset()"]');
  var errorMessage = $('.alert-danger');
  var successMessage = $('.alert-success');

  beforeEach(function (done) {
    User = gendok.data.db.getModel('User');
    expect(User.truncate()).to.eventually.be.truthy;

    authHelper.signout(function () {
      factory.create('User', {isAdmin: true}, function (err, u) {
        expect(err).to.not.exist;
        admin = u;

        factory.build('User', function (err, u) {
          expect(err).to.not.exist;
          user = u;

          factory.create('User', function (err, u) {
            expect(err).to.not.exist;
            userCreate = u;

            authHelper.signin(admin, done);
          });
        });
      });
    });
  });

  describe('#/users/create', function () {
    describe('when a valid input is given', function () {
      it('creates a user', function () {

        stateHelper.go('userCreate');

        name.clear();
        name.sendKeys(user.name);

        email.clear();
        email.sendKeys(user.email);

        password.clear();
        password.sendKeys(user.password);

        passwordConfirmation.clear();
        passwordConfirmation.sendKeys(user.passwordConfirmation);

        saveButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('userViewUpdate');
          expect(User.count()).to.eventually.eql(3);
        });
      });
    });

    describe('when invalid values are given', function () {
      it('displays errors', function () {
        stateHelper.go('userCreate');
        saveButton.click();

        expect(errorMessage.getInnerHtml()).to.eventually.eql(
          'An error occured while saving the user.'
        );

        expect(name.getCssValue('border-bottom-color')).to.eventually.eql(
          'rgba(255, 0, 0, 1)' // === 'red'
        );
      });
    });
  });

  describe('PUT #/users/{id}', function () {
    describe('when valid inputs are given', function () {
      it('updates a user', function () {
        stateHelper.go('userViewUpdate', {userId: userCreate.id});

        editButton.click();

        name.clear();
        name.sendKeys('new ' + user.name);

        updateButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('userViewUpdate');
          expect(userDetail.isPresent()).to.eventually.eql(true);
          expect(editUserForm.isPresent()).to.eventually.eql(false);
          expect(successMessage.getInnerHtml()).to.eventually.eql(
           'User new ' + user.name + ' successfully updated!'
          );
        });
      });
    });

    describe('when invalid values are given', function () {
      it('displays errors', function () {
        stateHelper.go('userViewUpdate', {userId: userCreate.id});

        editButton.click();

        name.clear();
        name.sendKeys('');

        email.clear();
        email.sendKeys('');

        updateButton.click();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('userViewUpdate');
          expect(userDetail.isPresent()).to.eventually.eql(false);
          expect(editUserForm.isPresent()).to.eventually.eql(true);
          expect(errorMessage.getInnerHtml()).to.eventually.eql(
           'An error occured while updating the user.'
          );
        });

        cancelButton.click();

        browser.waitForAngular().then(function () {
          expect(errorMessage.isPresent()).to.eventually.eql(false);
          expect(userDetail.isPresent()).to.eventually.eql(true);
          expect(editUserForm.isPresent()).to.eventually.eql(false);
        });
      });
    });
  });

  describe('GET #/users/{id}', function () {
    describe('when a valid id is given', function () {
      it('displays the user', function () {
        user.save(function () {
          stateHelper.go('usersList');

          var link = list.first().all(by.css('a'));
          link.click();

          browser.waitForAngular();

          expect(stateHelper.current()).to.eventually.eql('userViewUpdate');
          expect(name.getInnerHtml()).to.eventually.eql(user.name);
          expect(email.getInnerHtml()).to.eventually.eql(user.email);
          expect(isAdmin.getInnerHtml()).to.eventually.eql(user.isAdmin);
        });
      });
    });

    describe('when an invalid id is given', function () {
      it('displays the 404 page', function () {
        browser.get('#users/98989');

        browser.waitForAngular();

        expect(stateHelper.current()).to.eventually.eql('notFound');
      });
    });
  });

  describe('DELETE #/users', function () {
    describe('Accept delete confirmation', function () {
      it('deletes the user', function () {

        stateHelper.go('usersList');

        var link = list.first().all(by.css('button'));
        link.click();

        browser.switchTo().alert().accept();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('usersList');
          expect(successMessage.getInnerHtml()).to.eventually.eql(
           'The user was successfully deleted!'
          );
          expect(User.count()).to.eventually.eql(1);
        });
      });
    });

    describe('Abort delete confirmation', function () {
      it('does not deletes the user', function () {

        stateHelper.go('usersList');

        var link = list.first().all(by.css('button'));
        link.click();

        browser.switchTo().alert().dismiss();

        browser.waitForAngular().then(function () {
          expect(stateHelper.current()).to.eventually.eql('usersList');
          var success = element(by.css('.successMessage'));
          var error = element(by.css('.errorMessage'));
          expect(success.isPresent()).to.eventually.eql(false);
          expect(error.isPresent()).to.eventually.eql(false);
          expect(User.count()).to.eventually.eql(2);
        });
      });
    });
  });
});
