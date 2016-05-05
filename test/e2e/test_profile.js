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

describe('profile edit', function () {
  var factory = helper.loadFactories(this);
  helper.runHttpServer(this);

  var user = null; // set in beforeEach

  var name = element(by.model('profile.name'));
  var email = element(by.model('profile.email'));
  var password = element(by.model('profile.password'));
  var passwordConfirmation = element(by.model('profile.passwordConfirmation'));

  var editButton = $('[ng-click="edit()"]');
  var saveButton = $('[ng-click="update(profile)"]');
  var errorMessage = $('.alert');

  beforeEach(function (done) {
    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        expect(err).to.not.exist;
        user = u;

        authHelper.signin(user, done);
      });
    });
  });

  describe('#/profile', function () {
    describe('when a valid input is given', function () {
      it('updates the profile', function (done) {
        var attrs = {
          name: 'blubb',
          email: 'test@blubb.com',
          password: 'abc123456',
          passwordConfirmation: 'abc123456'
        };

        stateHelper.go('profile');

        editButton.click();

        name.clear();
        name.sendKeys(attrs.name);

        email.clear();
        email.sendKeys(attrs.email);

        password.clear();
        password.sendKeys(attrs.password);

        passwordConfirmation.clear();
        passwordConfirmation.sendKeys(attrs.passwordConfirmation);

        saveButton.click().then(function () {
          browser.waitForAngular().then(function () {
            user.reload().then(function (user) {
              expect(user.name).to.be.eql(attrs.name);
              expect(user.email).to.be.eql(attrs.email);
              expect(user.isPassword(attrs.password)).to.be.true;
              expect(stateHelper.current()).to.eventually.eql('home');

              done();
            });
          });
        });
      });
    });

    describe('when no name is given', function () {
      it('displays errors', function () {
        stateHelper.go('profile');

        editButton.click();
        name.clear();
        saveButton.click();

        expect(errorMessage.getInnerHtml()).to.eventually.eql(
          'Error while saving your profile.'
        );

        expect(name.getCssValue('border-bottom-color')).to.eventually.eql(
         'rgba(255, 0, 0, 1)' // === 'red'
        );
      });
    });

    describe('when an invalid email is given', function () {
      describe('when no email is given', function () {
        it('displays errors', function () {
          stateHelper.go('profile');

          editButton.click();
          email.clear();
          saveButton.click();

          expect(errorMessage.getInnerHtml()).to.eventually.eql(
            'Error while saving your profile.'
          );

          expect(email.getCssValue('border-bottom-color')).to.eventually.eql(
           'rgba(255, 0, 0, 1)' // === 'red'
          );
        });
      });

      describe('when an incorrect email is given', function () {
        it('displays errors', function () {
          stateHelper.go('profile');

          editButton.click();
          email.clear();
          email.sendKeys('test');
          saveButton.click();

          expect(errorMessage.getInnerHtml()).to.eventually.eql(
            'Error while saving your profile.'
          );

          expect(email.getCssValue('border-bottom-color')).to.eventually.eql(
           'rgba(255, 0, 0, 1)' // === 'red'
          );
        });
      });
    });

    describe('when an invalid password is given', function () {
      describe('when the given password is too short', function () {
        it('displays errors', function () {
          stateHelper.go('profile');

          editButton.click();

          password.clear();
          password.sendKeys('abc123');

          passwordConfirmation.clear();
          passwordConfirmation.sendKeys('abc123');

          saveButton.click();

          expect(errorMessage.getInnerHtml()).to.eventually.eql(
            'Error while saving your profile.'
          );

          expect(password.getCssValue('border-bottom-color')).to.eventually.eql(
           'rgba(255, 0, 0, 1)' // === 'red'
          );
        });
      });

      describe('when the given password does not match the confirmation', function () {
        it('displays errors', function () {
          stateHelper.go('profile');

          editButton.click();

          password.clear();
          password.sendKeys('abc123');

          passwordConfirmation.clear();
          passwordConfirmation.sendKeys('abc124');

          saveButton.click();

          expect(errorMessage.getInnerHtml()).to.eventually.eql(
            'Error while saving your profile.'
          );

          expect(password.getCssValue('border-bottom-color')).to.eventually.eql(
           'rgba(255, 0, 0, 1)' // === 'red'
          );
        });
      });

      describe('when only the password-confirmation is given', function () {
        it('displays errors', function () {
          stateHelper.go('profile');

          editButton.click();

          password.clear();

          passwordConfirmation.clear();
          passwordConfirmation.sendKeys('abc123');

          saveButton.click();

          expect(errorMessage.getInnerHtml()).to.eventually.eql(
            'Error while saving your profile.'
          );

          expect(passwordConfirmation.getCssValue('border-bottom-color')).to.eventually.eql(
           'rgba(255, 0, 0, 1)' // === 'red'
          );
        });
      });
    });
  });

  describe('#/profile/signup', function () {
    describe('when submitting valid data', function () {
      it('createas a user and sends a confirmation mail', function () {
        factory.build('User', function (err, u) {
          expect(User.truncate()).to.eventually.be.truthy;

          stateHelper.go('signup');

          name.sendKeys(u.name);
          email.sendKeys(u.email);
          password.sendKeys(u.password);
          passwordConfirmation.sendKeys(u.passwordConfirmation);

          registerButton.click();
        });
      });
    });
  });
});
