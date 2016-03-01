/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Config = require('..').Config,
    expect = require('chai').expect;

describe('gendok.config', function () {
    it('must be a function', function () {
        var cfg = new Config();

        expect(Config).to.be.a('function');
        expect(cfg).to.be.an('object');
    });

    describe('getAvailableOptions()', function () {
        it('returns an array of strings', function () {
            var availableOpts = Config.getAvailableOptions();

            expect(availableOpts).to.be.an('array');
            expect(availableOpts.length).to.be.above(0);

            availableOpts.forEach(function (value) {
                expect(value).to.be.a('string');
            });
        });
    });

    describe('sanitizeOptions()', function () {
        it('removes all unavailable options from the object', function () {
            var availableOpts = Config.getAvailableOptions(),
                keys          = ['xyz', 'abc'],
                options       = {};

            availableOpts.concat(keys).forEach(function (value) {
                options[value] = 'abc';
            });

            var sanitizedOptions = Config.sanitizeOptions(options);

            expect(sanitizedOptions).to.be.an('object');
            expect(sanitizedOptions).not.to.include.keys(keys);
        });
    });
});
