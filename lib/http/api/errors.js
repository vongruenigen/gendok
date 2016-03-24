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
  unauthorized: {
    code: 401,
    data: {
      error: 'unauthorized'
    }
  },
  badRequest: {
    code: 400,
    data: {
      error: 'bad request'
    }
  },
  notFound: {
    code: 404,
    data: {
      error: 'not found'
    }
  },
  notFinished: {
    code: 406,
    data: {
      error: 'not finished'
    }
  }
};
