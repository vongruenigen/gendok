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
                res.user = usr;
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
      password: req.body.password
    };

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    var User = res.db.getModel('User');

    User.build(attrs)
            .save()
            .then(function (user) {
              logger.debug('Successfully saved new User to DB!');
              res.status(201).json(user.toPublicObject());
            }).catch(function (err) {
              logger.error('Error saving the User to DB: ' + err);
              res.status(errors.badRequest.code).json(errors.badRequest.data);
            });
  });

  /**
   * This route is responsible for updating the specified user
   *
   * PUT /api/users/:id
   */
  app.put('/api/users/:id', function (req, res) {
    var attrs = req.body;

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    res.user.update(attrs)
                .then(function () {
                  logger.debug('Successfully updated User with id: ' + req.params.id);
                  res.status(200).json(res.user.toPublicObject());
                }).catch(function (err) {
                  logger.error('Error updating the User with id: ' + req.params.id);
                  res.status(errors.badRequest.code).json(errors.badRequest.data);
                });
  });

  /**
   * This API route is responsible for deleting a User.
   *
   * DELETE /api/users/:id
   */
  app.delete('/api/users/:id', function (req, res) {
    //TODO: implement checking and deleting all references in workers
    res.user.destroy({where: {id: req.params.id}})
            .then(function (affectedRows) {
              logger.debug('Successfully deleted User from DB!');
              res.sendStatus(200);
            });
  });

  /**
   * This route is responsible for returning the specified user as a JSON object.
   *
   * GET /api/users/:id
   */
  app.get('/api/users/:id', function (req, res) {
    res.status(200).send(res.user.toPublicObject());
  });
};
