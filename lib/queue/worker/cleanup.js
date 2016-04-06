/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var logger = require('../../logger');

/**
 * This worker is responsible for cleaning up old jobs for which their TTL is
 * expired. The job itself stays in the database, but the result attribute will
 * be deleted on them. The TTL can be configured via the config.
 *
 * @param {Object} j required data (e.g. .data.ttl).
 * @param {Function} done Function to call when the worker finished the job.
 */
module.exports = function (j, done) {
  var Job = require('../../data/db').getModel('Job');
  var data = j.data;

  if (!data.ttl) {
    logger.error('cleanup TTL is missing in data');
    return done(new Error('cleanup TTL is required'));
  }

  logger.info('starting to work on cleanup job');

  var thresholdDate = new Date(Date.now() - data.ttl);

  // SELECT * FROM jobs WHERE result IS NOT NULL AND renderedAt <= thresholdDate
  Job.update({result: null}, {where: {
    result: {
      $ne: null
    },
    renderedAt: {
      $lte: thresholdDate
    }
  }}).then(function (count) {
    logger.info('Amount of jobs cleaned: ' + count);
    done();
  }).catch(done);
};
