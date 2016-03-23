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
var Template = require('../../data').model.template;

/**
 * Exports the register function for the templates api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  app.post('/api/templates', function (req, res) {
    logger.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    logger.debug(req.body);
    var attrs = JSON.parse(req.body);
    logger.debug(attrs);
    logger.debug('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  });

  app.delete('/api/templates/:id', function (req, res) {
    console.log("------------->HIER<--------------")
    // TODO: Check user and jobs
    Template.findById(req.params.id).then(function (template) {
      Template.destroy({
              where: {
                userId: template.userId
              }
            }).then(function (affectedRows) {
              expect(affectedRows).to.eql(1);
              done();
            });
    });
  });
};
