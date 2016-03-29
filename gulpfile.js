/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var fs = require('fs');
var bower = require('bower');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var path = require('path');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var istanbul = require('gulp-istanbul');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var jscs = require('gulp-jscs');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var stylish = require('gulp-jscs-stylish');
var spawn = require('child_process').spawn;
var logger = require('./lib/').logger;
var env = require('./lib/').env;
var exec = require('child_process').exec;
var argv = require('minimist')(process.argv.slice(2));

/**
 * Config variables
 */
var mochaOpts = {reporter: 'spec'};
var mochaJenkinsOpts = {reporter: 'mocha-jenkins-reporter'};
var istanbulOpts = {dir: './reports',
                    reporters: ['text-summary', 'html', 'clover']};
var istanbulThresholdOpts = {thresholds: {global: 90}};

var publicPath = path.join(__dirname, 'public');
var publicFontsPath = path.join(publicPath, 'fonts');
var publicCssPath = path.join(publicPath, 'css');
var publicJsPath = path.join(publicPath, 'js');
var publicImgPath = path.join(publicPath, 'img');

var allJsFilename = 'all.js';
var allCssFilename = 'all.css';

var redisConfigTemplate = path.join(__dirname, 'config', 'redis.conf.tmpl');
var redisConfig = path.join(__dirname, 'config', 'redis.conf');
var redisLogfile = path.join(__dirname, 'log', 'redis.log');

// List of file patterns to glob for all required css files
var requiredCssPaths = [
  'bower_components/bootstrap/dist/css/bootstrap.css',
  'lib/http/web/assets/css/**/*.css'
];

// List of file patterns to glob for all required js files. Order is IMPORTANT!
var requiredJsPaths = [
  'bower_components/angular/angular.js',
  'bower_components/jquery/dist/jquery.js',
  'bower_components/bootstrap/dist/js/bootstrap.js',
  'lib/http/web/assets/js/**/*.js',
];

// Helper function which prints the error if given and exits.
var errorHandler = function (err) {
  if (err) {
    console.error('Error while running gulp: %s', err);
    process.exit(1);
  }
};

/**
 * Helper function which can be used to compile text files which contains
 * placeholder in ERB-style (e.g. <%= blub %>). It uses the values object
 * to fill the placeholders with referenced value.
 *
 * The callback is invoked with an error if a placeholder without a
 * correspondent value is found.
 *
 * This function is used to compile the redis configuration.
 *
 * @param input The path of the file to compile.
 * @param output The path to the resulting file.
 * @param values The values to use to replace the placeholders.
 * @param fn The callback, which is called after the template has been compiled.
 */
var compileTemplate = function (input, output, values, fn) {
  var placeholderRegex = /<%=\s*(.+)\s*%>/;
  var match;

  console.log('Starting to compile template %s', input);

  fs.readFile(input, function (err, text) {
    if (err) { return fn(err); }

    // Conver binary buffer to string
    text = text.toString();

    while (match = placeholderRegex.exec(text)) {
      var placeholder = match[0];
      var key = match[1] && match[1].trim();

      if (!values[key]) {
        return fn(new Error('no value for placeholder ' + key + ' found!'));
      }

      text = text.replace(placeholder, values[key]);
    }

    fs.writeFile(output, text, function (err) {
      if (!err) {
        console.log('Successfully compiled template %s to %s', input, output);
      }

      fn(err);
    });
  });
};

/**
 * Linting and code checking tasks
 */
gulp.task('lint', function () {
  gulp.src(['lib/**/*.js', 'test/**/*.js'])
      .pipe(jshint())
      .pipe(jscs())
      .pipe(stylish.combineWithHintResults())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('gulp-checkstyle-jenkins-reporter', {
        filename: path.join(__dirname, 'reports', 'checkstyle.xml')
      }));
});

/**
 * Testing related tasks
 */
gulp.task('pre-test', ['test-env', 'build', 'lint',
                       'redis-server', 'db-migrate'], function () {
  console.log('Successfully prepared test run');
});

gulp.task('test', ['pre-test'], function () {
  gulp.src(argv.only || argv.o || 'test/**/*.js')
      .pipe(mocha(mochaOpts))
      .on('error', function (e) { logger.error('error in test: %s', e); })
      .on('end', function () { process.exit(); });
});

gulp.task('test-env', function () {
  env.set('test');
});

gulp.task('pre-cov', function () {
  return gulp.src('lib/**/**.js')
             .pipe(istanbul())
             .pipe(istanbul.hookRequire());
});

