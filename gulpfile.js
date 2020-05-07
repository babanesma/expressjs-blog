const gulp = require('gulp');
const concat = require('gulp-concat');
const path = require('path');
const fs = require('fs-extra');
const cleanCss = require('gulp-clean-css');
const rev = require('gulp-rev');

let basePath = path.resolve(__dirname);

async function clean() {
    await fs.remove(basePath + '/public/build');
}

async function packVendorJs() {
    await gulp.src([
        basePath + '/node_modules/jquery/dist/jquery.min.js',
        basePath + '/node_modules/popper.js/dist/umd/popper.min.js',
        basePath + '/node_modules/bootstrap/dist/js/bootstrap.min.js',
        basePath + '/node_modules/@fortawesome/fontawesome-free/js/all.min.js',
        basePath + '/node_modules/highlightjs/highlight.pack.min.js',
        basePath + '/node_modules/bootstrap-markdown-editor-4/dist/js/bootstrap-markdown-editor.min.js'
    ]).pipe(concat('vendor.js'))
        .pipe(rev())
        .pipe(gulp.dest('public/build/js'))
        .pipe(rev.manifest('public/build/rev-manifest.json', {
            merge: true
        }))
        .pipe(gulp.dest('.'));
};

async function packVendorCss() {
    await gulp.src([
        basePath + '/node_modules/@fortawesome/fontawesome-free/css/all.min.css',
        basePath + '/node_modules/bootstrap/dist/css/bootstrap.min.css',
        basePath + '/node_modules/highlightjs/styles/default.css',
        basePath + '/node_modules/bootstrap-markdown-editor-4/dist/css/bootstrap-markdown-editor.min.css'
    ]).pipe(concat('vendor.css'))
        .pipe(cleanCss())
        .pipe(rev())
        .pipe(gulp.dest('public/build/css'))
        .pipe(rev.manifest('public/build/rev-manifest.json', {
            merge: true
        }))
        .pipe(gulp.dest('.'));

    await gulp.src(basePath + '/node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
        .pipe(gulp.dest('public/build/webfonts'));
};

async function packAppCss() {
    await gulp.src([
        basePath + '/assets/css/style.css',
    ]).pipe(concat('app.css'))
        .pipe(gulp.dest('public/build/css'));
}

exports.default = gulp.series(clean, packVendorJs, packVendorCss, packAppCss);