var gulp          = require('gulp');
var runSequence = require('run-sequence');
var less          = require('gulp-less');
var LessAutoprefix = require('less-plugin-autoprefix');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
var notify        = require('gulp-notify');
var source        = require('vinyl-source-stream');
var browserify    = require('browserify');
var babelify      = require('babelify');
var ngAnnotate    = require('browserify-ngannotate');
var browserSync   = require('browser-sync').create();
var rename        = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var uglify        = require('gulp-uglify');
var merge         = require('merge-stream');
const del = require('del');

// Where our files are located
var jsFiles   = "src/app/**/*.js";
var viewFiles = "src/app/**/*.html";
var styleFiles = "src/app/**/*.less";

var interceptErrors = function(error) {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};


gulp.task('browserify', ['views'], function() {
  return browserify('./src/app/app.js')
      .transform(babelify, {presets: ["es2015"]})
      .transform(ngAnnotate)
      .bundle()
      .on('error', notify.onError(function(err){
        return {
          title: 'Browserify_Task Error',
          message: err.message
        };
      }))
      .pipe(source('main.js'))
      // Start piping stream to tasks!
      .pipe(gulp.dest('./build/'));
});

gulp.task('html', function() {
  return gulp.src("src/index.html")
      .on('error', interceptErrors)
      .pipe(gulp.dest('./build/'));
});

gulp.task('styles', function() {
  return gulp.src(styleFiles)
      .pipe(less({
        plugins: [autoprefix]
      }))
      .pipe(concat('all.min.css'))
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .on('error', notify.onError(function(err){
        return {
          title: 'Styles_Task Error',
          message: err.message
        };
      }))
      .pipe(gulp.dest('./build/'));
});

gulp.task('views', function() {
  return gulp.src(viewFiles)
      .pipe(templateCache({
        standalone: true
      }))
      .on('error', notify.onError(function(err){
        return {
          title: 'Views_Task Error',
          message: err.message
        };
      }))
      .pipe(rename("app.templates.js"))
      .pipe(gulp.dest('./src/app/config/'));
});

gulp.task('clean', function(cb) {
  return  del(['build'], cb);
});


// This task is used for building production ready
// minified JS/CSS files into the dist/ folder
gulp.task('build', ['html', 'browserify'], function() {
  var html = gulp.src("build/index.html")
                 .pipe(gulp.dest('./dist/'));

  var js = gulp.src("build/main.js")
               .pipe(uglify())
               .pipe(gulp.dest('./dist/'));

  return merge(html,js);
});

  gulp.task('default', function(done) {
    runSequence('clean', 'html', 'styles', 'browserify', function() {
      browserSync.init(['./build/**/**.**'], {
        server: "./build",
        port: 4000,
        notify: true,
        ui: {
          port: 4001
        }
    });
      done();
  });

  gulp.watch("src/index.html", ['html']);
  gulp.watch(viewFiles, ['views']);
  gulp.watch(styleFiles, ['styles']);
  gulp.watch(jsFiles, ['browserify']);
});
