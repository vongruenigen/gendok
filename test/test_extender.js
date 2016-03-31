/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var extend = require('../lib').extender.extend;
var expect = require('chai').expect;

describe('gendok.extender', function () {
  it('is a function', function (done) {
    expect(extend).to.be.a('function');
    done();
  });

  it('combines attributes and values of two objects', function (done) {
    var obj1 = {
      a: true
    };
    var obj2 = {
      b: 'lorem ipsum'
    };
    var res = extend(obj1, obj2);
    expect(res.a).to.eql(obj1.a);
    expect(res.b).to.eql(obj2.b);
    expect(Object.keys(res).length).to.eql(2);
    done();
  });

  it('prefers the values of the second argument', function (done) {
    var obj1 = {
      a: true,
      b: 'abc'
    };
    var obj2 = {
      a: 'false'
    };
    var res = extend(obj1, obj2);
    expect(res.a).to.eql(obj2.a);
    expect(res.b).to.eql(obj1.b);
    expect(Object.keys(res).length).to.eql(2);
    done();
  });

  it('returns an empty object when called without an argument', function (done) {
    var res = extend();
    expect(res).to.be.an('object');
    expect(Object.keys(res).length).to.eql(0);
    done();
  });
});
