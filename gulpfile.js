var gulp = require('gulp');
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");


gulp.task('babel', function() {
    return gulp.src('src/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
});

gulp.task('minify', function() {
    return gulp.src('dist/WrapChars.js')
    .pipe(rename({extname: '.min.js'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});
