
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const nunjucksRender = require('gulp-nunjucks-render');
const browserSync = require('browser-sync').create();


/**
 * PATH
 */
const SRC = './src/';
const DIST = './dist/';
const TMP = './tmp/';

const DIR = {
    SCSS : 'assets/scss/',
    CSS : 'assets/css/',
    JS : 'assets/js/',
    IMG : 'assets/img/',
    HTML : 'html/',
};

const EXT = {
    SCSS : '**/*.scss',
    JS : '**/*.js',
    IMG : '**/*.+(png|jpg|jpeg|gif|svg)',
    HTML : '**/*.html',
    NJK : '**/*.njk',
};

const PATH = {
    SRC : {
        SCSS : [
            SRC + DIR.SCSS + EXT.SCSS
        ],
        JS_VENDORS : [
            SRC + DIR.JS + 'vendors/jquery-3.6.0.min.js',
        ],
        JS : [
            SRC + DIR.JS + 'ui.js',
        ],
        IMG : [
            SRC + DIR.IMG + EXT.IMG
        ],
        HTML : [
            SRC + DIR.HTML + EXT.HTML,
            SRC + DIR.HTML + EXT.NJK
        ],
    },
    DIST : {
        CSS : DIST + DIR.CSS,
        JS : DIST + DIR.JS,
        IMG : DIST + DIR.IMG,
        HTML : DIST + DIR.HTML,
    },
    TMP : {
        CSS : TMP + DIR.CSS,
        JS : TMP + DIR.JS,
        IMG : TMP + DIR.IMG,
        HTML : TMP + DIR.HTML,
    },
};


/**
 * CLEAN TASK
 */
function clean() {
    return del([DIST, TMP]);
}


/**
 * CSS TASK
 */
function css() {
    return gulp.src(PATH.SRC.SCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.CSS), gulp.dest(PATH.TMP.CSS)))
        .pipe(browserSync.stream());
}


/**
 * SCRIPT_VENDORS TASK
 */
 function script_vendors() {
    return gulp.src(PATH.SRC.JS_VENDORS)
        .pipe(concat('vendors.js'))
        .pipe(uglify())
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.JS), gulp.dest(PATH.TMP.JS)))
        .pipe(browserSync.stream());
}


/**
 * SCRIPT TASK
 */
function script() {
    return gulp.src(PATH.SRC.JS)
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.JS), gulp.dest(PATH.TMP.JS)))
        .pipe(browserSync.stream());
}


/**
 * IMAGE TASK
 */
 function image() {
    return gulp.src(PATH.SRC.IMG)
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.IMG), gulp.dest(PATH.TMP.IMG)))
        .pipe(browserSync.stream());
}


/**
 * HTML TASK
 */
 function html() {
    return gulp.src(PATH.SRC.HTML)
        .pipe(nunjucksRender({
            path: [SRC + DIR.HTML]
        }))
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.HTML), gulp.dest(PATH.TMP.HTML)))
        .pipe(browserSync.stream());
}


/**
 * SERVE TASK
 */
function serve() {
    return browserSync.init({
        port: 8080,
        server: {
            baseDir: PATH.TMP.HTML,
            // baseDir: TMP,
            // index: DIR.HTML + 'index.html',
        },
        // open: false,
    });
}


/**
 * WATCH TASK
 */
 function watch() {
    gulp.watch(PATH.SRC.HTML, html);
    gulp.watch(PATH.SRC.SCSS, css);
    gulp.watch(PATH.SRC.JS, script);
    gulp.watch(PATH.SRC.JS_VENDORS, script_vendors);
    gulp.watch(PATH.SRC.IMG, image);
}


/**
 * EXPORTS
 */
const dev = gulp.series(clean, gulp.parallel(css, script_vendors, script, image, html), gulp.parallel(watch, serve));
const prod = gulp.series(clean, gulp.parallel(css, script_vendors, script, image, html));

exports.prod = prod;
exports.dev = dev;
exports.default = dev;