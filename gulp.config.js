const SOURCE_PATH = 'src/';
const BUILD_PATH = 'build/';

let isProd = false; // dev by default
let isHtmlMin = false; // html minify
let isPugEnabled = false; // html by default
let isVueEnabled = false; // vue.js

const PATHS = {
  fonts: {
    src: `${SOURCE_PATH}assets/fonts/*.{woff,woff2}`,
    watchSrc: `${SOURCE_PATH}assets/fonts/*.{woff,woff2}`,
    dest: `${BUILD_PATH}assets/fonts/`,
  },

  html: {
    src: `${SOURCE_PATH}html/*.html`,
    watchSrc: `${SOURCE_PATH}html/**/*.html`,
    minifiedFileExt: '.min.html',
    dest: BUILD_PATH
  },

  pug: {
    src: `${SOURCE_PATH}pug/*.pug`,
    watchSrc: `${SOURCE_PATH}pug/**/*.pug`,
    minifiedFileExt: '.min.html',
    dest: BUILD_PATH
  },

  styles: {
    src: `${SOURCE_PATH}styles/*.scss`,
    watchSrc: `${SOURCE_PATH}styles/**/*.scss`,
    dest: `${BUILD_PATH}assets/`
  },

  scripts: {
    src: `${SOURCE_PATH}scripts/*.js`,
    entry: `${SOURCE_PATH}scripts/main.js`,
    watchSrc: `${SOURCE_PATH}scripts/**/*.js`,
    dest: `${BUILD_PATH}assets/`
  },

  vue: {
    watchSrc: `${SOURCE_PATH}scripts/**/*.vue*`
  },

  images: {
    src: `${SOURCE_PATH}assets/img/**/*.{jpg,jpeg,png,webp}`,
    watchSrc: `${SOURCE_PATH}assets/img/**/*.{jpg,jpeg,png,webp}`,
    dest: `${BUILD_PATH}assets/img/`
  },

  svg: {
    src: `${SOURCE_PATH}assets/img/**/*.svg`,
    watchSrc: `${SOURCE_PATH}assets/img/**/*.svg`,
    dest: `${BUILD_PATH}assets/img/`
  },

  sprite: {
    src: `${SOURCE_PATH}assets/icons/**/icon-*.svg`,
    spriteFileName: `sprite.svg`,
    watchSrc: `${SOURCE_PATH}assets/icons/**/icon-*.svg`,
    dest: `${BUILD_PATH}assets/`
  },

  resources: {
    src: `${SOURCE_PATH}root-resources/**`,
    dest: BUILD_PATH
  }
};

module.exports = { PATHS, BUILD_PATH, isProd, isHtmlMin, isPugEnabled, isVueEnabled  }
