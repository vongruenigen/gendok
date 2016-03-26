/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var crypto = require('crypto');
var path = require('path');
var os = require('os');
var fs = require('fs');
var kue = require('kue');
var env = require('./env');

/**
 * This module is a collection of utility functions.
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Generates a random file and invokes the callback with the path as an argument.
   *
   * @param {Function} fn The callback to invoke as soon as the file is created.
   */
  randomFile: function (fn) {
    var filePath = path.join(os.tmpdir(), this.randomToken(10));
    var wstream = fs.createWriteStream(filePath);
    fn(wstream);
  },

  /**
   * Helper function to create a kue.js queue with the config settings specified
   * in the given config object.
   *
   * @param {Config} cfg The config object to use.
   * @return The newly created kue.js queue.
   */
  createQueue: function (cfg) {
    var connectionSettings = {
      host: cfg.get('redis_host'),
      port: cfg.get('redis_port'),
      auth: cfg.get('redis_auth')
    };

    return kue.createQueue({
      prefix: 'gendok_' + env.get(),
      redis: connectionSettings
    });
  },

  /**
   * Generates a random token and returns it. The length can be changed via the
   * len parameter, but because of the nature of the nodejs crypto generator and
   * strings, the len parameter will always be doubled. (in case of 0, 2 chars
   * are returned)
   *
   * @param {Number} len The desired length of the token
   * @return {String} The generated token
   */
  randomToken: function (len) {
    return crypto.randomBytes(len || 4).toString('hex');
  },

  /**
   * Adds additional css to the given html string and returns it.
   *
   * @param {String} html The html to use
   * @param {String} css The additional css
   * @return The html containing the additional css.
   */
  addCssToHtml: function (html, css) {
    var headIndex = html.indexOf('<head>');
    var startIndex = headIndex + '<head>'.length;
    var styleTag = '<style>' + css + '</style>';

    return html.substr(0, startIndex) + styleTag +
           html.substr(startIndex);
  }
};