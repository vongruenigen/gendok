/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var logger = require('..').logger;
var HttpServer = require('..').http.server;
var config = require('..').config;
var db = require('..').data.db;
var crypto = require('crypto');
var path = require('path');
var factories = require('./data/factories');
var factoryGirl = require('factory-girl');
var PdfParser = require('pdf2json');
var format = require('util').format;

/**
 * Exports some utility functions
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Noop function.
   */
  noop: function () {},

  /**
   * Returns the URL to the given path prefixed with the current host.
   *
   * @param {String} p The path to get the URL for.
   * @return {String} The full URL.
   */
  getUrl: function (p) {
    var host = format('%s:%d', config.get('http_host'), config.get('http_port'));
    return path.join(host, p);
  },

  /**
   * Sets the given options as environment variables.
   *
   * @param {Object} env
   * @param {Function} cb
   */
  withEnv: function (env, cb) {
    var keys = Object.keys(env);
    var curr = {};
    var overwriteEnv;

    if (keys.length === 0) { cb(); }

    // Sets the variables defined in the process.env object
    overwriteEnv = function (obj) {
      Object.keys(obj).forEach(function (k) {
        curr[k] = process.env[k]; // For restore
        process.env[k] = obj[k];
      });
    };

    try {
      overwriteEnv(env);
      (cb || this.noop)();
      overwriteEnv(curr);
    } catch (err) {
      overwriteEnv(curr);
      logger.error('Error while setting environment: %s', err);
      throw err;
    }
  },

  /**
   * Helper function for parsing a PDF in a buffer given as the first parameter.
   * It then calls the supplied callback with an error (if any occured) and the
   * resulting object containing all the PDF content.
   *
   * @param {Buffer} buf The buffer containing the PDF data
   * @param {Function} fn The callback to invoke after the parsing
   */
  parsePdf: function (buf, fn) {
    var pdfParser = new PdfParser();
    var pdfObject = {chars: []};

    // Invoke the callback with an error if any occures
    pdfParser.on('pdfParser_dataError', function (err) {
      fn(err, null);
    });

    // Invoke the callback with the results as soon as they're available
    pdfParser.on('pdfParser_dataReady', function (data) {
      // Iterate over all pages, the including chars an each run, also
      // see https://github.com/modesty/pdf2json#page-object-reference
      data.formImage.Pages.forEach(function (p) {
        p.Texts.forEach(function (t) {
          t.R.forEach(function (r) {
            pdfObject.chars.push(r.T);
          });
        });
      });

      fn(null, pdfObject);
    });

    pdfParser.parseBuffer(buf);
  },

  /**
   * Starts a http server with the given modules.
   *
   * Starting and stopping of the server is done within the beforeEach() and
   * afterEach() blocks of the supplied context. So the context always has to
   * be a mocha context. The method can then be used as follows:
   *
   * describe('blub', function () {
   *   var myModules = [module1, module2, ...];
   *   helper.runHttpServer(this, myModules);
   *
   *   it('must pass', function () {
   *     // the test itself.
   *   });
   * });
   *
   * An error is thrown if the context argument is missing. It returns the server
   * object itself.
   *
   * @param {Object} context The current context
   * @param {Array} modules List of modules
   * @return {Server} The server which was just created.
   */
  runHttpServer: function (context, modules) {
    if (!context) {
      throw new Error('context argument must be present');
    }

    var server = new HttpServer();
    server.registerModules(modules);

    context.beforeEach(function (done) {
      server.start(done);
    });

    context.afterEach(function (done) {
      server.stop(done);
    });

    return server;
  },

  /**
   * Helper function to ensure that all factories have been loaded and a
   * database connection exists. The first parameter has to be the testing
   * context where the db-open/close hooks need to be registered.
   *
   * The factory-girl module is then returned after all factories have been reg-
   * istered.
   *
   * @param {Object} ctx Context to register the hooks within.
   * @return {FactoryGirl} The FactoryGirl object.
   */
  loadFactories: function (ctx) {
    var mod = null;
    var factoriesLoaded = false;

    ctx.beforeAll(function () {
      if (!db.isConnected()) {
        db.connect();
      }

      if (!factoriesLoaded) {
        Object.keys(factories).forEach(function (k) {
          factories[k](db.getModel(k));
        });

        factoriesLoaded = true;
      }
    });

    // Load the correct factory-girl adapter at the end
    require('factory-girl-sequelize')();

    return factoryGirl;
  },

  /**
   * Convenience method to set the GENDOK_ENV value in process.env.
   *
   * @param {String}   env
   * @param {Function} cb
   */
  withGendokEnv: function (env, cb) {
    this.withEnv({GENDOK_ENV: env}, cb);
  },

  /**
   * Shuffles the supplied array and returns it. Source:
   * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
   *
   * @param  {Array} arr
   * @return {Array}
   */
  shuffle: function (arr) {
    var counter = arr.length;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      var index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  },
};
