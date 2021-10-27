const gulp = require('gulp');
const { src, dest, series, parallel } = require('gulp');
const del = require('del');
const config = require('./config.json');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const browsersync = require("browser-sync").create();
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const nunjucksRender = require('gulp-nunjucks-render');
const replace = require('gulp-replace');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: config.path.src + 'html/'
    },
    notify: false,
    ghostMode: false
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
// function clean() {
//   return del(["./_site/assets/"]);
// }

// CSS task
function css(cb) {
  return gulp.src(config.path.src + 'sass/app.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest(config.path.src + 'html/css'))
    .pipe(postcss([ cssnano() ]))
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.path.src + 'html/css'))
    .pipe(browsersync.stream());
  cb();
}

// Vendors task
function vendors(cb) {
  return gulp.src(config.jsConcatFiles)
    .pipe(plumber())
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(config.path.src + 'html/js/'))
    .pipe(terser())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.path.src + 'html/js/'))
    .pipe(browsersync.stream());
  cb();
}

// Scripts task
function scripts(cb) {
  return gulp.src(config.path.src + 'html/js/app.js')
    .pipe(plumber())
    .pipe(terser())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.path.src + 'html/js/'))
    .pipe(browsersync.stream());
  cb();
}

// Nunjucks task
function nunjucks(cb) {
  return gulp.src(config.path.src + 'templates/pages/**/*.+(html|nunjucks)')
    .pipe(plumber())
    .pipe(
      nunjucksRender({
        path: [config.path.src + 'templates/']
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.path.src + 'html/'))
    .pipe(browsersync.stream());
  cb();
}

// Watch files
function watchFiles() {
  gulp.watch(config.path.src + 'sass/**/*.scss', gulp.series(css, browserSyncReload));
  gulp.watch(config.path.src + 'html/js/vendors/**/*.js', gulp.series(vendors, browserSyncReload));
  gulp.watch(config.path.src + 'html/js/app.js', gulp.series(gulp.parallel(vendors, scripts), browserSyncReload));
  gulp.watch(config.path.src + 'templates/**/*.+(html|nunjucks)', gulp.series(nunjucks, browserSyncReload));
}

// Build task
function clean(done) {
  return del([config.path.build + '**']);
  done();
}
function copy(done) {
  return gulp.src(config.buildFilesFoldersCopy)
    .pipe(gulp.dest(config.path.build));
  done();
}
function clear(done) {
  return del(config.buildFilesFoldersRemove);
  done();
}
function htmlcleanup(done) {
  return gulp.src(config.path.build + '/**/*.html')
    .pipe(replace('app.css', 'app.min.css'))
    .pipe(replace('app.js', 'app.min.js'))
    .pipe(replace('<!-- build:app-css -->', ''))
    .pipe(replace('<!-- build:app-js -->', ''))
    .pipe(replace('<!-- endbuild -->', ''))
    .pipe(gulp.dest(config.path.build));
  done();
}

// define complex tasks
const js = gulp.series(vendors, scripts);
const build = gulp.series(gulp.parallel(css, vendors, scripts, nunjucks), clean, copy, clear, htmlcleanup);
const watch = gulp.parallel(watchFiles, browserSync);

exports.css = css;
exports.vendors = vendors;
exports.scripts = scripts;
exports.nunjucks = nunjucks;
exports.js = js;
exports.clean = clean;
exports.copy = copy;
exports.clear = clear;
exports.htmlcleanup = htmlcleanup;
exports.build = build;
exports.watch = watch;
exports.default = series(css, vendors, scripts, nunjucks, watch);