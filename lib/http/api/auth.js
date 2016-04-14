/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var logger = require('../../logger');
var config = require('../../config');
var util = require('../../util');
var db = require('../../data/db');
var errors = require('./errors');
var helper = require('./helper');
var jwt = require('jsonwebtoken');
var passport = require('passport');

/**
 * Exports the register function for the authentication api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  /**
   * POST /api/auth/signin
   */
  app.post('/api/auth/signin', function (req, res, next) {
    passport.authenticate('signin', function (err, user, info) {
      if (err) {
        logger.debug('error when signin in: %s', err);

        return res.status(errors.unauthorized.code)
                  .send(errors.unauthorized.data);
      }

      var jwtToken = util.generateJwt(user.id);

      // Store the current token on the user
      user.update({apiToken: jwtToken}).then(function (u) {
        res.status(200).send({token: jwtToken});
      }).catch(function (err) {
        res.status(errors.badRequest.code).send(errors.badRequest.data);
      });
    })(req, res, next);
  });

  /**
   * POST /api/auth/signout
   */
  app.post('/api/auth/signout', function (req, res) {
    req.user.update({apiToken: ''}).then(function (u) {
      res.status(200).send({message: 'successfully logged out'});
    }).catch(function (err) {
      res.status(errors.badRequest.code).send(errors.badRequest.data);
    });
  });
};
