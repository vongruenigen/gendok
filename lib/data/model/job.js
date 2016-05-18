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
var util = require('../../util');

const FORMAT_CONTENT_TYPE = {
  zip: 'application/zip',
  pdf: 'application/pdf',
  png: 'image/png'
};

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
      type: sequelize.ENUM('pending', 'active', 'finished', 'failed'),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },

    result: {
      type: sequelize.BLOB
    },

    format: {
      type: sequelize.ENUM('pdf', 'png'),
      allowNull: false,
      defaultValue: 'pdf',
      validate: {
        notEmpty: true
      }
    },

    async: {
      type: sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    renderedAt: {
      type: sequelize.DATE
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
      toPublicObject: function () {
        return {
          id: this.id,
          templateId: this.templateId,
          payload: this.payload,
          state: this.state,
          format: this.format,
          async: this.async
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
      },

      /**
       * Returns true if the job renders multiple documents as a result.
       *
       * @return True if this job is a batch job
       */
      isBatch: function () {
        return util.isArray(this.payload);
      },

      /**
       * This function returns the content type of the result.
       *
       * @return {String} The content type of the result
       */
      getContentType: function () {
        if (util.isArray(this.payload)) {
          return FORMAT_CONTENT_TYPE.zip;
        }

        return FORMAT_CONTENT_TYPE[this.format];
      }
    }
  };

  return db.define('Job', attributes, options);
};
