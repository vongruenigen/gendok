/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser
 *
 */

var index = require('../lib');

describe('gendok.index', function () {
    it('must export an object', function () {
        index.should.be.type('object');
    });
});
