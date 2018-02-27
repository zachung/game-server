'use strict';

var browserify = require('browserify')
  , es6ify = require('es6ify')
  , gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , sourcemaps = require('gulp-sourcemaps')
  , log = require('gulplog')
  , source = require('vinyl-source-stream')
  , buffer = require('vinyl-buffer')

gulp.task('watch', function () {
    gulp.watch('./src/**', ['javascript']);
});

gulp.task('javascript', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    debug: true
  })
  .add(es6ify.runtime)
  .transform(es6ify)
  .require(require.resolve('./src/main.js'), { entry: true });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js/'));
});
gulp.task('default',['watch']);