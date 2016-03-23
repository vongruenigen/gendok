/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

/**
 * Exports the register function authorization middleware module.
 *
 * @param {express} app
 * @type  {Function}
 */
module.exports = function (app) {
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
    // TODO: Fix this! Istanbul is intercepting our requires somehow, so the
    //       tests fail when we require the db module at the top.
    var User = require('../../data/db').getModel('User');
    var authHeader = req.get('Authorization');

    if (authHeader) {
      var token = extractToken(authHeader);

      User.findOne({where: {apiToken: token}}).then(function (user) {
        res.user = user;
        next();
      });
    } else {
      next();
    }
  });
};
