/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var template = require('../../..').data.model.template,
    expect   = require('chai').expect;

describe('gendok.data.model.template', function () {
  it('is a function', function () {
    expect(template).to.be.a('function');
  });
});
