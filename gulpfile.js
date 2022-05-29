var gulp = require('gulp');

var babel = require("gulp-babel");
var gzip = require("gulp-gzip");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");



gulp.task('build:js', function() {
    return gulp.src('./src/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dist'))
    .pipe(rename({extname: '.min.js'}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
    .pipe(gzip())
    .pipe(gulp.dest('./dist'))
});
gulp.task('build:mjs', function() {
    return gulp.src('./src/*.mjs')
    .pipe(babel())
    .pipe(gulp.dest('./dist'))
    .pipe(rename({extname: '.min.mjs'}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
    .pipe(gzip())
    .pipe(gulp.dest('./dist'))
});
