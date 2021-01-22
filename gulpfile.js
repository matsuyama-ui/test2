const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulp_sass = require('gulp-sass');
const node_sass = require('node-sass');
const gulp_postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const gulp_sourcemaps = require('gulp-sourcemaps');
const gulp_plumber = require('gulp-plumber');
const gulp_notify = require('gulp-notify');
const gulp_imagemin = require('gulp-imagemin');
const imagemin_pngquant = require('imagemin-pngquant');
const gulp_livereload = require('gulp-livereload');
const gulp_once = require('gulp-once');
const webpack_stream = require('webpack-stream');
const inquirer = require('inquirer');
const through = require('through');
const gulp_w3c_html_validator = require('gulp-w3c-html-validator');
const gulp_svgmin = require('gulp-svgmin');
const gulp_iconfont = require('gulp-iconfont');
const gulp_iconfont_css = require('gulp-iconfont-css');
const gulp_debug = require('gulp-debug');


gulp_sass.compiler = node_sass;


/*** 初期設定 ***/

// (ライブリロードプラグイン(Chrome))https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
// ライブリロードする対象のページ(ホスト名)
const LIVE_RELOAD_TARGET_HOST = 'http://hoge.test';

// ライブリロードで監視するHTMLファイル
const HTML_FILES = './public/**/*.html';

// ライブリロード対象のファイル
const WATCH_FOR_RELOAD_FILES = './public/**/*';

// コンパイルするSCSSファイル
const SCSS_FILES = './public/dev/**/[^_]*.scss';

// watchするSCSSファイル
const SCSS_WATCH_FILES = './public/dev/**/*.scss';

// コンパイルするJSファイル
const ES6_FILES = './public/dev/**/*.es6';

// アイコンフォントファイルを作成する元となるSVGファイル
const SVG_FILES = './public/dev/common/svg/*.svg';

// CSS出力先
const CSS_OUTPUT_FOLDER = './public/';

// JS出力先
const JS_OUTPUT_FOLDER = './public/';

// アイコンフォントファイル出力先
const ICONFONT_OUTPUT_FOLDER = './public/common/fonts/';

// ドキュメントルートから見たアイコンフォントの出力先(CSS記述用)
const ICONFONT_DOCUMENT_ROOT_PATH = '/common/fonts/';

// アイコンフォント用mixinSCSSファイル出力先
const ICONFONT_MIXIN_SCSS_OUTPUT_PATH = './public/dev/common/css/_icon.scss';

// アイコンフォント用mixinSCSSのテンプレートファイル
const ICONFONT_MIXIN_SCSS_TEMPLATE_PATH = './public/dev/_iconTemplate.tmpl';

// 圧縮する画像及び拡張子(png以外は無劣化(メタデータ撤去))
const IMAGE_FILES = './public/**/*.{jpg,jpeg,png,gif}';

// PNG圧縮のパラメータ
const PNGQUANT_OPTION = {quality: [0.95, 1.0], speed: 1, verbose: true};

// 再圧縮防止用のログファイル
const MINIFY_LOG_FILE = 'minifyImageLog.json';

// W3CValidationに使用するサーバのアドレス
//const NU_HTML_CHECKER_ADDRESS = 'http://validator.w3.org/nu/'; // 本家
const NU_HTML_CHECKER_ADDRESS = 'http://192.168.21.148:8888'; // naname server

// ES6ファイルをコンパイルする際に使用するnode_modulesディレクトリを指定(追加)します(オプション)
const NODE_MODULES_PATH = './node_modules';


/*** ここまで ***/

const MODE_DEV = 'dev';
const MODE_PROD = 'prod';

/***
 * SCSSファイルを圧縮します。
 * SCSS_FILES: 圧縮対象のSCSSファイル
 * CSS_OUTPUT_FOLDER: CSSファイル出力先
 */
function compileSass(MODE) {
  const postcssPlugins = [autoprefixer({grid: true})];
  const notifyOptions = {
    title: 'SCSS Compile Error',
    message: "File: <%= error.relativePath %> \nLine: <%= error.line %>",

  };
  const plumberOptions = { errorHandler: gulp_notify.onError(notifyOptions) };
  const cssOutputStyle = (MODE === MODE_DEV) ? 'expanded' : 'compressed';
  let stream = gulp.src([SCSS_FILES, '!node_modules/']);
  stream = stream.pipe(gulp_plumber(plumberOptions));
  if (MODE === MODE_DEV) stream = stream.pipe(gulp_sourcemaps.init()); // SCSSを取り込んでソースマップを準備
  stream = stream.pipe(gulp_sass({outputStyle: cssOutputStyle})); // SCSSをコンパイル、出力。圧縮有効。
  stream = stream.pipe(gulp_postcss(postcssPlugins));
  if (MODE === MODE_DEV) stream = stream.pipe(gulp_sourcemaps.write()); // 出力するCSSにソースマップを付与
  stream = stream.pipe(gulp.dest(CSS_OUTPUT_FOLDER)); // CSSファイル出力
  return stream;
}

/***
 * 画像を圧縮します。
 */
function minifyImages() {
  const onceOption = { file: MINIFY_LOG_FILE};
  const imageminPlugins = [
    imagemin_pngquant(PNGQUANT_OPTION)
  ];

  // gulp_onceはログ取得と次の命令を実行するか否かを制御する
  return gulp.src([IMAGE_FILES, '!node_modules/'], {base: './'}) // 上書きするためにbaseを与える?
    .pipe(gulp_once(onceOption)) // ログを取得する。すでにログに記録済みの画像は処理しない。
    .pipe(gulp_imagemin(imageminPlugins)) // 画像を圧縮する。
    .pipe(gulp_once(onceOption)) // ログを取得する。すでにログに記録済みの画像は処理されない。(画像が圧縮されたファイルをログに再記録する)
    .pipe(gulp.dest('./'));
}

