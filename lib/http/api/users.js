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
var errors = require('./errors');
var helper = require('./helper');

/**
 * Exports the register function for the users api module.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app, config) {
  // Ensure that the user authorized before accessing any of the
  // users API endpoints.
  helper.ensureAuthorizedUser(app, '/api/users', true);

  /**
   * This middleware is used to load the user referenced by the :id param. It
   * then stores the found user in the response object under the 'user' property.
   */
  app.use('/api/users/:id', function (req, res, next) {
    var User = res.db.getModel('User');

    User.findById(req.params.id)
        .then(function (usr) {
          if (!usr) {
            logger.error('User not found in DB: ' + req.params.id);
            res.status(errors.notFound.code).json(errors.notFound.data);
          } else {
            // TODO Since res.user is alread occupied by the object storing the
            // authenticated user we need to use this not so intuitive name,
            // maybe we should store the current user in the request rather
            // than the response.
            res.reqUser = usr;
            next();
          }
        }).catch(function (err) {
          logger.error('Error finding the user in DB: ' + err);
          res.status(errors.badRequest.code).json(errors.badRequest.data);
        });
  });

  /**
   * This API route is responsible for creating a new user.
   *
   * POST /api/users
   */
  app.post('/api/users', function (req, res) {
    var attrs = {
      isAdmin: req.body.isAdmin,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    var User = res.db.getModel('User');

    User.build(attrs)
            .save()
            .then(function (user) {
              user.sendConfirmationMail(function () {
                logger.debug('Successfully saved new User to DB!');
                res.status(201).json(user.toPublicObject());
              });
            }).catch(function (err) {
              logger.error('Error saving the User to DB: ' + err);
              res.status(errors.validation.code).json(errors.validation.data(err));
            });
  });

  /**
   * This route is responsible for updating the specified user
   *
   * PUT /api/users/:id
   */
  app.put('/api/users/:id', function (req, res) {
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

    res.reqUser.update(attrs)
                .then(function () {
                  logger.debug('Successfully updated User with id: ' + res.reqUser.id);
                  res.status(200).json(res.reqUser.toPublicObject());
                }).catch(function (err) {
                  logger.error('Error updating the User with id: ' + req.params.id);
                  res.status(errors.validation.code).json(errors.validation.data(err));
                });
  });

  /**
   * This API route is responsible for deleting a User.
   *
   * DELETE /api/users/:id
   */
  app.delete('/api/users/:id', function (req, res) {
    // An admin may not delete itself to prevent the last admin from deleting
    // itself
    if (parseInt(req.params.id) === res.user.id) {
      return res.status(errors.forbidden.code).json(errors.forbidden.data);
    }

    res.reqUser.deleteCompletely(function (err) {
      if (!err) {
        logger.debug('Successfully deleted User with id: ' + res.reqUser.id);
        res.sendStatus(200);
      } else {
        logger.error('Error deleting User: ' + err);
        res.status(errors.internal.code).json(errors.internal.data);
      }
    });
  });

  /**
   * This route is responsible for returning the specified user as a JSON object.
   *
   * GET /api/users/:id
   */
  app.get('/api/users/:id', function (req, res) {
    res.status(200).send(res.reqUser.toPublicObject());
  });
};
