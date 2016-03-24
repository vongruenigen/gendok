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
 * Returns the factory with a defined template model
 *
 * @return The factory with the defined template model.
 */
module.exports = function (model) {
  factory.define('Template', model, {
    type: 'html',
    body: faker.name.firstName(),
    userId: factory.assoc('User', 'id')
  });

  return factory;
};
