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
    userId: factory.assoc('User', 'id'),
    additionalCss: '',
    type: 'html',
    name: faker.name.findName() + '-template',
    body: '<html><head><title>hello world></title></head><body>' +
          '<h1>Hello from gendok</h1></body</html>',
    createdAt: '2016-04-21 17:50:39.451+02',
    updatedAt: '2016-04-24 18:27:14.039+02',
    paperFormat: 'A3',
    paperMargin: '10px',
    headerHeight: '0px',
    footerHeight: '4cm'
  });

  return factory;
};
