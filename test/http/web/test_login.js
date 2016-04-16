/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Browser = require('zombie');
var expect = require('chai').expect;
var config = require('../../..').config;
var http = require('../../../').http;
var helper = require('../../helper');
var HttpServer = http.server;
var web = http.web;

describe('gendok.http.web.home', function () {
  it('is a function', function () {
    expect(web.home).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  var browser = new Browser();
  var modules = [http.middleware.basic, web.home];

  // Register http server hooks
  helper.runHttpServer(this, modules);
  Browser.localhost(config.get('http_host'), config.get('http_port'));

  describe('/login', function () {
    beforeEach(function (done) {
      browser.visit('/login', done);
    });

    describe('login form', function () {
      describe('when no username or password is given', function () {
        it('shows an error message', function (done) {
        });
      });

      describe('when an invalid username or password is given', function () {
        it('shows an error message');
      });

      describe('when a valid username is given', function () {
        it('replaces the login form with dropdown items');
      });

      describe('when the user is already logged in', function () {
        it('is not visible', function (done) {
          helper.loginUser(browser, factory, function (err, user) {
            expect(err).to.not.exist;
            browser.assert.elements('.dropdown.profile form', 0);
          });
        });
      });
    });

    describe('logout link', function () {
      describe('when the user is not logged in', function () {
        it('is not visible');
      });

      describe('when the user is logged in', function () {
        it('logs it out after clicking it');
      });
    });
  });
});
