// GULP
const {
    src,
    dest,
    series,
    watch
  } = require('gulp');

// SERVICES
//const path = require('path');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
const del = require('del');
const fileInclude = require('gulp-file-include');
const plumber = require('gulp-plumber');
const rename = require("gulp-rename");
const replace = require('gulp-replace');

// SERVER
const browserSync = require('browser-sync').create();

// HTML
const htmlMin = require('gulp-htmlmin');

// PUG
const gulpPug = require("gulp-pug");

// CSS
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const scss = require("gulp-sass")(require('sass'));

// IMAGES
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');

// SVG
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');

// JS
const webpackStream = require('webpack-stream');
/**
*
* INSTALL IF NEED VUE.JS
* const { VueLoaderPlugin } = require('vue-loader');
*
**/

// CONFIG
const { PATHS, BUILD_PATH } = require('./gulp.config');
let { isProd, isHtmlMin, isPugEnabled, isVueEnabled } = require('./gulp.config');

const toProd = (done) => {
  isProd = true;
  done();
};

const htmlMinify = (done) => {
   isHtmlMin = true;
   done();
}

// WEBPACK CONFIG

let webpackPlugins = [];
let webpackRules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: [
                ['@babel/preset-env', {
                    targets: "defaults"
                }]
            ],
        }
    }
  }
]

if(isVueEnabled) {
  webpackPlugins.push(new VueLoaderPlugin());
  webpackRules.push({ test: /\.vue$/, loader: 'vue-loader' })
}

// GULP-TASKS

const clean = () => {
    return del(BUILD_PATH)
}

const fonts = () => {
  return src([PATHS.fonts.src])
  .pipe(dest(PATHS.fonts.dest));
}

const html = () => {
    return src(PATHS.html.src)
      .pipe(fileInclude({
        prefix: '@',
        basepath: '@file'
      }))
      .pipe(dest(PATHS.html.dest))
      .pipe(gulpif(isHtmlMin,
        htmlMin({
          collapseWhitespace: true
        })
      ))
      .pipe(gulpif(isHtmlMin,
        rename(function (path) {
          path.extname = PATHS.html.minifiedFileExt;
        })
      ))
      .pipe(gulpif(isHtmlMin,
        dest(PATHS.html.dest)
      ))
      .pipe(browserSync.stream());
}

const pug = () => {
  return src([PATHS.pug.src])
    .pipe(plumber())
    .pipe(gulpPug({
      pretty: true
    }))
    .pipe(dest(PATHS.pug.dest))
    .pipe(gulpif(isHtmlMin,
      htmlMin({
        collapseWhitespace: true
      })
    ))
    .pipe(gulpif(isHtmlMin,
      rename(function (path) {
        path.extname = PATHS.pug.minifiedFileExt;
      })
    ))
    .pipe(gulpif(isHtmlMin,
      dest(PATHS.pug.dest)
    ));
};

const styles = () => {
  return src(PATHS.styles.src, { sourcemaps: !isProd })
    .pipe(plumber(
      notify.onError({
        title: "SCSS",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(scss())
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(gulpif(isProd, cleanCss({
      level: 2
    })))
    .pipe(dest(PATHS.styles.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};

const js = () => {
  return src(PATHS.scripts.src)
    .pipe(plumber(
        notify.onError({
            title: "JS",
            message: "Error: <%= error.message %>"
        })
    ))
    .pipe(webpackStream({
        mode: isProd ? 'production' : 'development',
        output: {
            filename: './bundle.js',
        },
        module: {
            rules: webpackRules
        },
        plugins: webpackPlugins,
        devtool: 'source-map'
    }))
    .on('error', function (err) {
        console.error('WEBPACK ERROR', err);
        this.emit('end');
    })
    .pipe(dest(PATHS.scripts.dest))
    .pipe(browserSync.stream());
}

const resources = () => {
    return src(PATHS.resources.src)
      .pipe(dest(PATHS.resources.dest))
}

const sprite = () => {
  return src(PATHS.sprite.src)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true
        },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(plumber())
    .pipe(svgSprite({
      mode: {
        stack: {
          symbol: true, // Activate the «symbol» mode*/
          sprite: PATHS.sprite.spriteFileName,
          dest: ''
        },
      },
    }))
    .pipe(dest(PATHS.sprite.dest));
}

const svg = () => {
  return src(PATHS.svg.src)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(dest(PATHS.svg.dest));
}

const images = () => {
  return src(PATHS.images.src)
  .pipe(gulpif(isProd, imagemin([
    imagemin.mozjpeg({
      quality: 80,
      progressive: true
    }),
    imagemin.optipng({
      optimizationLevel: 2
    }),
  ])))
  .pipe(dest(PATHS.images.dest))
}

const toWebp = () => {
  return src(PATHS.images.src)
    .pipe(webp())
    .pipe(dest(PATHS.images.dest))
};

const server = () => {
    browserSync.init({
      server: {
        baseDir: BUILD_PATH,
        open: true,
        cors: true,
        port: 3000
      },
    });

    isPugEnabled ? watch(PATHS.pug.watchSrc, series(pug, refresh)) : watch(PATHS.html.watchSrc, series(html, refresh));
    watch(PATHS.styles.watchSrc, series(styles, refresh));
    watch(PATHS.scripts.watchSrc, series(js, refresh));
    isVueEnabled ? watch(PATHS.vue.watchSrc, series(js, refresh)) : null;
    watch(PATHS.images.watchSrc, series(images, toWebp, refresh));
    watch(PATHS.svg.watchSrc, series(svg, refresh));
    watch(PATHS.sprite.watchSrc, series(sprite, refresh));
    watch(PATHS.fonts.watchSrc, series(fonts, refresh));
}

const refresh = (done) => {
    browserSync.reload();
    done();
}

exports.start = series(clean, fonts, isPugEnabled ? pug : html, styles, js, resources, sprite, images, toWebp, svg, server);
exports.build = series(toProd, clean, fonts, isPugEnabled ? pug : html, styles, js, resources, sprite, images, toWebp, svg);
exports.buildMinAll = series(htmlMinify, toProd, clean, fonts, isPugEnabled ? pug : html, styles, js, resources, sprite, images, toWebp, svg);
