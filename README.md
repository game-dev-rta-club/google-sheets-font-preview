# Google Sheets Font Preview Sidebar

Google Spreadsheet の `Apps Script` に貼り付けて使う、最小のプレビュー用サイドバーです。

翻訳者が Google Spreadsheet 上で文字列を見ながら、ローカルのフォントファイルをドラッグ&ドロップして実フォントに近い見た目を確認する用途を想定しています。

## 今回入っている機能

- 選択中セルの文字列をサイドバーに表示
- `.ttf / .otf / .woff / .woff2` をドラッグ&ドロップで読み込み
- 読み込んだフォントでサイドバー内プレビューを切り替え

## 使い方

### いちばん簡単な試し方

1. 対象の Google Spreadsheet を開く
2. `拡張機能 > Apps Script` を開く
3. `src/Code.gs` の内容を `Code.gs` に貼る
4. `src/Sidebar.html` を新規 HTML ファイルとして作って貼る
5. スクリプトを保存する
6. Spreadsheet を再読込する
7. メニュー `Localization Preview > Open Sidebar` を開く

### `clasp` で管理する

1. `npm install`
2. `npm run setup -- <Apps Script URL or scriptId>`
3. Setup will run `clasp login`
4. Setup will open [Apps Script user settings](https://script.google.com/home/usersettings)
5. Turn on `Google Apps Script API`
6. If you just enabled it, wait a few minutes
7. `npm run push-clasp`
8. Spreadsheet を再読込する

You can paste either the full Apps Script editor URL or the raw `scriptId`.

```text
https://script.google.com/home/projects/<scriptId>/edit
```

`npm run setup` now does both:

- create `.clasp.json`
- run `clasp login`
- open the Apps Script user settings page

If you run `npm run setup` without arguments, the setup script follows this step-by-step flow:

1. explain how to create/open the Apps Script project and identify the URL / `scriptId`
2. ask you to paste the Apps Script URL or `scriptId`
3. start `clasp login`
4. open the Apps Script user settings page so you can enable `Google Apps Script API`
5. finish and show the next command

#### よく使うコマンド

- `npm run setup`
- `npm run login-clasp`
- `npm run push-clasp`
- `npm run pull-clasp`
- `npm run open-clasp`

## 補足

- フォントはブラウザ内だけで読み込みます
- サーバーや Drive にはアップロードしません
- 再読込するとフォントの読み込み状態は消えます
- 今は最小機能なので、選択中セルの先頭1セルだけを表示します
- `onSelectionChange(e)` を使って選択中セルの情報を更新しています
- `onSelectionChange(e)` は追加後と Spreadsheet を開き直した後に再読込が必要です
- `scriptId` はコミットしない想定なので `.clasp.json` は `.gitignore` に入れています
