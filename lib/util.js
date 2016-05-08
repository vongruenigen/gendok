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
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var env = require('./env');
var config = require('./config');
var path = require('path');
var jade = require('jade');

var VIEW_PATH = path.join(path.resolve(__dirname), 'http/web/views');

/**
 * This module is a collection of utility functions.
 *
 * @type {Object}
 */
module.exports = {
  _mailerObject: null,

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
      host: config.get('redis_host'),
      port: config.get('redis_port'),
      auth: config.get('redis_auth')
    };

    return kue.createQueue({
      prefix: 'gendok_' + env.get(),
      redis: connectionSettings
    });
  },

  /**
   * Helper function to create a nodemailer transport with the passed options
   * object.
   *
   * @param {Object} options The options object to use.
   * @param {Boolean} force Whether to force transport creation or not.
   * @return The nodemailer transport.
   */
  createMailer: function (options, force) {
    if (!this._mailerObject || force) {
      this._mailerObject = nodemailer.createTransport(options);
    }

    return this._mailerObject;
  },

  /**
   * Returns true if the given object is an array, otherwise false.
   *
   * @param {Object} obj Object to check if it is an array
   * @return True if the object is an array, otherwise false.
   */
  isArray: function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  },

  /**
   * Renders the view with the given relative path. The paths are relative to
   * the views/ directory in lib/http/web/.
   *
   * @param {String} viewPath The relative path to the view
   * @param {Object} params The params to use to render the view
   */
  renderView: function (viewPath, params) {
    // Ensure path ends with .jade, otherwise the compiler will complain that
    // it cannot find the specified view file
    if (!viewPath.endsWith('.jade')) {
      viewPath += '.jade';
    }

    return jade.renderFile(path.join(VIEW_PATH, viewPath), params);
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
   * Generates a JSON Web Token for the given id with the secret set in the config.
   *
   * @param {Integer} id The id to use to generate the token
   * @returns {String} The generated token
   */
  generateJwt: function (id) {
    return jwt.sign({id: id}, config.get('jwt_secret'),
                    {expiresIn: config.get('jwt_ttl')});
  },

  /**
   * Verifies the given JSON Web Token and returns true if it's valid, otherwise
   * false is returned.
   *
   * @param {String} token The token to verify
   * @returns {Boolean} True if the token is valid, otherwise false
   */
  verifyJwt: function (token) {
    try {
      jwt.verify(token, config.get('jwt_secret'));
      return true;
    } catch (e) {
      return false;
    }
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
  },

  /**
  * Creates a new object with the attributes and values of two existing objects.
  * If an attribute exists in both obj1 and obj2, the value of obj2 will be in
  * the resulting object.
  *
  * @param {Object} obj1
  * @param {Object} obj2
  * @param {Boolean} ignoreUndefined Whether to ignore undefined attributes or not.
  * @return The new, extended object.
  */
  extend: function (obj1, obj2, ignoreUndefined) {
    var extendedObj = {};

    for (var objAttr1 in obj1) {
      if (ignoreUndefined && obj1[objAttr1] === undefined) {
        continue;
      }

      extendedObj[objAttr1] = obj1[objAttr1];
    }

    for (var objAttr2 in obj2) {
      if (ignoreUndefined && obj2[objAttr2] === undefined) {
        continue;
      }

      extendedObj[objAttr2] = obj2[objAttr2];
    }

    return extendedObj;
  },
};
