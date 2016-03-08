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
var publicPath = path.resolve(path.join(__dirname, '../../../public'));
var viewsPath = path.resolve(path.join(__dirname, '../web/views'));

/**
 * Exports the register function basic middleware module.
 *
 * @param {express} app
 * @type  {Function}
 */
module.exports = function (app) {
  // Basic setup
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(morgan('combined'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(publicPath));

  // Setup views
  app.set('views', viewsPath);
  app.set('view engine', 'jade');

  // development error handler will print stacktrace
  if (env.is('development') || env.is('test')) {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  } else {
    // production error handler, no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });
  }
};
