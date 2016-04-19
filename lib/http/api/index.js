/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

module.exports = {
  all:       require('./all'),
  templates: require('./templates'),
  status:    require('./status'),
  errors:    require('./errors'),
  jobs:      require('./jobs'),
  users:     require('./users'),
  profile:  require('./profile'),
  auth:      require('./auth')
};
