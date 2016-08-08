var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('default', function() {
    gulp.src('dist/jsonrpc2.js')
        .pipe(uglify({mangle: false}))
        .pipe(rename('jsonrpc2.min.js'))
        .pipe(gulp.dest('dist'));
});
