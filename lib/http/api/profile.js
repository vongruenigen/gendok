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
 * Exports the register function for the profiles api module.
 *
 * @param {express} app
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app, config) {
  // Ensure that the user authorized before accessing any of the
  // profile API endpoints.
  helper.ensureAuthorizedUser(app, '/api/profile');

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
