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
var passport = require('passport');
var LocalStrategy = require('passport-local');

/**
 * Exports the register function authentication middleware module.
 *
 * @param {express} app
 * @param {Config} config
 * @type  {Function}
 */
module.exports = function (app, config) {
  /**
   * Setup passport for authentication
   */
  app.use(passport.initialize());
  app.locals.passport = passport;

  var emailStrategy = new LocalStrategy(
    {passReqToCallback: true},
    function (req, email, password, done) {
      var User = req.db.getModel('User');

      User.findOne({where: {email: email}}).then(function (u) {
        if (u.isPassword(password)) {
          done(null, u);
        } else {
          done(new Error('invalid username or password'));
        }
      }).catch(function (err) {
        done(new Error('invalid username or password'));
      });
    }
  );

  passport.use('signin', emailStrategy);

  // Function for extracting the token from the authentication header. The
  // header should always be of the format: "Authorization: Token ABC" where
  // ABC stands for the token.
  var extractToken = function (header) {
    return header.replace('Bearer ', '');
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

      // If the token is invalid, we don't need to check in the database
      // if the token matches the user apiToken.
      if (!util.verifyJwt(token)) {
        return next();
      }

      User.findOne({where: {apiToken: token}}).then(function (user) {
        if (user) {
          logger.debug('Authorization Middleware - UserID: ' + user.id);
        } else {
          logger.debug('No user found with api token "%s"', token);
        }

        res.user = req.user = user;
        next();
      }).catch(next);
    } else {
      next();
    }
  });
};
