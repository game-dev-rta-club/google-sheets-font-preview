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
2. `npm run setup-clasp -- <scriptId>`
3. `npm run login-clasp`
4. `npm run push-clasp`
5. Spreadsheet を再読込する

`scriptId` は Apps Script エディタの URL から取れます。

```text
https://script.google.com/home/projects/<scriptId>/edit
```

引数なしで `npm run setup-clasp` を実行すると、対話入力でも設定できます。

#### よく使うコマンド

- `npm run setup-clasp`
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
