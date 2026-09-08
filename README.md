# TowaPC Webサイト

GitHub Pagesで公開する静的サイトです。ページの表示内容は `data` フォルダー内のCSVで管理します。

## 内容を更新する

- `data/site.csv`: トップページ、ロゴ、参加先、連絡先、SNS
- `data/products.csv`: 製品
- `data/news.csv`: お知らせ
- `data/partners.csv`: 協力関係
- `data/members.csv`: メンバー

画像は `assets` フォルダーへ入れ、CSVの `image` 列に `/assets/ファイル名` と記入します。詳しい入力規則は [data/README.md](data/README.md) にあります。

製品またはお知らせのIDを追加・変更・削除した場合は、詳細ページを生成します。

```powershell
bun run sync-pages
```

## 公開前に確認する

次のコマンドで、CSVの列・必須項目・ID重複・日付・URL・画像・詳細ページ・JavaScriptをまとめて確認できます。

```powershell
bun run check
```

GitHubへ送信した際にも同じ検査が自動実行されます。

## 構成

- `app-v2.js`: ページ表示と画面操作
- `site-data.js`: CSVの読み込み、入力値の安全な処理、読み込み失敗時の最小表示
- `style-v2.css`: レイアウトと配色
- `templates/page.html`: 全ページ共通のHTML
- `scripts/sync-pages.mjs`: 共通HTMLと詳細ページの生成
- `scripts/check-site.mjs`: 公開前の自動検査

各ページのHTMLを個別に編集せず、共通部分は `templates/page.html` を編集してから `bun run sync-pages` を実行します。CSVの読み込みに失敗した場合は、古い予備データではなく読み込みエラーを表示します。

## デザイン

端末幅に応じてレイアウトが変わり、ライト・ダークテーマにも対応しています。端末で視覚効果を減らす設定にしている場合はアニメーションを無効にします。
