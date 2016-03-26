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

/**
 * Exports the register function authorization middleware module.
 *
 * @param {express} app
 * @param {Config} config
 * @param {Queue} queue
 * @type  {Function}
 */
module.exports = function (app, config, queue) {
  // Function for extracting the token from the authentication header. The
  // header should always be of the format: "Authorization: Token ABC" where
  // ABC stands for the token.
  var extractToken = function (header) {
    return header.replace('Token ', '');
  };

  // In case the 'Authorization' header is set, we try to load the user with
  // with the given API key and store it in the response object under the
  // currentUser property.
  app.use(function (req, res, next) {
    var User = res.db.getModel('User');
    var authHeader = req.get('Authorization');

    logger.debug('Authorization Middleware - authHeader: ' + authHeader);

    if (authHeader) {
      var token = extractToken(authHeader);
      User.findOne({where: {apiToken: token}}).then(function (user) {
        if (user) {
          logger.debug('Authorization Middleware - UserID: ' + user.id);
        } else {
          logger.debug('No user found with api token "%s"', token);
        }

        res.user = user;
        next();
      }).catch(next);
    } else {
      next();
    }
  });
};
