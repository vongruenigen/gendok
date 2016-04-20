/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var path = require('path');
var phantomjs = require('phantomjs-prebuilt');
var gendok = require('../..');
var config = gendok.config.getDefault();
var format = require('util').format;

// Setup chai to use chai-as-promised, also see:
// https://github.com/angular/protractor/blob/master/docs/frameworks.md
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

// MUST match the jar version in 'node_modules/protractor/selenium/'!
var SELENIUM_VERSION = '2.52.0';

// Run via xvfb: xvfb-run --server-args="-screen 0, 1280x800" gulp test-e2e

/**
 * The configuration for protractor to run our e2e tests. For a general
 * introduction to e2e testing for angularjs with protactor just go to:
 * https://angular.github.io/protractor/#/tutorial
 *
 * @type {Object}
 */
exports.config = {
  specs: ['./**/test_*.js'],

  // Set the path to the selenium jar, this is only available if the command
  // 'webdriver update' was executed before. Protractor will then automatically
  // start the selenium server for us.
  seleniumServerJar: path.join(
    '../../node_modules/protractor/selenium/',
    'selenium-server-standalone-' + SELENIUM_VERSION + '.jar'
  ),

  capabilities: {browserName: 'firefox'},

  // Set the base url for application under test
  baseUrl: format('http://%s:%d/', config.http_host, config.http_port),

  // Set the default window size to 1280x800, otherwise we might get problems
  // with a changing menu header for example (e.g. collpasing).
  onPrepare: function () {
    browser.driver.manage().window().setSize(1280, 800);
  },

  // Use mocha instead of jasmine for testing
  framework: 'mocha',
  mochaOpts: {
    timeout: 5000,
    reporter: 'mocha-jenkins-reporter'
  }
};
