# website-template
## 目次
1. 社内のコーディングルールについて
   1. HTMLコーディングルール
   1. CSSコーディングルール
1. テンプレートディレクトリ構成について
   1. devディレクトリ
1. Gulpのタスクについて
   1. default
   1. watchThenCompile
   1. compileSass
   1. buildJavaScript
   1. minifyImages
   1. validateHTML

---
### 社内コーディングルールについて
コーディングルールは生産物の品質を向上、保つのに役立ちます。

ここで言う品質とは、可読性、保守性です。

ルールと言っても、電線のように触れても感電しません。

可読性、保守性を上げることで生産効率の向上を目指します。

ルールは破るものではなく、改善するものです。プルリク歓迎。

### HTMLコーディングルール

- 技術仕様に従う

  - 閉じタグが無い、不要な閉じタグがある、親子関係が決まっているタグを無視するなど、ブラウザの挙動に支障が出るような記述は避けましょう。

- セマンティクスを意識する

  - 難しいですが重要です。
  - [書ききれないのでこちらを見てください](https://developer.mozilla.org/ja/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure)

- ファイルフォーマット

  - ファイルのエンコード形式はUTF-8、インデントはスペース2個、改行コードはLFです。
  - 行末のスペースは禁止です。
  - 最終行には空行を入れます。
  - .editorconfigファイルに記述しています。
    - PhpStormであれば、.editorconfigファイルを読み込んでこれらの設定を自動で適用させることが出来ます。
      - (改行コードがLFになる、インデントはスペース2個になる、行末のスペースは取り除かれる、最終行に空行が入る)

#### CSSコーディングルール

- 命名規則のベースとしてBEMを使います。標準からカスタムしている部分があるので、以下に注意してください。

  - BlockとElementの間はハイフン2個--、ElementとModifierの間はハイフン1個-です。
  
  - BlockにはPrefix(接頭辞)を必ず付けます。
  
    - commonクラスはcmnがPrefixです(ex: cmn-*block*--*element*-*modifier*)
    
    - moduleクラスはmがPrefixです(ex: m-*block*--*element*-*modifier*)
    
    - layoutクラスはscssファイルの命名規則も含めて考案中です。
    
      1. ディレクトリ名?
      1. ファイル名?
      1. 

---
### テンプレートディレクトリ構成について
プロジェクトの基本的なディレクトリ構成は下記のとおりです。
```
.
├── .babelrc ES6ファイルをコンパイルする際の設定ファイルです。
├── .editorconfig エディタのコーディングスタイルを定義します。エディタ側の対応が必要です。
├── .gitignore Gitで管理したくないファイルを定義しています。
├── .idea PhpStormにおいて必要となるディレクトリ及びファイルです。
│   ├── dictionaries
│   │   └── naname.xml
│   ├── encodings.xml
│   ├── inspectionProfiles
│   ├── jsLibraryMappings.xml
│   ├── misc.xml
│   ├── modules.xml
│   ├── vcs.xml
│   ├── webResources.xml
│   ├── website-template.iml
│   └── workspace.xml
├── README.md このテキストファイルです。
├── gulpfile.js
├── htmlhintrc.json 今のところ使用していません。
├── minifyImageLog.json gulpに定義してある画像圧縮コマンドで使用する、画像圧縮の履歴を管理するログファイルです。
├── package-lock.json
├── package.json
└── public ウェブサイトのドキュメントルートです。
    ├── common ウェブサイトにおいて共通のデータを保存するディレクトリです。(public/dev/common)ディレクトリに置いたSCSS、JSファイルが出力されるディレクトリです。
    │   ├── css コンパイルすると自動生成されます。
    │   │   ├── common.css コンパイルすると自動生成されます。
    │   │   ├── layout コンパイルすると自動生成されます。
    │   │   │   └── layout.css コンパイルすると自動生成されます。
    │   │   ├── module.css コンパイルすると自動生成されます。
    │   │   └── settings.css コンパイルすると自動生成されます。
    │   ├── fonts アイコンフォントを生成すると作成されるディレクトリです。
    │   │   └── .gitkeep 無視してください。Gitで空ディレクトリを管理するためのダミーファイルです。
    │   ├── include インクルードファイルを保存するディレクトリです。
    │   │   └── .gitkeep 無視してください。Gitで空ディレクトリを管理するためのダミーファイルです。
    │   └── js コンパイルすると自動生成されます。
    │       └── common.js コンパイルすると自動生成されます。
    │
    ├── dev dev SCSS,ES6(JSファイル)を保存するディレクトリです。Gulpを使ってコンパイルします。
    │   └── common
    │       ├── css
    │       │   ├── _mixin.scss
    │       │   ├── common.scss
    │       │   ├── layout
    │       │   │   └── layout.scss
    │       │   ├── module.scss
    │       │   ├── settings
    │       │   │   ├── _base.scss
    │       │   │   └── _reset.scss
    │       │   └── settings.scss
    │       └── js
    │           └── common.es6
    └── index.html
```

### devディレクトリ
コンパイルが必要なscssファイル、ES6(JS)ファイルを格納します。  
コンパイルするとpublic配下に同じ構造でフォルダ、ファイルが作成されます。

- dev/common/css/settings.scss
  - dev/common/css/settingsディレクトリに定義した_base.scssと_reset.scssをインポートします。

- _base.scss
  - ウェブサイトにおける、基本となる設定を記述します。

- _reset.scss


- _mixin.scss
  - mixinはここにまとめて、全てのscssへインポートして使用してください。

- common.scss
  - サイト内で共通のヘッダー、フッター等のスタイルを記述してください。
  - 「全ページで共通」なスタイルを記述してください。

- module.scss
  - サイト内で汎用的に使用するスタイルを、モジュールとして記述してください。

- layout.scss
  - ページ固有のスタイルを記述する際に、このファイルをテンプレートとしてコピー、リネームして使用してください。
  - public/dev/common/css/layout/layout.scss　→　public/dev/common/css/layout/****.scss
  - コピー先のファイル名に関するルールは考案中です。

---
### Gulpのタスクについて
1. default
  - Gulpは標準でdefaultというタスク名があることを前提に動作しますが、動作内容が不明瞭になるため使用しません。
1. watchThenCompile (orBuild...コマンド名がイマイチ)
  - scss,es6ファイルに対する変更を監視(watch)します。scssが変更されるとコンパイル、es6が変更されるとビルドします。
    - 変更されないとコンパイル(orビルド)されません。
    - Gitからプルする前にwatchしておく、もしくは手動でコンパイル(orビルド)してください。(面倒くさいからコンパイルとビルド一括でするコマンドが欲しい?)
1. compileSass(dev or prod)
  - scssファイルをcssへコンパイルします。
    - devはソースマップを出力します。
    - prodはソースマップなし、cssを圧縮します。
- buildJavaScript(dev or prod)
  - es6ファイルをjsへビルドします。
    - devはwebpackのmodeがdevelopmentです。devtoolにinline-source-mapを指定します。
    - prodはwebpackのmodeがproductionです。
- minifyImages
  - publicディレクトリ以下にある画像(拡張子がjpg,jpeg,png,gif)を圧縮します。
    - 再圧縮を防ぐために*minifyImageLog.json*ファイルに記録します。
    - コマンド実行後は画像と共にログファイルをプッシュしてください。
      - png以外はメタデータを除去するのみです。
      - pngは非劣化ファイルですが、劣化させてファイルサイズを小さくしています。
      - 劣化しますので目視の確認が必要です(目視で分からない劣化で圧縮するようにパラメータを調整してあります、が念の為)。
- validateHTML
  - [Nu Html Checker](https://github.com/validator/validator)を使ってHTMLファイル(拡張子がhtml)をバリデーションします。
- generateIconFontAndScss
  - svgファイルからアイコンフォントファイルと、それらをmixinで使用するためのscssファイルを生成します。
    - svgファイルを適切なディレクトリに配置してください。
      - ファイル名に記号を使用するのは極力避けてください。
    - 出力されたscssのコンパイルは、別途compileSassやwatchThenCompileコマンドを使用してください。
  - 出力されたscssはimportして使用してください。直接編集しないでください。
```例.scss
// 使用例
@import "icon";
.this-is-icon-class {
  &:before {
    @include icon;
    content: $icon-XXX; (XXXはSVGファイル名から拡張子を取り除いた文字)
    color: XXX;
    font-size: XXX;
  }
}
```

---
#### その他
##### 禁止事項
- Pug（Jade）は使用しない





