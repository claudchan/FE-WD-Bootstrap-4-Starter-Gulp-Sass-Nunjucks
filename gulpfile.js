/*
  Gulp tasks
  ==========
  gulp
  gulp build
  gulp build:serve
*/

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  config = require('./config.json'),
  postcss = require('gulp-postcss'),
  cssnano = require('cssnano'),
  autoprefixer = require('autoprefixer'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,
  concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  rename = require('gulp-rename'),
  del = require('del'),
  nunjucksRender = require('gulp-nunjucks-render'),
  htmlreplace = require('gulp-html-replace'),
  replace = require('gulp-replace');

// BrowserSync tasks
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: config.path.src + 'html/'
    },
    notify: false,
    ghostMode: false
  });
});

// Scripts tasks
gulp.task('scripts:vendors', function () {
  return gulp.src(config.jsConcatFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('vendors.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + 'html/js/'));
});
gulp.task('scripts:vendors:min', ['scripts:vendors'], function () {
  return gulp.src(config.path.src + 'html/js/vendors.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + 'html/js/'));
});
gulp.task('scripts:app', function () {
  return gulp.src(config.path.src + 'html/js/app.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + 'html/js/'));
});
gulp.task('scripts', ['scripts:vendors', 'scripts:vendors:min', 'scripts:app']);

// Styles tasks
gulp.task('styles', function () {
  return gulp.src(config.path.src + 'sass/app.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions']
      })
    ]))
    .pipe(gulp.dest(config.path.src + 'html/css'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      cssnano
    ]))
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + 'html/css'));
});

// Nunjucks tasks
// task to render html
gulp.task('nunjucks', function () {
  return gulp.src(config.path.src + 'templates/pages/**/*.+(html|nunjucks)')
    .pipe(plumber())
    // Renders template with nunjucks
    .pipe(
      nunjucksRender({
        path: [config.path.src + 'templates/']
      })
    )
    // Output files in app folder
    .pipe(gulp.dest(config.path.src + 'html/'));
});

// Build tasks
// task to clean out all files and folders from build folder
gulp.task('build:clean', ['nunjucks', 'scripts:vendors', 'scripts:vendors:min', 'scripts:app', 'styles'], function () {
  return del([
    config.path.build + '**'
  ]);
});

// task to create build directory of all files
gulp.task('build:copy', ['build:clean'], function () {
  return gulp.src(config.buildFilesFoldersCopy)
    .pipe(gulp.dest(config.path.build));
});

// task to removed unwanted build files
gulp.task('build:remove', ['build:copy'], function () {
  return del(config.buildFilesFoldersRemove);
});

// task to replace paths
gulp.task('build:html', ['build:remove'], function () {
  return gulp.src(config.path.build + '/**/*.html')
    // .pipe(htmlreplace({
    //     'app-css': {
    //       src: [['css', 'app.min.css']],
    //       tpl: '<link rel="stylesheet" href="%s/%s">'
    //     },
    //     'app-js': {
    //       src: [['js', 'app.min.js']],
    //       tpl: '<script src="%s/%s"></script>'
    //     }
    // }, {
    //   keepUnassigned: false,
    //   keepBlockTags: false,
    //   resolvePaths: false
    // }))
    .pipe(replace('app.css', 'app.min.css'))
    .pipe(replace('app.js', 'app.min.js'))
    .pipe(replace('<!-- build:app-css -->', ''))
    .pipe(replace('<!-- build:app-js -->', ''))
    .pipe(replace('<!-- endbuild -->', ''))
    .pipe(gulp.dest(config.path.build));
});

gulp.task('build', ['build:html']);

// task to run build server for testing final app
gulp.task('build:serve', function () {
  browserSync.init({
    server: {
      baseDir: config.path.build
    }
  });
});

// Watch tasks
gulp.task('watch', function () {
  gulp.watch(config.path.src + 'templates/**/*.+(html|nunjucks)', ['nunjucks']);
  gulp.watch(config.path.src + 'sass/**/*.scss', ['waitForStyles']);
  gulp.watch(config.path.src + 'html/js/vendors/**/*.js', ['waitForVendors']);
  gulp.watch(config.path.src + 'html/js/app.js', ['waitForScripts']);
  gulp.watch(config.path.src + 'html/**/*.+(html)', ['waitForHTML']);
});

gulp.task('waitForStyles', ['styles'], function() {
  return gulp.src(config.path.src + 'html/css/*.css')
    .pipe(browserSync.stream());
});

gulp.task('waitForVendors', ['scripts:vendors', 'scripts:vendors:min'], function() {
  browserSync.reload();
});

gulp.task('waitForScripts', ['scripts:app'], function() {
  browserSync.reload();
});

gulp.task('waitForHTML', function() {
  return gulp.src(config.path.src + 'html/**/*.html')
    .pipe(
      watch(
        config.path.src + 'html/**/*.+(html)'
      )
    )
    .pipe(plumber())
    .pipe(browserSync.stream());
});

// Gulp default
gulp.task('default', ['browserSync', 'scripts', 'styles', 'nunjucks', 'watch']);

