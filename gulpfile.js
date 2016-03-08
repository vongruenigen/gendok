/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gulp       = require('gulp'),
    path       = require('path'),
    jshint     = require('gulp-jshint'),
    mocha      = require('gulp-mocha'),
    cover      = require('gulp-coverage'),
    istanbul   = require('gulp-istanbul'),
    checkstyle = require('gulp-jshint-checkstyle-reporter'),
    jscs       = require('gulp-jscs'),
    spawn      = require('child_process').spawn,
    logger     = require('./lib/').logger,
    env        = require('./lib/').env,
    exec       = require('child_process').exec;

/**
 * Config variables
 */
var mochaOpts             = {reporter: 'spec'},
    mochaJenkinsOpts      = {reporter: 'mocha-jenkins-reporter'},
    istanbulOpts          = {dir: './reports', reporters: ['html', 'clover']},
    istanbulThresholdOpts = {thresholds: {global: 90}};

/**
 * Tasks
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

gulp.task('test-env', function () {
  env.set('test');
});

gulp.task('test', ['lint', 'test-env'], function () {
  gulp.src('test/**/*.js')
      .pipe(mocha(mochaOpts))
      .on('error', function (e) {
        logger.warn('error in test: %s', e);
      });
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

gulp.task('clean', function (cb) {
  exec('git clean -Xf && git clean -Xdf', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

// Default Task
gulp.task('default', ['lint', 'test']);