function buildJavaScript(MODE) {
  const webpackMode = MODE === MODE_DEV ? 'development' : 'production';
  const devtool = MODE === MODE_DEV ? 'inline-source-map' : 'none';
  return gulp.src([ES6_FILES, '!node_modules/'])
    .pipe(through(function (file) {
      const {dir, name} = path.parse(file.relative);
      file.named = path.join(dir, name);
      this.queue(file)
    }))
    .pipe(webpack_stream({
      mode: webpackMode,
      module: {
        rules: [
          {
            test: /\.es6$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        ie: 11,
                      },
                      modules: false,
                      useBuiltIns: "usage",
                      corejs: 3
                    }
                  ]
                ]
              }
            },
            exclude: /node_modules/
          }
        ],
      },
      devtool: devtool,
      resolve: {
        modules: [path.resolve(__dirname, NODE_MODULES_PATH), "node_modules"]
      }
    }))
    .pipe(gulp.dest(JS_OUTPUT_FOLDER));
}


/***
 * 監視対象のファイルに変更があったら、ブラウザをリロードします。
 * リロードプラグインが必要です。
 */
function watchThenReload() {
  gulp_livereload.listen({host: LIVE_RELOAD_TARGET_HOST});
  //gulp.watch(WATCH_FOR_RELOAD_FILES, gulp.series(compileSass, reload))
  return gulp.watch([WATCH_FOR_RELOAD_FILES, '!node_modules/'], function (cb) {
    gulp_livereload.reload();
    cb();
  });
}

function watchThenCompile() {
  gulp.watch([SCSS_WATCH_FILES, '!node_modules/'], compileSass.bind(null, MODE_DEV));
  gulp.watch([ES6_FILES, '!node_modules/'], buildJavaScript.bind(null, MODE_DEV));
}

function validateHTML() {
  return gulp.src(HTML_FILES)
    //.pipe(gulp_w3c_html_validator({url: NU_HTML_CHECKER_ADDRESS}))
    .pipe(gulp_w3c_html_validator({url: NU_HTML_CHECKER_ADDRESS}))
}

/**
 * SVGファイルからアイコンフォントファイルを作成します。
 * アイコンフォントをmixinで使用するためのSCSSファイルを作成します。
 */
function generateIconFontAndScss() {
  const svgminData = gulp.src(SVG_FILES);

  return svgminData
    .pipe(gulp_plumber())
    .pipe(gulp_svgmin())
    .pipe(gulp_iconfont_css({
      fontName: 'iconfont', // 生成するフォントファイルのフォント名
      path: ICONFONT_MIXIN_SCSS_TEMPLATE_PATH,
      targetPath: path.relative(ICONFONT_OUTPUT_FOLDER, ICONFONT_MIXIN_SCSS_OUTPUT_PATH), // 出力するSCSSファイル。gulp.destからの相対パス
      fontPath: ICONFONT_DOCUMENT_ROOT_PATH, // 生成されるフォントファイルへのサイトルートパス(@font-faceで使用する)
      cssClass: 'icon' // テンプレートで使用する接頭辞及びmixinの名前
    }))
    .pipe(gulp_iconfont({
      fontName: 'iconfont',
      formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
      appendCodepoints: false,
      normalize: true
    }))
    .pipe(gulp.dest(ICONFONT_OUTPUT_FOLDER))
}

function selectTask(cb) {
  const choices = gulp.tree({deep: true}).nodes.filter(node => node.label !== 'default').map((node) => {
    const taskName = node.label;
    return {
      name: `${taskName} \t: ${exports[taskName].description}`,
      value: taskName,
    };
  });
  const promise = inquirer.prompt([
    {
      type: 'list',
      choices: choices,
      pageSize: choices.length,
      name: 'taskName',
      message: '実行するタスクを選択してください',

    }
  ]);
  promise.then(({taskName}) => {
    const taskResult = exports[taskName]();
  });
}

exports['default'] = selectTask;
exports['watchThenCompile'] = watchThenCompile;
exports['watchThenCompile'].description = 'SCSS, JS(ES6)ファイルを監視、変更があったらコンパイルします。ソースマップ有り。';
exports['compileSass:dev'] = compileSass.bind(null, MODE_DEV);
exports['compileSass:dev'].description = 'SCSSをコンパイルします。ソースマップ有り。';
exports['compileSass:prod'] = compileSass.bind(null, MODE_PROD);
exports['compileSass:prod'].description = 'SCSSをコンパイルします。ソースマップ無し。';
exports['buildJavaScript:dev'] = buildJavaScript.bind(null, MODE_DEV);
exports['buildJavaScript:dev'].description = 'JS(ES6)をコンパイル(babel)、バンドル(webpack)します。mode: development';
exports['buildJavaScript:prod'] = buildJavaScript.bind(null, MODE_PROD);
exports['buildJavaScript:prod'].description = 'JS(ES6)をコンパイル(babel)、バンドル(webpack)します。mode: production';
exports['minifyImages'] = minifyImages;
exports['minifyImages'].description = '画像(PNG)を圧縮します。minifyImageLog.jsonに圧縮後の画像ファイルのハッシュを記録します。';
//exports['watchThenRelaod'] = watchThenReload;
//exports['watchThenRelaod'].description = '未使用';
exports['validateHTML'] = validateHTML;
exports['validateHTML'].description = 'W3C Validatorを使用してHTMLのマークアップを検証します。';
exports['generateIconFontAndScss'] = generateIconFontAndScss;
