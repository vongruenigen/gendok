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
 * This worker is responsible for cleaning up old jobs for which their TTL is
 * expired. The job itself stays in the database, but the result attribute will
 * be deleted on them. The TTL can be configured via the config.
 *
 * @param {Object} job The job with the required data.
 * @param {Function} done Function to call when the worker finished the job.
 */
module.exports = function (data, done) {
};
