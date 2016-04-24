/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var markdown = require('markdown').markdown;

/**
 * Compiles the given template with the given data and invokes the callback
 * with an error (if occured) and the resulting html string.
 *
 * @return {String} The compiler type
 */
function compile(template, data, callback) {
  var rendered = markdown.toHTML(template);
  var err = null;
  callback(err, rendered);
}

/**
 * Returns the type of this compiler as a string.
 *
 * @return {String} The compiler type
 */
function getType() {
  return 'markdown';
}

module.exports = {
  compile: compile,
  getType: getType
};
