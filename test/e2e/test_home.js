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
  var url = helper.getUrl('/');
  helper.runHttpServer(this);

  describe('/', function (done) {
    it('contains the text "gendok"', function () {
      browser.get(url);
      expect($('h1.title').getText()).to.eventually.include('gendok');
    });
  });
});
