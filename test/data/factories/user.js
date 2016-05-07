/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var faker = require('faker');
var factory = require('factory-girl');
var db = require('../../..').data.db;
var util = require('../../..').util;

/**
 * Returns the factory with a defined user model
 *
 * @return The factory with the defined user model.
 */
module.exports = function (model) {
  factory.define('User', model, {
    isAdmin: false,
    name: faker.name.findName(),
    password: 'testpassword',
    passwordConfirmation: 'testpassword',
    confirmationToken: null,
    email: factory.seq(function () {
      //TODO: Ugly email generator, later we dont need this, because of db clear.
      var milliseconds = (new Date()).getTime();
      return 'test_user_' + milliseconds + '@gendok.com';
    })
  }, {
    afterCreate: function (user, options, fn) {
      // We clear the confirmationToken by hand, otherwise the created user
      // is not able to signin because of isConfirmed(). Also set a valid JWT
      // so that this user can sign in directly without having to create one
      // by issueing a request to /api/auth/signin.
      user.update({
        confirmationToken: null,
        apiToken: util.generateJwt(user.id)
      }).then(function () {
        fn(null, user);
      }).catch(function (err) {
        fn(err, null);
      });
    }
  });

  return factory;
};
