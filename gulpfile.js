/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

var gulp   = require('gulp')
    jshint = require('gulp-jshint'),
    mocha  = require('gulp-mocha'),
    cover  = require('gulp-coverage'),
    exec   = require('child_process').exec;

/**
 * Config variables
 */
var mochaOpts        = {reporter: 'spec'}
    mochaJenkinsOpts = {reporter: 'mocha-jenkins-reporter'};

/**
 * Tasks
 */
gulp.task('lint', function() {
    gulp.src(['lib/**/*.js', 'test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
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

gulp.task('test-jenkins', function () {
    gulp.src('test/**/*.js').pipe(mocha(mochaJenkinsOpts));
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
