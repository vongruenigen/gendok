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
var util = require('../../util');
var errors = require('./errors');
var helper = require('./helper');

/**
 * Exports the register function for the profiles api module.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app, config) {
  // Ensure that the user authorized before accessing any of the
  // profile API endpoints. Exclude the confirm and signup routes
  // since they should be publicly accessibly by everyone.
  helper.ensureAuthorizedUser(app, '/api/profile', false, [
    '/api/profile/confirm',
    '/api/profile/signup',
    '/api/profile/reset-password',
    '/api/profile/reset-password-req'
  ]);

  /**
   * GET /api/profile/confirm?token=...
   *
   * Confirms the user with the specified confirmationToken. It uses the query
   * param ?token=... to try to find the user to confirm.
   */
  app.get('/api/profile/confirm', function (req, res) {
    if (!req.query.token) {
      res.status(errors.badRequest.code).send(errors.badRequest.data);
    } else {
      req.db.getModel('User').findOne({
        where: {confirmationToken: req.query.token}
      }).then(function (u) {
        if (!u) {
          res.status(errors.badRequest.code).send(errors.badRequest.data);
        } else {
          var jwt = util.generateJwt(u.id);

          u.update({apiToken: jwt, confirmationToken: ''}).then(function () {
            res.status(200).send({token: jwt, email: u.email});
          });
        }
      }).catch(function (err) {
        logger.error('Error confirming the user: ' + err);
        res.status(errors.validation.code).json(errors.validation.data(err));
      });
    }
  });

  /**
   * POST /api/profile/reset-password
   *
   * Signs in the user and returns a valid JWT token. The frontend then ensures
   * that the user sets a new password by forcing it to.
   */
  app.post('/api/profile/reset-password', function (req, res) {
    var User  = req.db.getModel('User');
    var token = req.body.token;

    if (!token) {
      return res.status(errors.badRequest.code).send(errors.badRequest.data);
    }

    User.findOne({where: {resetPasswordToken: token}}).then(function (u) {
      if (!u) {
        res.status(errors.badRequest.code).send(errors.badRequest.data);
      } else {
        var jwt = util.generateJwt(u.id);

        u.update({apiToken: jwt, resetPasswordToken: ''}).then(function () {
          res.status(200).send({token: jwt, email: u.email});
        });
      }
    }).catch(function (err) {
      logger.error('Error while resettting password: ' + err);
      res.status(errors.badRequest.code).send(errors.badRequest.data);
    });
  });

  /**
   * POST /api/profile/reset-password-req
   *
   * Tries to find a user with the given username and resets its password and
   * sends a reset password mail to it. This route always returns 200, no matter
   * if the user with the given email can be found. This is intentional since we
   * won't allow attackers to test if a given e-mail address exists in our sys-
   * stem which it could if we returned f.e. a 404 if no user can be found with
   * the given email.
   */
  app.post('/api/profile/reset-password-req', function (req, res) {
    var User  = req.db.getModel('User');
    var email = req.body.email;

    User.findOne({where: {email: email}}).then(function (u) {
      if (u && !u.resetPasswordToken) {
        var newToken = util.randomToken(32);

        u.update({resetPasswordToken: newToken}).then(function () {
          u.sendResetPasswordMail(function () {
            res.status(200).send({email: email});
          });
        });
      } else {
        // Return success even though no user could be found!
        res.status(200).send({email: email});
      }
    }).catch(function (err) {
      res.status(200).send({email: email});
    });
  });

  /**
   * POST /api/profile/signup
   *
   * This route is responsible for registering new users who want to signup.
   */
  app.post('/api/profile/signup', function (req, res) {
    var attrs = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    var User = req.db.getModel('User');

    User.build(attrs)
        .save()
        .then(function (user) {
          logger.debug('Successfully signed up user');
          res.status(201).json({name: user.name, email: user.email});
        }).catch(function (err) {
          logger.error('Error signing up user: ' + err);
          res.status(errors.validation.code).json(errors.validation.data(err));
        });
  });

  /**
   * This route is responsible for returning the profile as a JSON object.
   *
   * GET /api/profile/
   */
  app.get('/api/profile/', function (req, res) {
    res.status(200).send(res.user.toPublicObject());
  });

  /**
   * This route is responsible for updating the profile.
   *
   * PUT /api/profile/
   */
  app.put('/api/profile/', function (req, res) {
    var attrs = {
      isAdmin: helper.getIfInAttrs('isAdmin', req, res, 'user'),
      name: helper.getIfInAttrs('name', req, res, 'user'),
      email: helper.getIfInAttrs('email', req, res, 'user'),
    };

    if (req.body.password) {
      attrs.password = req.body.password;
    }

    if (req.body.passwordConfirmation) {
      attrs.passwordConfirmation = req.body.passwordConfirmation;
    }

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    res.user.update(attrs).then(function () {
      logger.debug('Successfully updated profile (user): ' + res.user.id);
      res.status(200).json(res.user.toPublicObject());
    }).catch(function (err) {
      logger.error('Error updating profile (user): ' + err);
      res.status(errors.validation.code).json(errors.validation.data(err));
    });
  });
};
