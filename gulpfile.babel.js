'use strict'

/**
 * packages
 */ 
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import nunjucksRender from 'gulp-nunjucks-render';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import del from 'del';
import { create as browserSync_create} from 'browser-sync';
const browserSync = browserSync_create();


/**
 * path
 */ 
const SRC = './src/';
const DIST = './dist/';
const TMP = './tmp/';

const DIR = {
    SCSS : 'assets/scss/',
    CSS : 'assets/css/',
    JS : 'assets/js/',
    IMG : 'assets/img/',
    HTML : 'html/'
};

const EXT = {
    SCSS : '**/*.scss',
    JS : '**/*.js',
    IMG : '**/*.+(png|jpg|jpeg|gif|svg)',
    HTML : '**/*.html',
    NUNJUCKS : '**/*.nunjucks'
};

const PATH = {
    SRC : {
        SCSS : [
            SRC + DIR.SCSS + EXT.SCSS
        ],
        JS : [
            SRC + DIR.JS + 'plugins.js',
            SRC + DIR.JS + 'script.js'
        ],
        JS_VENDOR : [
            SRC + DIR.JS + 'vendor/jquery-3.4.1.min.js'
        ],
        IMG : [
            SRC + DIR.IMG + EXT.IMG
        ],
        HTML : [
            SRC + DIR.HTML + EXT.HTML,
            SRC + DIR.HTML + EXT.NUNJUCKS
        ]
    },
    DIST : {
        CSS : DIST + DIR.CSS,
        JS : DIST + DIR.JS,
        IMG : DIST + DIR.IMG,
        HTML : DIST + DIR.HTML
    },
    TMP : {
        CSS : TMP + DIR.CSS,
        JS : TMP + DIR.JS,
        IMG : TMP + DIR.IMG,
        HTML : TMP + DIR.HTML
    }
};


/**
 * style task
 */
function style() {
    return gulp.src(PATH.SRC.SCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.CSS), gulp.dest(PATH.TMP.CSS)))
        .pipe(browserSync.stream());
}


/**
 * script task
 */
function script() {
    return gulp.src(PATH.SRC.JS)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
        .pipe(sourcemaps.write())
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.JS), gulp.dest(PATH.TMP.JS)))
        .pipe(browserSync.stream());
}
function script_vendor() {
    return gulp.src(PATH.SRC.JS_VENDOR)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.JS), gulp.dest(PATH.TMP.JS)))
        .pipe(browserSync.stream());
}


/**
 * html task
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
 * image task
 */
function image() {
    return gulp.src(PATH.SRC.IMG)
        .pipe(imagemin())
        .pipe(gulpif(process.env.NODE_ENV === 'production', gulp.dest(PATH.DIST.IMG), gulp.dest(PATH.TMP.IMG)))
        .pipe(browserSync.stream());
}


/**
 * watch task
 */
function watch() {
    gulp.watch(PATH.SRC.HTML, html);
    gulp.watch(PATH.SRC.SCSS, style);
    gulp.watch(PATH.SRC.JS, script);
    gulp.watch(PATH.SRC.JS_VENDOR, script_vendor);
    gulp.watch(PATH.SRC.IMG, image);
}


/**
 * serve task
 */
function serve(done) {
    browserSync.init({
        port: 8080,
        server: {
            baseDir: TMP,
            // index: DIR.HTML + 'index.html'
        },
        //open: false
    });
    done();
}
function serveReload(done) {
    browserSync.reload();
    done();
}


/**
 * clean task
 */
function clean() {
    return del([TMP, DIST]);
}


/**
 * define task
 */
const js = gulp.series(script, script_vendor); 
const dev = gulp.series(clean, gulp.parallel(style, js, image, html), gulp.parallel(watch, serve));
const prod = gulp.series(clean, gulp.parallel(style, js, image, html));


/**
 * exports task
 */
exports.dev = dev;
exports.prod = prod;
exports.default = dev;
