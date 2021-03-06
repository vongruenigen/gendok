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
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var util = require('../../util');
var config = require('../../config');
var format = require('util').format;

/**
 * Creates the user model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (db) {
  var attributes = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: sequelize.INTEGER
    },
    isAdmin: {
      allowNull: false,
      defaultValue: false,
      type: sequelize.BOOLEAN,
    },
    name: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: {
          msg: 'may not be empty'
        }
      }
    },
    email: {
      allowNull: false,
      type: sequelize.STRING,
      unique: true,
      validate: {
        isEmail: {
          msg: 'must be a valid email address'
        },
        notEmpty: {
          msg: 'may not be empty'
        },
        isUnique: function (email, next) {
          var self = this;
          db.models.User.findOne({
            where: {email: email}
          }).then(function (user) {
            if (user) {
              if (self.isNewRecord || user.id !== self.id) {
                return next(new Error('Email address already in use!'));
              }
            }

            next();
          });
        }
      }
    },
    passwordConfirmation: {
      type: sequelize.VIRTUAL,

      validate: {
        passwordIsSet: function (passwordConfirmation) {
          if (passwordConfirmation) {
            if (!this.password) {
              throw new Error('password may not be empty');
            }
          }
        }
      }
    },
    passwordHash: {
      allowNull: false,
      type: sequelize.STRING,
    },
    password: {
      type: sequelize.VIRTUAL,
      set: function (password) {
        this.setDataValue('password', password);

        if (password) {
          var salt = bcrypt.genSaltSync(10);
          var passwordHashed = bcrypt.hashSync(this.password, salt);
          this.setDataValue('passwordHash', passwordHashed, {raw:true});
          this.setDataValue('salt', salt, {raw:true});
        }
      },

      validate: {
        ensureExistsOnCreate: function (password) {
          if (this.isNewRecord) {
            if (!this.password || !this.passwordConfirmation) {
              throw new Error('password and passwordConfirmation must be set');
            }
          }
        },

        isSame: function (password) {
          if (password || this.passwordConfirmation) {
            if (password !== this.passwordConfirmation) {
              throw new Error('password differs to the password confirmation');
            }
          }
        },

        isLongEnough: function (val) {
          if (val.length < 7) {
            throw new Error('password must have at least 8 digits');
          }
        }
      }
    },
    apiToken: {
      type: sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    salt: {
      type: sequelize.STRING,
      allowNull: false
    },
    confirmationToken: {
      type: sequelize.STRING,
      defaultValue: function () {
        return util.randomToken(32);
      }
    },
    resetPasswordToken: {
      type: sequelize.STRING
    }
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.User.hasMany(models.Template, {foreignKey: 'userId'});
      }
    },

    hooks: {
      /**
       * This handler is used in the hooks section of the object below to send new
       * confirmation e-mails when the user has changed its e-mail address.
       */
      afterUpdate: function (user) {
        var changed = user.changed();

        if (changed.indexOf('email') !== -1) {
          return new Promise(function (res, rej) {
            user.update({
              apiToken: '',
              confirmationToken: util.randomToken(32)
            }, {
              hooks: false
            }).then(function (u) {
              u.sendConfirmationMail(res);
            }).catch(rej);
          });
        }
      },

      /**
       * This handler is used in the hooks section of the object below to send new
       * confirmation e-mails when the user is created.
       */
      afterCreate: function (user) {
        return new Promise(function (res, rej) {
          user.sendConfirmationMail(res);
        });
      }
    },

    instanceMethods: {
      /**
       * Deletes the User and its Templates and Jobs
       */
      deleteCompletely: function (callback) {
        var User = db.models.User;
        var Template = db.models.Template;
        var Job = db.models.Job;
        var self = this;

        User.findOne({
          where: {id: this.id},
          include: [
            {model: Template, include: [
              {model: Job}
            ]}
          ]
        }).then(function (user) {
          var templates = user.Templates;
          var proms = [];

          for (var index = 0; index < templates.length; index++) {
            var job = templates[index].Job;

            if (job !== null) {
              proms.push(job.destroy());
            }

            proms.push(templates[index].destroy());
          }

          proms.push(self.destroy());

          // Join all promisses generated by destroy()
          Promise.all(proms).then(function () {
            callback();
          }).catch(function (err) {
            callback(err);
          });
        });
      },

      /**
       * Returns the confirmation link for this user. Null will be returned if
       * no confirmationToken is present.
       *
       * @returns The confirmationLink for this user or null
       */
      getConfirmationLink: function () {
        if (!this.isConfirmed()) {
          // TODO: We need some module for handling URLs properly!
          return format('http://%s:%s/#/profile/confirm?token=%s',
                        config.get('http_host'), config.get('http_port'),
                        this.confirmationToken);
        } else {
          return null;
        }
      },

      /**
       * Returns the reset password link for this user. Null will be returned if
       * no resetPasswordToken is present.
       *
       * @returns The reset password link for this user or null
       */
      getResetPasswordLink: function () {
        if (this.resetPasswordToken) {
          // TODO: We need some module for handling URLs properly!
          return format('http://%s:%s/#/profile/reset-password?token=%s',
                        config.get('http_host'), config.get('http_port'),
                        this.resetPasswordToken);
        } else {
          return null;
        }
      },

      /**
       * Sends the confirmation mail for this user if it is not confirmed already.
       *
       * @param {Function} fn Callback to invoke after email has been scheduled
       */
      sendConfirmationMail: function (fn) {
        if (this.isConfirmed()) {
          return fn(new Error('user is already confirmed'));
        } else {
          var queue = util.createQueue();

          // Render the confirmation mail
          var confirmationHtml = util.renderView('emails/confirmation', {
            name: this.name,
            confirmationLink: this.getConfirmationLink()
          });

          var emailJob = queue.create('email', {
            subject: '[gendok] Confirm your e-mail address',
            to: this.email,
            html: confirmationHtml
          });

          emailJob.save(function (err) {
            if (err) {
              fn(err, null);
            } else {
              fn(null, emailJob);
            }
          });
        }
      },

      /**
       * Sends the reset password mail for this user if a resetPasswordToken is
       * set on the current instance.
       *
       * @param {Function} fn Callback to invoke after email has been scheduled
       */
      sendResetPasswordMail: function (fn) {
        if (!this.resetPasswordToken) {
          return fn(new Error('user has no resetPasswordToken set'));
        } else {
          var queue = util.createQueue();

          // Render the reset password mail
          var resetPasswordHtml = util.renderView('emails/reset_password', {
            name: this.name,
            resetPasswordLink: this.getResetPasswordLink()
          });

          var emailJob = queue.create('email', {
            subject: '[gendok] Reset your password',
            to: this.email,
            html: resetPasswordHtml
          });

          emailJob.save(function (err) {
            if (err) {
              fn(err, null);
            } else {
              fn(null, emailJob);
            }
          });
        }
      },

      /**
       * Returns true if the user is already confirmed, otherwise false.
       *
       * @return {Boolean} True if the user is confirmed
       */
      isConfirmed: function () {
        return !this.confirmationToken;
      },

      /**
       * Checks if the given password is correct.
       *
       * @param {String} pw The password to check
       * @return {Boolean} True if it's correct, otherwise false
       */
      isPassword: function (pw) {
        return bcrypt.hashSync(pw, this.salt) === this.passwordHash;
      },

      /**
       * Returns a sanitized version of the User. Only contains, name and
       * email, but no id.
       *
       * @return The sanitized User as JavaScript object.
       */
      toPublicObject: function () {
        return {
          id: this.id,
          isAdmin: this.isAdmin,
          name: this.name,
          email: this.email,
          createdAt: this.createdAt ? this.createdAt.toISOString() : null,
          updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null
        };
      }
    }
  };

  return db.define('User', attributes, options);
};
