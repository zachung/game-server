var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var watchify = require('watchify')
var browserify = require('browserify')
var babelify = require('babelify')
var assign = require('lodash.assign')

var jsDir = 'public/js'
var pubDir = '../../../public/games/brick-breaker'

// https://segmentfault.com/a/1190000003770541

gulp.task('js', function () {
  // add custom browserify options here
  var customOpts = {
    entries: ['./src/app.js'],
    debug: true
  }
  var opts = assign({}, watchify.args, customOpts)
  // set up the browserify instance on a task basis
  var b = watchify(
    browserify(opts).transform(babelify.configure({
      presets: ['env']
    })))

  // add transformations here
  b.transform(babelify)

  b
    .bundle()
    // log errors if they happen
    // or use gulplog by log.error.bind(log, 'Browserify Error')
    .on('error', function (err) { console.log('Error: ' + err.message) })
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    .pipe(gulp.dest(jsDir))

    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))

    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file

    .pipe(gulp.dest(jsDir)) // save .min.js

  // move all public files to parent
  return gulp
    .src(['public/**/*'])
    .pipe(gulp.dest(pubDir))
})

gulp.task('watch', function () {
  // calls 'build-js' whenever anything changes
  gulp.watch('src/**/*.js', ['js'])
})

gulp.task('default', ['js', 'watch'])
