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

var httpSignin = function (user, fn) {
  var signinUrl = helper.getUrl('/#/signin');
  browser.get(signinUrl);

  var signinButton   = $('.btn-signin');
  var errorParagraph = $('.alert');
  var usernameField  = $('#username');
  var passwordField  = $('#password');

  usernameField.sendKeys(user.email);
  passwordField.sendKeys(user.password);
  signinButton.click();

  fn();
};

describe('user signin / signout', function () {
  var factory = helper.loadFactories(this);
  var url = helper.getUrl('/#/signin');
  helper.runHttpServer(this);

  describe('#/signin', function () {
    var signinButton   = $('.btn-signin');
    var errorParagraph = $('.alert');
    var usernameField  = $('#username');
    var passwordField  = $('#password');

    beforeEach(function () {
      browser.get(url);
    });

    describe('form', function () {
      describe('when no username or password is given', function () {
        it('shows an error message', function () {
          signinButton.click();

          var text = errorParagraph.getInnerHtml();
          expect(text).to.eventually.eql('invalid username and/or password');
        });
      });

      describe('when an invalid username or password is given', function () {
        it('shows an error message', function () {
          var username = 'invalid@gendok.com';
          var password = 'gugusabc123';

          usernameField.sendKeys(username);
          passwordField.sendKeys(password);
          signinButton.click();

          errorParagraph.getInnerHtml().then(function (t) {
            expect(t).to.eql('invalid username and/or password');
          });
        });
      });

      describe('when a valid username is given', function () {
        it('replaces the signup link with dropdown items');
      });

      describe('when the user is already logged in', function () {
        it('redirects to home', function (done) {
          factory.create('User', function (err, user) {
            expect(err).to.not.exist;

            usernameField.sendKeys(user.email);
            passwordField.sendKeys(user.password);
            signinButton.click();

            // Get the current state name of the ui-router
            var currentStateName = browser.executeAsyncScript(function (fn) {
              var el = document.querySelector('html');
              var injector = angular.element(el).injector();
              var service = injector.get('$state');
              fn(service.current.name);
            });

            currentStateName.then(function (t) {
              expect(t).to.eql('home');
              done();
            });
          });
        });
      });
    });

    describe('signout link', function () {
      describe('when the user is not logged in', function () {
        it('is not visible');
      });

      describe('when the user is logged in', function () {
        it('logs it out after clicking it', function (done) {
          factory.create('User', function (err, user) {
            httpSignin(user, done);

            element(by.css('a.signout-link')).click();

            // Get the current state name of the ui-router
            var currentStateName = browser.executeAsyncScript(function (fn) {
              var el = document.querySelector('html');
              var injector = angular.element(el).injector();
              var service = injector.get('$state');
              fn(service.current.name);
            });

            currentStateName.then(function (t) {
              var signupLink = element(by.css('a.signup-lin'));

              expect(t).to.eql('home');
              expect(signupLink.isPresent()).to.be.eventually.true;
              done();
            });
          });
        });
      });
    });
  });
});