var runTestsWithCov = function (opts) {
  gulp.src('test/**/*.js')
      .pipe(mocha(opts))
      .pipe(istanbul.writeReports(istanbulOpts))
      .pipe(istanbul.enforceThresholds(istanbulThresholdOpts))
      .on('end', function () { process.exit(); });
};

gulp.task('test-cov', ['pre-test', 'pre-cov'], function () {
  runTestsWithCov(mochaOpts);
});

gulp.task('test-watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('test-debug', ['pre-test'], function () {
  var gulpjs = path.join(__dirname, 'node_modules/gulp/bin/gulp.js');
  spawn('node', ['--debug-brk', gulpjs, 'test'], {stdio: 'inherit'});
});

gulp.task('test-jenkins', ['pre-test', 'pre-cov'], function () {
  runTestsWithCov(mochaJenkinsOpts);
});

/**
 * Database related tasks
 */

gulp.task('db-migrate', function () {
  var sequelizeCLI = path.join(__dirname, 'node_modules/.bin/sequelize');
  spawn('node', [sequelizeCLI, 'db:migrate'], {stdio: 'inherit', env: process.env});
});

/**
 * Build and deploy tasks
 */
gulp.task('build-watch', function () {
  gulp.watch(['lib/http/web/assets/**/*', 'bower_components/**/*'], ['build']);
});

gulp.task('build', ['check-bower-components',
                    'build-fonts',
                    'build-css',
                    'build-js',
                    'build-img',
                    'redis-config'], function () {
  console.log('Everything was successfully builded!');
});

gulp.task('build-js', function () {
  gulp.src(requiredJsPaths)
      .pipe(concat(allJsFilename))
      .pipe(gulpif(env.is('production'), uglify()))
      .pipe(gulp.dest(publicJsPath));
});

gulp.task('build-css', ['compile-scss'], function () {
  gulp.src(requiredCssPaths)
      .pipe(concat(allCssFilename))
      .pipe(gulpif(env.is('production'), cssnano()))
      .pipe(gulp.dest(publicCssPath));
});

gulp.task('compile-scss', function () {
  return sass('lib/http/web/assets/scss/**/*.scss')
      .pipe(autoprefixer('last 4 versions'))
      .pipe(gulp.dest('lib/http/web/assets/css/'));
});

gulp.task('build-fonts', function () {
  var bootsrapFontsPath = path.join(__dirname, 'bower_components/bootstrap/dist/fonts/**/*');
  gulp.src(bootsrapFontsPath).pipe(gulp.dest(publicFontsPath));
});

gulp.task('build-img', function () {
  var imagesPath = path.join(__dirname, 'lib/http/web/assets/img/**/*');
  gulp.src(imagesPath).pipe(gulp.dest(publicImgPath));
});

gulp.task('check-bower-components', function (done) {
  var componentsPath = path.join(__dirname, 'bower_components');

  fs.stat(componentsPath, function (err) {
    if (err) {
      // Throw the error in case it's not "file not found"
      if (err.code !== 'ENOENT') {
        throw err;
      }

      // Install bower components programmatically
      bower.commands.install(undefined, undefined).on('end', function (err) {
        if (err) {
          throw err;
        }

        done();
      });
    } else {
      done();
    }
  });
});

/**
 * Redis related tasks
 */
gulp.task('redis-server', ['redis-config'], function (done) {
  exec('which redis-server', function (err) {
    if (err) { return done(err); }

    var stdio = env.is('development') ? 'inherit' : 'ignore';
    var redis = spawn('redis-server', [redisConfig],
                      {detached: env.is('test'), stdio: stdio});

    // use unref() here to prevent the test process to hang
    // and wait for redis to exit by itself. The redis process
    // will then be quit when gulp exits because of the on 'exit'
    // callback below.
    if (env.is('test')) {
      redis.unref();
    }

    process.once('exit', function () {
      redis.kill('SIGKILL');
    });

    done();
  });
});

gulp.task('redis-config', function (done) {
  var values = {
    logfile: redisLogfile
  };

  compileTemplate(redisConfigTemplate, redisConfig, values, done);
});

/**
 * Miscellaneous tasks
 */
gulp.task('clean', function (cb) {
  exec('git clean -Xf && git clean -Xdf', function (err, stdout, stderr) {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

// Default Task
gulp.task('default', ['lint', 'test']);
