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

/**
 * Returns the factory with a defined user model
 *
 * @return The factory with the defined user model.
 */
module.exports = function (model) {
  factory.define('User', model, {
    isAdmin: false,
    name: faker.name.findName(),
    email: factory.seq(function () {
      //TODO: Ugly email generator, later we dont need this, because of db clear.
      var milliseconds = (new Date()).getTime();
      return 'test_user_' + milliseconds + '@gendok.com';
    }),

    passwordHash: faker.random.uuid()
  });

  return factory;
};
