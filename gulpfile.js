/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser
 *
 */

var gulp   = require('gulp')
    jshint = require('gulp-jshint'),
    mocha  = require('gulp-mocha'),
    cover  = require('gulp-coverage'),
    env    = require('gulp-env'),
    should = require('should');

/**
 * Config variables
 */
var mochaOpts = {reporter: 'spec', globals: {should: should}};

/**
 * Tasks
 */
gulp.task('lint', function() {
    gulp.src(['lib/**/*.js', 'test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test-cov', function () {
    env({vars: {COVERAGE: true}});

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

gulp.task('test', function () {
    gulp.src('test/**/*.js').pipe(mocha(mochaOpts))
});

// Default Task
gulp.task('default', ['lint', 'test']);
