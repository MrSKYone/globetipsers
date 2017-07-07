var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');

/* Task to compile sass */
gulp.task('sass', function () {
  return gulp.src('./app-data/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./app/css/'));
});
 
 /* Task to watch sass changes */
gulp.task('sass:watch', function () {
  gulp.watch('./app-data/sass/**/*.scss', ['sass']);
});

/* Task when running `gulp` from terminal */
gulp.task('default', ['sass', 'sass:watch']);