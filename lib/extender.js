/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

module.exports = {

  /**
  * Creates a new object with the attributes and values of two existing objects.
  * If an attribute exists in both obj1 and obj2, the value of obj2 will be in
  * the resulting object.
  *
  * @param {Object} obj1
  * @param {Object} obj2
  * @return {Object}
  */
  extend: function (obj1, obj2) {
    var extendedObj = {};

    for (var attr in obj1) {
      extendedObj[attr] = obj1[attr];
    }

    for (var attr in obj2) {
      extendedObj[attr] = obj2[attr];
    }

    return extendedObj;
  },

};
