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

describe('user signin / signout', function () {
  var factory = helper.loadFactories(this);
  helper.runHttpServer(this);

  describe('#/signin', function () {
    var signinButton   = $('.btn-signin');
    var errorParagraph = $('.alert');
    var usernameField  = $('#username');
    var passwordField  = $('#password');
    var signoutLink    = $('[ng-click="signoutUser()"]');
    var dropdownToggle = $('li a.dropdown-toggle');
    var signupLink     = $('a.signup-link');

    var user = null; // set in beforeEach

    beforeEach(function (done) {
      authHelper.signout(function () {
        factory.create('User', function (err, u) {
          user = u;
          done(err);
        });
      });
    });

    describe('form', function () {
      describe('when no username or password is given', function () {
        it('shows an error message', function () {
          stateHelper.go('signin');

          usernameField.clear();
          passwordField.clear();

          signinButton.click();

          var text = errorParagraph.getInnerHtml();
          expect(text).to.eventually.eql('invalid username and/or password');
        });
      });

      describe('when an invalid username or password is given', function () {
        it('shows an error message', function () {
          stateHelper.go('signin');
          var username = 'invalid@gendok.com';
          var password = 'gugusabc123';

          usernameField.clear();
          usernameField.sendKeys(username);

          passwordField.clear();
          passwordField.sendKeys(password);

          signinButton.click();

          expect(errorParagraph.getInnerHtml()).to.eventually.eql(
            'invalid username and/or password'
          );
        });
      });

      describe('when a valid username is given', function () {
        it('replaces the signup link with dropdown items', function () {
          expect(signupLink.isPresent()).to.eventually.be.true;

          stateHelper.go('signin');

          usernameField.clear();
          usernameField.sendKeys(user.email);

          passwordField.clear();
          passwordField.sendKeys(user.password);

          signinButton.click();

          expect(signupLink.isPresent()).to.eventually.be.false;
          expect(dropdownToggle.isPresent()).to.eventually.be.true;
          expect(dropdownToggle.isDisplayed()).to.eventually.be.true;
        });
      });

      describe('when the user is already signed in', function () {
        it('redirects to home', function () {
          stateHelper.go('signin');

          usernameField.clear();
          usernameField.sendKeys(user.email);

          passwordField.clear();
          passwordField.sendKeys(user.password);

          signinButton.click();

          browser.get('#/signin');
          browser.sleep(1000);

          expect(stateHelper.current()).to.eventually.eql('home');
        });
      });
    });

    describe('signout link', function () {
      describe('when the user is logged in', function () {
        it('logs it out after clicking it', function () {
          stateHelper.go('signin');

          usernameField.clear();
          usernameField.sendKeys(user.email);

          passwordField.clear();
          passwordField.sendKeys(user.password);

          signinButton.click();

          dropdownToggle.click();
          signoutLink.click();

          expect(authHelper.isAuthenticated()).to.eventually.be.false;
          expect(browser.getCurrentUrl()).to.eventually.include('#/home');
        });
      });
    });
  });
});
