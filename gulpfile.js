/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

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
var checkstyle = require('gulp-jshint-checkstyle-reporter');
var jscs = require('gulp-jscs');
var spawn = require('child_process').spawn;
var logger = require('./lib/').logger;
var env = require('./lib/').env;
var exec = require('child_process').exec;

/**
 * Config variables
 */
var mochaOpts = {reporter: 'spec'};
var mochaJenkinsOpts = {reporter: 'mocha-jenkins-reporter'};
var istanbulOpts = {dir: './reports', reporters: ['html', 'clover']};
var istanbulThresholdOpts = {thresholds: {global: 90}};

var publicPath = path.join(__dirname, 'public');
var publicFontsPath = path.join(__dirname, 'fonts');
var publicCssPath = path.join(publicPath, 'css');
var publicJsPath = path.join(publicPath, 'js');

var allJsFilename = 'all.js';
var allCssFilename = 'all.css';

// List of file patterns to glob for all required css files
var requiredCssPaths = [
  'bower_components/bootstrap/dist/css/bootstrap.css'
];

// List of file patterns to glob for all required js files. Order is IMPORTANT!
var requiredJsPaths = [
  'bower_components/jquery/dist/jquery.js',
  'bower_components/bootstrap/dist/js/bootstrap.js',
  'bower_components/angularjs/angular.js',
  'lib/http/web/assets/js/**/*.js'
];

/**
 * Linting and code checking tasks
 */
gulp.task('lint', ['format-code'], function () {
  gulp.src(['lib/**/*.js', 'test/**/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'))
      .pipe(checkstyle())
      .pipe(gulp.dest('reports'));
});

gulp.task('format-code', function () {
  gulp.src(['lib/**/*.js', 'test/**/*.js'])
      .pipe(jscs({fix: true}))
      .pipe(jscs.reporter())
      .pipe(jscs.reporter('failImmediately'));
});

/**
 * Testing related tasks
 */
gulp.task('test', ['lint', 'test-env'], function () {
  gulp.src('test/**/*.js')
      .pipe(mocha(mochaOpts))
      .on('error', function (e) {
        logger.warn('error in test: %s', e);
      });
});
gulp.task('test-env', function () {
  env.set('test');
});

gulp.task('pre-cov', function () {
  gulp.src('lib/**/*.js')
      .pipe(istanbul(istanbulOpts))
      .pipe(istanbul.hookRequire());
});

var runTestsWithCov = function (opts) {
  gulp.src('test/**/*.js')
      .pipe(mocha(opts))
      .pipe(istanbul.writeReports(istanbulOpts))
      .pipe(istanbul.enforceThresholds(istanbulThresholdOpts));
};

gulp.task('test-cov', ['pre-cov', 'lint', 'test-env'], function () {
  runTestsWithCov(mochaOpts);
});

gulp.task('test-watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('test-debug', ['lint', 'test-env'], function () {
  var gulpjs = path.join(__dirname, 'node_modules/gulp/bin/gulp.js');
  spawn('node', ['--debug-brk', gulpjs, 'test'], {stdio: 'inherit'});
});

gulp.task('test-jenkins', ['pre-cov', 'lint', 'test-env'], function () {
  runTestsWithCov(mochaJenkinsOpts);
});

/**
 * Build and deploy tasks
 */
gulp.task('build-watch', function () {
  gulp.watch(['lib/http/web/assets/**/*', 'bower_components/**/*'], ['build']);
});

gulp.task('build', ['build-fonts', 'build-css', 'build-js'], function () {
  console.log('All assets successfully compiled and copied to public/');
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

gulp.task('compile-scss', function () {});

gulp.task('build-fonts', function () {
  var bootsrapFontsPath = path.join(__dirname, 'bower_components/bootstrap/dist/fonts');
  gulp.src(bootsrapFontsPath).pipe(gulp.dest(publicFontsPath));
});

/**
 * Misc. tasks
 */
gulp.task('clean', function (cb) {
  exec('git clean -Xf && git clean -Xdf', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

// Default Task
gulp.task('default', ['lint', 'test']);
