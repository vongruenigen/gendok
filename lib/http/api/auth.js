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
      if (err || !user) {
        logger.debug('error when signin in: %s', err);

        return res.status(errors.unauthorized.code)
                  .send(errors.unauthorized.data);
      }

      // Unconfirmed users may not signin!
      if (!user.isConfirmed()) {
        return res.status(errors.forbidden.code)
                  .send(errors.forbidden.data);
      }

      // We return the same token in case the user tries to sign in again
      // after it already has an apiToken set. That enables the user to use
      // multiple clients with the same token.
      if (user.apiToken && util.verifyJwt(user.apiToken)) {
        return res.status(200).send({
          token: user.apiToken,
          email: user.email,
          isAdmin: user.isAdmin
        });
      }

      var jwtToken = util.generateJwt(user.id);

      // Store the current token on the user
      user.update({apiToken: jwtToken}).then(function (u) {
        res.status(200).send({token: jwtToken, email: u.email, isAdmin: user.isAdmin});
      }).catch(function (err) {
        res.status(errors.internal.code).send(errors.internal.data);
      });
    })(req, res, next);
  });

  /**
   * POST /api/auth/signout
   */
  app.post('/api/auth/signout', function (req, res) {
    if (!req.user) {
      return res.status(errors.badRequest.code).send(errors.badRequest.data);
    }

    req.user.update({apiToken: ''}).then(function (u) {
      res.status(200).send({message: 'successfully logged out'});
    }).catch(function (err) {
      res.status(errors.badRequest.code).send(errors.badRequest.data);
    });
  });
};
