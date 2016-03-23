/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var mustache = require('mustache');

function compile(template, data, callback) {
  var rendered = mustache.render(template, data);
  var err = null;
  callback(err, rendered);
}

module.exports = {
  compile: compile
};
