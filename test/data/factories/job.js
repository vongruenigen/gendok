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
 * Returns the factory with a defined job model
 *
 * @return The factory with the defined job model.
 */
module.exports = function (model) {
  factory.define('Job', model, {
    templateId: factory.assoc('Template', 'id'),
    payload: {},
    state: 'pending',
    result: null
  });

  return factory;
};
