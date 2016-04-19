/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var env = require('../../env');
var logger = require('../../logger');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var publicPath = path.resolve(path.join(__dirname, '../../../public'));
var viewsPath = path.resolve(path.join(__dirname, '../web/views'));

/**
 * Exports the register function basic middleware module.
 *
 * @param {express} app
 * @param {Config} config
 * @type  {Function}
 */
module.exports = function (app, config) {
  // Basic setup
  app.use(favicon(path.join(publicPath, 'img', 'favicon.ico')));

  // Use morgan only in the development environment
  /* istanbul ignore if */
  if (env.is('development') || process.env.DEBUG) {
    app.use(morgan('combined'));
  }

  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
  app.use(cookieParser());
  app.use(express.static(publicPath));

  // Setup views
  app.set('views', viewsPath);
  app.set('view engine', 'jade');
};
