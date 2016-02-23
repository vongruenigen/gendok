// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint'),
    mocha  = require('gulp-mocha'),
    should = require('should');

// Config variables
var mochaOpts = {reporter: 'spec', globals: {should: should}};

// Lint Tasks
gulp.task('lint', function() {
  gulp.src(['lib/**/*.js', 'test/**/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('test', function () {
  gulp.src('test/**/*.js').pipe(mocha(mochaOpts));
});

// Default Task
gulp.task('default', ['lint', 'test']);
