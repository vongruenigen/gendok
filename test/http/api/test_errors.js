
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
          message: 'validation errors',
          errors: {
            gugus: ['blub'],
            dadat: ['abcd']
          }
        };

        var generatedError = errors.validation.data(validationError);

        expect(generatedError).to.eql(expectedError);
      });

      it('rewrites errors with type "notNull Violation"', function () {
        var validationError = {
          errors: [
            {path: 'gugus', type: 'notNull Violation', message: 'blub'},
            {path: 'dadat', message: 'abcd'}
          ]
        };

        var expectedError = {
          message: 'validation errors',
          errors: {
            gugus: ['may not be empty'],
            dadat: ['abcd']
          }
        };

        var generatedError = errors.validation.data(validationError);

        expect(generatedError).to.eql(expectedError);
      });
    });
  });
});
