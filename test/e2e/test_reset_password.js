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

  var email = element(by.model('email'));

  var submitButton = $('[ng-click="resetPasswordReq(email)"]');
  var successMessage = $('div.successMessage p.text');
  var errorMessage = $('.alert');

  beforeEach(function (done) {
    browser.get(helper.getUrl('/'));
    User = gendok.data.db.getModel('User');

    authHelper.signout(function () {
      factory.create('User', function (err, u) {
        expect(err).to.not.exist;
        user = u;
        done();
      });
    });
  });

  describe('#/reset-password-req', function () {
    describe('when existing email is given', function () {
      it('sets the resetPasswordToken and sends an email', function (done) {
        var jobsCountBefore = queue.testMode.jobs.length;

        factory.create('User', function (err, u) {
          stateHelper.go('reset-password-req');

          email.clear();
          email.sendKeys(u.email);

          submitButton.click().then(function () {
            browser.waitForAngular().then(function () {
              u.reload().then(function (u) {
                expect(queue.testMode.jobs.length).to.eql(jobsCountBefore + 1);
                expect(u.resetPasswordToken).to.not.be.empty;
                done();
              });
            });
          });
        });
      });
    });

    describe('when an inexistent email is given', function () {
      it('still shows the success message', function (done) {
        var jobsCountBefore = queue.testMode.jobs.length;

        stateHelper.go('reset-password-req');

        email.clear();
        email.sendKeys('my-inexisting-email@gendok.com');

        submitButton.click().then(function () {
          browser.waitForAngular().then(function () {
            expect(queue.testMode.jobs.length).to.eql(jobsCountBefore);
            done();
          });
        });
      });
    });
  });

  describe('#/reset-password', function () {
    var resetPasswordUser = null;

    beforeEach(function (done) {
      var attrs = {resetPasswordToken: util.randomToken(32)};

      factory.create('User', attrs, function (err, u) {
        expect(err).to.not.exist;
        resetPasswordUser = u;
        done();
      });
    });

    describe('when accessing without or an invalid token', function () {
      it('returns to home without doing anything', function () {
        browser.get(resetPasswordUser.getResetPasswordLink() + 'abc');
        browser.waitForAngular();

        expect(authHelper.isAuthenticated()).to.eventually.be.false;
        expect(stateHelper.current()).to.eventually.eql('home');
      });
    });

    describe('when a valid token is given', function () {
      it('signs in the user and redirects to profile', function () {
        browser.get(resetPasswordUser.getResetPasswordLink());
        browser.waitForAngular();

        expect(authHelper.isAuthenticated()).to.eventually.be.true;
        expect(stateHelper.current()).to.eventually.eql('profile');
      });
    });
  });
});
