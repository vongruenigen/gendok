/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

/**
 * All API errors as objects. In case any error occurs, res.send(someError)
 * (e.g. errors.unauthorized) can be used to send back the object as JSON.
 *
 * The single error object should always contain at least two properties,
 * namely 'code', which is the HTTP status code, and a 'data' object which
 * is the JSON object sent back to the user.
 *
 * @type {Object}
 */
module.exports = {
  internal: {
    code: 500,
    data: {
      message: 'internal error'
    }
  },

  unauthorized: {
    code: 401,
    data: {
      message: 'unauthorized'
    }
  },

  badRequest: {
    code: 400,
    data: {
      message: 'bad request'
    }
  },

  notFound: {
    code: 404,
    data: {
      message: 'not found'
    }
  },

  forbidden: {
    code: 403,
    data: {
      message: 'forbidden'
    }
  },

  /**
   * Generate a Error Object with useful Error Messages
   */
  validation: {
    code: 400,
    /**
     * Helper function for generating useful error data which we can return to
     * the user in case he has submitted invalid data.
     *
     * @param {ValidationError} err The validation error to generate data for
     * @return The generated error object
     */
    data: function (err) {
      var ret = {
        message: 'validation errors',
        errors: {}
      };

      err.errors.forEach(function (e) {
        // In case our notNull validation fails we receive a bad error message
        // (e.g. "attribute may not be null") which we should rewrite before
        // return it to the user.
        if (e.type === 'notNull Violation') {
          e.message = 'may not be empty';
        }

        (ret.errors[e.path] = ret.errors[e.path] || []).push(e.message);
      });

      return ret;
    }
  },

  jsonSyntaxError: {
    code: 400,
    data: {
      message: 'JSON syntax error'
    }
  },
};
