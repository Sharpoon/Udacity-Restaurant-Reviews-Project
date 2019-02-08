/*eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const responsive = require('gulp-responsive');



function scripts(done) {
    gulp.src('src/js/*.js')
    // .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'));
    done();
}


function scriptsCommon(done) {
    gulp.src('src/js/common/*.js')
        .pipe(concat('common.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
    done();
}


function styles(done) {
    gulp.src('src/sass/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'));
    done();

}

function responsiveImageIcons() {
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

}

function responsiveImages() {
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
                    quality: 20
                },
                {
                    width: 270,
                    rename: {suffix: '-270', extname: '.webp'}
                },
                {
                    width: 400,
                    rename: {suffix: '-400', extname: '.webp'}
                },
                {
                    width: 650,
                    rename: {suffix: '-650', extname: '.webp'}
                },
                {
                    width: 800,
                    rename: {extname: '.webp'},
                    quality: 20
                }
            ]
        }, {quality: 50}))
        .pipe(gulp.dest('dist/img'));
}

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('scripts-common', scriptsCommon);
gulp.task('responsive-image-icons', responsiveImageIcons);
gulp.task('responsive-images', responsiveImages);
gulp.task('default', gulp.parallel(styles, scripts, scriptsCommon, responsiveImages, responsiveImageIcons));
gulp.task('watch', watch);

function watch() {
    gulp.watch('src/sass/*.scss', styles);
    gulp.watch('src/js/*.js', scripts);
    gulp.watch('src/js/common/*.js', scriptsCommon);


}
