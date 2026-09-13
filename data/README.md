# サイト内容の更新・公開手順

TowaPC.comの文章や掲載項目は、この `data` フォルダー内のCSVで管理します。この文書に、CSVの入力規則から公開までをまとめています。

## 最初に知っておくこと

- CSVの1行目にある列名と列の順番は変更しません。
- 1行追加すると掲載項目が増え、行を削除すると掲載項目も消えます。
- 半角カンマを含む値は、値全体を半角ダブルクォートで囲みます。
- 値の中で半角ダブルクォートを使う場合は `""` と2個続けます。
- 説明文を改行する場所には `\n`、1行空ける場所には `\n\n` と書けます。ダブルクォートで囲んだセル内へ実際の改行を入れる方法にも対応しています。
- 画像を使わない項目やリンクを設けない項目は、該当セルを空欄にします。
- CSVはUTF-8で保存します。

## お知らせを編集する `news.csv`

列は次の順番です。

| 列 | 内容 | 入力例・規則 |
| --- | --- | --- |
| `id` | 詳細ページのURLに使う識別子 | `privacy-policy-added`。半角英小文字、数字、ハイフンのみ。重複不可 |
| `date` | 公開日 | `2026.09.13` のように `YYYY.MM.DD` |
| `tag` | 一覧に表示するタグ | 下の4種類から選択 |
| `title` | お知らせの見出し | 必須 |
| `body` | 詳細本文 | 必須。`\n` と `\n\n` で改行可能 |
| `image` | 一覧・詳細用画像 | `/assets/news-example.jpg`。不要なら空欄 |
| `links` | 詳細下部の関連リンク | `ボタン名|URL`。複数指定も可能 |

`tag` に使える値と表示は次のとおりです。

| CSVへ書く値 | サイトでの表示 | 用途 |
| --- | --- | --- |
| `new` | NEW | 新しい告知 |
| `important` | 重要 | 特に確認してほしい告知 |
| `release` | リリース | 公開・提供開始 |
| `update` | 更新 | 更新・変更のお知らせ |

入力例:

```csv
id,date,tag,title,body,image,links
privacy-policy-added,2026.09.13,new,利用規約などを追加しました,"1段落目です。\n\n2段落目です。",,"利用規約|https://towapc.com/terms/;;プライバシーポリシー|https://towapc.com/privacy/"
```

## 製品を編集する `products.csv`

| 列 | 内容 | 入力例・規則 |
| --- | --- | --- |
| `id` | 詳細ページのURLに使う識別子 | `neko-bousai-now`。半角英小文字、数字、ハイフンのみ。重複不可 |
| `name` | 製品名 | 必須 |
| `category` | 画面に表示する分類名 | `防災アプリ` など |
| `type` | 一覧の絞り込み分類 | `app`、`web`、`project` のいずれか |
| `description` | 製品説明 | 必須。`\n` と `\n\n` で改行可能 |
| `color` | 画像がない部分などの背景色 | `pink`、`lavender`、`mint`、`cream`、`peach` のいずれか |
| `image` | 製品画像 | `/assets/product-example.png`。不要なら空欄 |
| `links` | 詳細下部のリンク | `ボタン名|URL`。複数指定も可能 |

入力例:

```csv
id,name,category,type,description,color,image,links
example-app,Example App,アプリケーション,app,"製品の説明です。\n詳しい説明を次の行へ表示できます。",lavender,/assets/product-example.png,"公式サイト|https://example.com/;;使い方|https://example.com/guide/"
```

## 関連リンクを複数設定する

お知らせと製品の `links` は、リンク名とURLを半角の `|` でつなぎます。

```text
利用規約|https://towapc.com/terms/
```

複数のリンクは `;;` で区切ります。各リンクは入力した名前のボタンとして表示されます。

```text
利用規約|https://towapc.com/terms/;;プライバシーポリシー|https://towapc.com/privacy/
```

`links` 全体に半角カンマが入る場合は、セル全体をダブルクォートで囲みます。URLは `https://` または `http://` から書きます。

## トップ・連絡先を編集する `site.csv`

`key,value` の2列です。`key` は変更せず、`value` を編集します。

| key | 内容 |
| --- | --- |
| `logo` | ヘッダーとフッターのロゴ画像 |
| `hero` | トップの背景画像 |
| `headline` | トップの大見出し |
| `description` | トップとAboutで使う紹介文 |
| `joinUrl` | TowaPC Communityの参加URL |
| `contactUrl` | お問い合わせURLまたは `mailto:` |
| `socials.youtube` | YouTubeのURL |
| `socials.x` | XのURL |
| `socials.discord` | DiscordのURL |
| `labels.youtube` | Contactに表示するYouTube名 |
| `labels.x` | Contactに表示するX名 |
| `labels.discord` | Contactに表示するDiscord名 |
| `labels.contact` | Contactに表示する連絡先 |

## 協力関係を編集する `partners.csv`

| 列 | 内容 |
| --- | --- |
| `name` | 団体・個人名 |
| `role` | 関係や役割 |
| `description` | 紹介文 |
| `image` | `/assets/` から始まる正方形画像 |
| `url` | Webサイト。不要なら空欄 |

## メンバーを編集する `members.csv`

| 列 | 内容 |
| --- | --- |
| `name` | 表示名 |
| `role` | 役割 |
| `description` | 紹介文 |
| `image` | `/assets/` から始まる正方形画像 |
| `url` | 紹介先。不要なら空欄 |

## 画像を追加する

1. 画像をサイト直下の `assets` フォルダーへ入れます。
2. 分かりやすい半角英数字とハイフンのファイル名にします。例: `news-new-site.png`。
3. CSVの `image` に `/assets/news-new-site.png` のように書きます。
4. ファイル名と大文字・小文字が一致していることを確認します。

## 手動でサイトを更新する

作業にはGitとBunを使います。PowerShellでサイトのフォルダーを開き、次の順で進めます。

### 1. 最新状態を取り込む

```powershell
git pull --ff-only origin main
```

### 2. CSVと画像を編集する

この `data` フォルダーのCSVを編集します。画像が必要なら `assets` フォルダーへ追加します。

製品やお知らせの `id` を追加・変更・削除した場合も、次の手順で詳細ページが自動生成されます。`product` や `information` 内のHTMLを直接作る必要はありません。

### 3. 表示用ページを生成して検査する

```powershell
bun run format
bun run sync-pages
bun run check
git diff --check
```

`サイトの構成・CSV・画像・リンクに問題はありません。` と表示されれば検査成功です。エラーが出た場合は、表示されたCSV名・行番号・内容を修正して、同じ4つを再実行します。

### 4. 変更内容を確認する

```powershell
git status --short
git diff
```

意図していないファイルや文章まで変わっていないか確認します。

### 5. GitHubへ公開する

コミット名は更新内容に合わせて変更します。

```powershell
git add .
git commit -m "お知らせを更新"
git push origin HEAD:main
```

push後、GitHub Actionsの検査とPages公開が完了するまで待ち、[https://towapc.com/](https://towapc.com/)を再読み込みします。お知らせ・製品の件数、詳細本文の改行、各リンク先を確認すれば完了です。

## 編集してはいけない場所

- 各ページの `index.html` は共通テンプレートから生成されるため、個別に編集しません。
- 共通HTMLを変える場合は `templates/page.html` だけを編集し、`bun run sync-pages` を実行します。
- 製品・お知らせの表示内容をJavaScriptへ直接書かず、CSVを正本にします。
