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
var gendok = require('..');
var HttpServer = gendok.http.server;
var config = require('..').config;
var util = require('..').util;
var db = require('..').data.db;
var crypto = require('crypto');
var path = require('path');
var factories = require('./data/factories');
var factoryGirl = require('factory-girl');
var pdfjs = require('pdfjs-dist');
var format = require('util').format;
var fs = require('fs');

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
    var sslPort = config.get('http_ssl_port');
    var host = format('%s:%d', config.get('http_host'),
                               sslPort || config.get('http_port'));

    var url  = path.join(host, p);
    var protocol = sslPort ? 'https' : 'http';

    return format('%s://%s', protocol, url);
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
   * Sets the given options in the current config and invokes the callback.
   * The previous config is then restored after the callback has been executed.
   *
   * @param {Object} cfg Object containing the changes to the config
   * @param {Function} cb The callback to invoke after the changes on the config
   */
  withConfig: function (cfg, cb) {
    var keys = Object.keys(cfg);
    var prev = config.toObject();

    if (keys.length === 0 && cb) { cb(); }

    try {
      // Set the values of cfg on the config
      Object.keys(cfg).forEach(function (k) {
        config.set(k, cfg[k]);
      });

      (cb || this.noop)();
    } catch (err) {
      logger.error('Error while setting config: %s', err);
      throw err;
    } finally {
      // Restore config afterwards
      config.load(prev);
    }
  },

  /**
   * Saves a screenshot of the current browser state to 'screenshot.png'.
   */
  saveScreenshot: function () {
    var writeScreenShot = function (data, filename) {
      var stream = fs.createWriteStream(filename);
      stream.write(new Buffer(data, 'base64'));
      stream.end();
    };

    browser.takeScreenshot().then(function (png) {
      writeScreenShot(png, 'screenshot.png');
    });
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
    var data = {text: []};
    var proms = [];

    // Convert the node.js buffer to a ArrayBuffer for usage with pdf.js. This
    // needs to be done in order to ensure that pdfjs can parse the PDF corr-
    // ectly, otherwise we get nasty XRef header errors. This problem is based
    // on the fact that pdf.js is a library developed for the browser and not
    // server-side nodejs.
    if (Object.prototype.toString.call(buf) !== '[object ArrayBuffer]') {
      var ab = new ArrayBuffer(buf.length);
      var view = new Uint8Array(ab);

      for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
      }

      buf = ab;
    }

    var createProm = function (pdf, i) {
      proms.push(pdf.getPage(i).then(function (page) {
        return page.getTextContent();
      }).then(function (text) {
        text.items.forEach(function (item) {
          data.text.push(item.str);
        });
      }).catch(function (e) {
        fn(e, null);
      }));
    };

    try {
      pdfjs.getDocument(buf).then(function (pdf) {
        for (var i = 1; i <= pdf.pdfInfo.numPages; i++) {
          createProm(pdf, i);
        }

        Promise.all(proms).then(function () {
          fn(null, data);
        }).catch(function (err) {
          fn(err, null);
        });
      });
    } catch (e) { fn(e); }
  },

  /**
   * Starts a http server with the given modules. If no modules are given the
   * server will simply register the "all" module for the web, api and middle-
   * ware.
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

    if (!modules) {
      modules = [
        gendok.http.middleware.all,
        gendok.http.api.all,
        gendok.http.web.all
      ];
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
   * Starts a queue runner with the given workers registered. It registers all
   * currently implemented workers by default.
   *
   * @param {Object} ctx The context to register hooks on
   */
  runQueueRunner: function (ctx) {
    if (!ctx) {
      throw new Error('context argument must be present');
    }

    var runner = new gendok.queue.runner();
    var workersRegistered = false;

    ctx.beforeAll(function (done) {
      runner.start(function () {
        if (!workersRegistered) {
          Object.keys(gendok.queue.worker).forEach(function (w) {
            var worker = gendok.queue.worker[w];
            runner.registerWorker(w, worker);
          });

          workersRegistered = true;
        }

        done();
      });
    });

    ctx.afterAll(function (done) {
      runner.stop(done);
    });
  },

  /**
   * This helper creates a queue via util.createQueue() and sets up the required
   * before, after and afterEach hooks to run it in test mode. It uses the given
   * context to set up the hooks in.
   *
   * @param {Object} ctx The context to register the ooks in
   * @return {Queue} A queue object running in test mode
   */
  createQueue: function (ctx) {
    if (!ctx) {
      throw new Error('context is missing');
    }

    var queue = util.createQueue();

    ctx.beforeAll(function () {
      queue.testMode.enter();
    });

    ctx.beforeEach(function () {
      queue.testMode.clear();
    });

    ctx.afterAll(function () {
      queue.testMode.exit();
    });

    return queue;
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

        // Load the correct factory-girl adapter at the end
        require('factory-girl-sequelize')();

        factoriesLoaded = true;
      }
    });

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
