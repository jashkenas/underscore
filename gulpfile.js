var gulp = require('gulp');
var qunit = require('gulp-qunit');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var docco = require('docco');

gulp.task('test', function() {
  gulp.src('./test/index.html')
    .pipe(qunit());
});

gulp.task('lint', function() {
  gulp.src(['underscore.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('build', function() {
  gulp.src('underscore.js')
    .pipe(sourcemaps.init())
      .pipe(uglify({
        compress: {
          evaluate: false
        },
        preserveComments: function (node, comment) {
          // Preserve copyright notice
          return comment.line < 5;
        },
        mangle: true
      }))
    .pipe(rename('underscore-min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./'));
});

gulp.task('doc', function() {
  docco.document({
    args: ['underscore.js']
  });
});

gulp.task('default', ['lint', 'test', 'build', 'doc']);
