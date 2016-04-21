/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var expect = require('chai').expect;
var gendok = require('../../');
var helper = require('../helper');

describe('gendok.http.web.home', function () {
  helper.runHttpServer(this);

  describe('#/home', function (done) {
    it('contains the text "gendok"', function () {
      browser.get('#/home');
      expect($('h1.title').getText()).to.eventually.include('gendok');
    });
  });
});
