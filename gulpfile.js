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
    jshint     = require('gulp-jshint'),
    mocha      = require('gulp-mocha'),
    cover      = require('gulp-coverage'),
    istanbul   = require('gulp-istanbul'),
    checkstyle = require('gulp-jshint-checkstyle-reporter'),
    jscs       = require('gulp-jscs'),
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
gulp.task('lint', function () {
    return gulp.src(['lib/**/*.js', 'test/**/*.js'])
               .pipe(jshint())
               .pipe(jshint.reporter('jshint-stylish'))
               .pipe(jshint.reporter('fail'))
               .pipe(checkstyle())
               .pipe(gulp.dest('reports'));
});

gulp.task('format-code', function () {
  gulp.src(['lib/**/*.js', 'test/**/*.js'])
      .pipe(jscs({fix: true}))
      .pipe(jscs.reporter());
});

gulp.task('test', ['lint'], function () {
    gulp.src('test/**/*.js').pipe(mocha(mochaOpts));
});

gulp.task('pre-cov', function () {
    gulp.src('lib/**/*.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

var runTestsWithCov = function (opts) {
    gulp.src('test/**/*.js')
        .pipe(mocha(opts))
        .pipe(istanbul.writeReports(istanbulOpts))
        .pipe(istanbul.enforceThresholds(istanbulThresholdOpts));
};

gulp.task('test-cov', ['pre-cov', 'lint'], function () {
    runTestsWithCov(mochaOpts);
});

gulp.task('test-jenkins', ['pre-cov', 'lint'], function () {
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
