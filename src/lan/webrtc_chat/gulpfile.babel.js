import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import watchify from 'watchify'
import browserify from 'browserify'
import babelify from 'babelify'
import assign from 'lodash.assign'

// https://segmentfault.com/a/1190000003770541

const paths = {
  scripts: {
    src: 'src/**/*.js',
    dest: 'public/js'
  }
}

export function scripts () {
  // add custom browserify options here
  let customOpts = {
    entries: ['./src/app.js'],
    debug: true
  }
  let opts = assign({}, watchify.args, customOpts)
  // set up the browserify instance on a task basis
  let b = watchify(
    browserify(opts).transform(babelify.configure({
      presets: ['env']
    })))

  // add transformations here
  b.transform(babelify)

  return b
    .bundle()
    // log errors if they happen
    // or use gulplog by log.error.bind(log, 'Browserify Error')
    .on('error', function (err) { console.log('Error: ' + err.message) })
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    .pipe(gulp.dest(paths.scripts.dest))

    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))

    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file

    .pipe(gulp.dest(paths.scripts.dest)) // save .min.js
}

const buildAndMove = gulp.series(scripts)
gulp.task('build', buildAndMove)

export function watch () {
  // calls 'build-js' whenever anything changes
  gulp.watch(paths.scripts.src, buildAndMove)
}

const buildAndWatch = gulp.series(buildAndMove, watch)

export default buildAndWatch
