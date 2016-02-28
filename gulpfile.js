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
    exec       = require('child_process').exec;

/**
 * Config variables
 */
var mochaOpts        = {reporter: 'spec'},
    mochaJenkinsOpts = {reporter: 'mocha-jenkins-reporter'},
    istanbulOpts     = {dir: './reports', reporters: ['html', 'clover']};

/**
 * Tasks
 */
gulp.task('lint', function() {
    gulp.src(['lib/**/*.js', 'test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('lint-jenkins', function () {
    gulp.src(['lib/**/*.js', 'test/**/*.js'])
        .pipe(jshint())
        .pipe(checkstyle())
        .pipe(gulp.dest('reports'));
});

gulp.task('test', function () {
    gulp.src('test/**/*.js').pipe(mocha(mochaOpts));
});

gulp.task('test-cov', function () {
    gulp.src('test/**/*.js')
        .pipe(cover.instrument({
            pattern: ['lib/**/*.js'],
            debugDirectory: 'debug'
        }))
        .pipe(mocha(mochaOpts))
        .pipe(cover.gather())
        .pipe(cover.format())
        .pipe(gulp.dest('reports'));
});

gulp.task('pre-test-jenkins', ['lint-jenkins'], function () {
    gulp.src('lib/**/*.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test-jenkins', ['pre-test-jenkins'], function () {
    gulp.src('test/**/*.js')
        .pipe(mocha(mochaJenkinsOpts))
        .pipe(istanbul.writeReports(istanbulOpts))
        .pipe(istanbul.enforceThresholds({thresholds: {global: 90}}));;
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
