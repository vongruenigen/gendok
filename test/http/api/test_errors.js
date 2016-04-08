
/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendokHttp = require('../../..').http;
var errors = gendokHttp.api.errors;
var expect = require('chai').expect;

describe('gendok.http.api.errors', function () {
  describe('.validation', function () {
    describe('data()', function () {
      it('generates useful error data for validation errors', function () {
        var validationError = {
          errors: [
            {path: 'gugus', message: 'blub'},
            {path: 'dadat', message: 'abcd'}
          ]
        };

        var expectedError = {
          error: 'validation errors',
          validationErrors: {
            gugus: ['blub'],
            dadat: ['abcd']
          }
        };

        var generatedError = errors.validation.data(validationError);

        expect(generatedError).to.eql(expectedError);
      });
    });
  });
});
