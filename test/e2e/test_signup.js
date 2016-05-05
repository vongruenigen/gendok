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

describe('signup', function () {
  var factory = helper.loadFactories(this);
  var queue = helper.createQueue(this);
  helper.runHttpServer(this);

  var User = null;
  var user = null; // set in beforeEach

  var name = element(by.model('profile.name'));
  var email = element(by.model('profile.email'));
  var password = element(by.model('profile.password'));
  var passwordConfirmation = element(by.model('profile.passwordConfirmation'));

  var registerButton = $('[ng-click="registerprofile)"]');
  var errorMessage = $('.alert');

  beforeEach(function (done) {
    User = gendok.db.getModel('User');

    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        expect(err).to.not.exist;
        user = u;

        authHelper.signin(user, done);
      });
    });
  });

  describe('#/register', function () {
    describe('when a valid input is given', function () {
      it('registers the user', function (done) {
        User.count().then(function (n) {
          var attrs = {
            name: 'blubb',
            email: 'test@blubb.com',
            password: 'abc123456',
            passwordConfirmation: 'abc123456'
          };

          stateHelper.go('signup');

          name.clear();
          name.sendKeys(attrs.name);

          email.clear();
          email.sendKeys(attrs.email);

          password.clear();
          password.sendKeys(attrs.password);

          passwordConfirmation.clear();
          passwordConfirmation.sendKeys(attrs.passwordConfirmation);

          registerButton.click().then(function () {
            browser.waitForAngular().then(function () {
              expect(User.count()).to.eventually.eql(n + 1);
              expect(queue.testMode.jobs.count).to.eql(1);
            });
          });
        });
      });
    });

    describe('when invalid inputs are given', function () {
      it('shows an error', function () {
        stateHelper.go('signup');

        email.clear();
        email.sendKeys('my-invalid-email@-address');

        registerButton.click();

        expect(errorMessage.getInnerHtml()).to.eventually.eql(
          'An error occured while registering your account.'
        );

        expect(email.getCssValue('border-bottom-color')).to.eventually.eql(
          'rgba(255, 0, 0, 1)' // === 'red'
        );
      });
    });
  });
});
