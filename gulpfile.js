const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();



/*--     автоматическое обновления страницы в браузере     --*/
function browsersync() {
    browserSync.init({
        server: {
            baseDir: './app'
        },
        notofy: false
    })
}


/*--     преоброзования scss  в css     --*/
function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))     /*-- стиль переноса стилей (минификация файла стилей)--*/
        .pipe(concat('style.min.css'))     /*--  переименования файла со стилями в нужный через плагин gulp-concat    --*/
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],  /*--   кроссбраунерность с помощью аутопрефиксор    --*/
            grid: true
        }))
        .pipe(dest('app/css'))     /*--  место куда все сохраняется    --*/
        .pipe(browserSync.stream())  /*--  добавления стилей без перезагрузки страницы   --*/
}


/*--   функция для собирания всех файлов JS в один    --*/
function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/mixitup/dist/mixitup.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())       /*--  минификация файла js    --*/
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


/*--   функция сжатия картинок   --*/
function images() {
    return src('app/images/**/*.*')     /*--   качество сжатия картинок   --*/
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}


/*--   перенос файлов проекта в конечный  --*/
function build() {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js'
    ], { base: 'app' })      /*--   чтоб файлы переносились в папками где они находятся  --*/
    .pipe(dest('dist'))
}


/*--   очистка файла dist  --*/
function cleanDist() {
    return del('dist')
}


/*--   автоматизация преобразования  --*/
function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}




exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build); /*--   запуск команд по очереди  --*/


exports.default = parallel(styles, scripts, browsersync, watching); /*--   запуск команд паралельно  --*/