/*eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const responsive = require('gulp-responsive');

gulp.task('default', ['styles', 'scripts', 'scripts-common']);

gulp.task('watch', ['styles', 'scripts', 'scripts-common'], function () {
    gulp.watch('src/sass/*.scss', ['styles']);
    gulp.watch('src/js/*.js', ['scripts']);
    gulp.watch('src/js/common/*.js', ['scripts-common']);


});


gulp.task('scripts', function () {
    gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'));
});


gulp.task('scripts-common', function () {
    gulp.src('src/js/common/*.js')
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});


gulp.task('styles', function () {
    gulp.src('src/sass/styles.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'))

});

gulp.task('responsive-image-icons', function () {
    return gulp.src('src/img/icons/*.{png,jpg}')
        .pipe(responsive({
            // produce multiple images from one source
            'restaurant-reviews.png': [
                {
                    width: 48,
                    rename: {suffix: '-48'}
                },
                {
                    width: 96,
                    rename: {suffix: '-96'}
                },
                {
                    width: 144,
                    rename: {suffix: '-144'}
                },
                {
                    width: 192,
                    rename: {suffix: '-192'}
                },
                {
                    width: 256,
                    rename: {suffix: '-256'}
                },
                {
                    width: 384,
                    rename: {suffix: '-384'}
                },
                {
                    width: 512,
                    rename: {suffix: '-512'}
                },
            ]
        }))
        .pipe(gulp.dest('dist/img/icons'));
});
gulp.task('responsive-images', function () {
    return gulp.src('src/img/*.{png,jpg}')
        .pipe(responsive({
            // produce multiple images from one source
            '*': [
                {
                    width: 270,
                    rename: {suffix: '-270'}
                },
                {
                    width: 400,
                    rename: {suffix: '-400'}
                },
                {
                    width: 650,
                    rename: {suffix: '-650'}
                },
                {
                    width: 800,
                }
            ]
        }, {quality: 50}))
        .pipe(gulp.dest('dist/img'));
});



