/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

var index  = require('../lib'),
    expect = require('chai').expect;

describe('gendok.index', function () {
    it('must export an object', function () {
        expect(index).to.be.an('object');
    });
});
