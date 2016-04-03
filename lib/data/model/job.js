/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var sequelize = require('sequelize');

/**
 * Creates the job model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (db) {
  var attributes = {
    templateId: {
      type: sequelize.INTEGER,
      allowNull: false,
      validate: {
        templateExists: function (templateId, next) {
          var Template = db.models.Template;

          if (this.templateId === '') {
            next(new Error('templateId is not set!'));
          } else {
            Template.findById(this.templateId).then(function (template) {
              var error = !template ? new Error('invalid templateId') : null;
              next(error);
            });
          }
        }
      }
    },
    payload: {
      type: sequelize.JSON
    },
    state: {
      type: sequelize.ENUM('pending', 'active', 'finished'),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    result: {
      type: sequelize.BLOB
    }
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.Job.belongsTo(models.Template, {foreignKey: 'templateId'});
      }
    },
    instanceMethods: {
      /**
       * Returns a sanitized version of the Job. Only contains the id,
       * templateId, payload and state.
       *
       * @return The sanitized Job as JavaScript object.
       */
      toPublicObject: function (model) {
        return {
          id: this.id,
          templateId: this.templateId,
          payload: this.payload,
          state: this.state
        };
      },

      /**
       * Schedules a 'convert' job on the worker queue for the current instance.
       * It expects an instance of the kue queue object as the first argument
       * and a callback accepting an error param and the queue job as a second.
       *
       * @param {Queue} queue The queue to schedule the job on
       * @param {Function} fn Function to call when job is scheduled
       */
      schedule: function (queue, fn) {
        if (!queue || !fn) {
          throw new Error('queue and fn are mandatory');
        }

        var job = queue.create('convert', {jobId: this.id});

        job.save(function (err) {
          if (err) {
            fn(err, null);
          } else {
            fn(null, job);
          }
        });
      }
    }
  };

  return db.define('Job', attributes, options);
};
