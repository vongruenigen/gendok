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
var util = gendok.util;
var stateHelper = require('./helpers/state_helper');
var authHelper = require('./helpers/auth_helper');

describe('signup', function () {
  var factory = helper.loadFactories(this);
  var queue = helper.createQueue(this);
  helper.runHttpServer(this);

  var User = null;
  var user = null; // set in beforeEach
  var token = null;
  var unconfirmedUser = null;

  var name = element(by.model('profile.name'));
  var email = element(by.model('profile.email'));
  var password = element(by.model('profile.password'));
  var passwordConfirmation = element(by.model('profile.passwordConfirmation'));

  var submitButton = $('[ng-click="signup(profile)"]');
  var errorMessage = $('.alert');

  beforeEach(function (done) {
    browser.get(helper.getUrl('/'));
    User = gendok.data.db.getModel('User');

    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        expect(err).to.not.exist;

        user = u;
        token = util.randomToken(32);

        factory.create('User', function (err, u2) {
          expect(err).to.not.exist;

          u2.update({confirmationToken: token}).then(function (u) {
            unconfirmedUser = u;
            done();
          }).catch(done);
        });
      });
    });
  });

  describe('#/signup', function () {
    describe('when a valid input is given', function () {
      it('signs up the user', function (done) {
        var jobsCountBefore = queue.testMode.jobs.length;

        User.count().then(function (n) {
          factory.build('User', function (err, u) {
            var attrs = u.toPublicObject();

            stateHelper.go('signup');

            name.clear();
            name.sendKeys(attrs.name);

            email.clear();
            email.sendKeys(attrs.email);

            password.clear();
            password.sendKeys(attrs.password);

            passwordConfirmation.clear();
            passwordConfirmation.sendKeys(attrs.passwordConfirmation);

            submitButton.click().then(function () {
              browser.waitForAngular().then(function () {
                User.count().then(function (n2) {
                  expect(n2).to.eql(n + 1);
                  expect(queue.testMode.jobs.length).to.eql(jobsCountBefore + 1);
                  done();
                });
              });
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

        submitButton.click();

        expect(errorMessage.getInnerHtml()).to.eventually.eql(
          'Error(s) occured while creating your profile.'
        );

        expect(email.getCssValue('border-bottom-color')).to.eventually.eql(
          'rgba(255, 0, 0, 1)' // === 'red'
        );
      });
    });
  });

  describe('#/profile/confirm', function () {
    describe('when a valid confirmation token is given', function () {
      it('signs in the user and redirects it to home', function () {
        browser.get(unconfirmedUser.getConfirmationLink());
        browser.waitForAngular();
        expect(authHelper.isAuthenticated()).to.eventually.be.true;
        expect(stateHelper.current()).to.eventually.eql('home');
      });
    });

    describe('when an invalid confirmation token is given', function () {
      it('redirects to user to home without signing it in', function () {
        browser.get(unconfirmedUser.getConfirmationLink() + 'abc');
        browser.waitForAngular();
        expect(authHelper.isAuthenticated()).to.eventually.be.false;
        expect(stateHelper.current()).to.eventually.eql('home');
      });
    });
  });
});
