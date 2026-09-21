# サイト内容の更新・公開手順

TowaPC.comの文章と掲載項目は、この`data`フォルダーで管理します。通常はCSVを直接編集せず、ローカル管理画面を使います。

## ローカル管理画面

```powershell
cd "C:\Users\towa\towapc\TowaPC-repo"
```

その後、次を実行します。

```powershell
bun install --frozen-lockfile
bun run editor
```

ブラウザーで`http://127.0.0.1:4175/`を開きます。管理画面は127.0.0.1だけで待ち受け、外部には公開されません。

1. 左側からNews、Products、サイト基本情報などを選びます。
2. フォームを編集して「保存」を押します。
3. News画像・添付ファイル、Products画像はファイル選択から追加できます。
4. 最後に「保存済みデータを検査」を押します。

画像は`assets/uploads`、News添付ファイルは`files`へ保存されます。Gitのcommitとpushは管理画面から行いません。

## Newsを編集する `news.csv`

| 列 | 内容 |
| --- | --- |
| `id` | URLに使う識別子。半角英小文字、数字、ハイフン。重複不可 |
| `date` | `YYYY.MM.DD`形式の公開日 |
| `tag` | `new`、`important`、`release`、`update` |
| `title` | 見出し |
| `body` | 本文。`\n`またはセル内改行に対応 |
| `image` | `/assets/`から始まる画像。不要なら空欄 |
| `links` | 関連リンク。`名前|https://...`、複数は`;;`区切り |
| `attachments` | 添付。`表示名|/files/ファイル名`、複数は`;;`区切り |

タグの表示は`NEW`、`Important`、`Release`、`Update`です。

```csv
id,date,tag,title,body,image,links,attachments
example,2026.09.19,update,更新のお知らせ,"本文です。\n次の行です。",/assets/uploads/example.png,"公式ページ|https://example.com/","資料.pdf|/files/example.pdf"
```

添付ファイルはNews詳細ページで種類とサイズとともに表示されます。公開ファイルは`files`直下だけを使用でき、`../`を含むパスは検査で拒否されます。

## Productsを編集する `products.csv`

| 列 | 内容 |
| --- | --- |
| `id` | 識別子。半角英小文字、数字、ハイフン |
| `name` | 製品名 |
| `category` | 表示する分類名 |
| `type` | `app`、`web`、`project` |
| `description` | 紹介文 |
| `color` | `pink`、`lavender`、`mint`、`cream`、`peach` |
| `image` | `/assets/`から始まる画像 |
| `links` | 主操作。先頭の`名前|URL`をカードと詳細で使用 |

Productsは個別URLを生成せず、一覧カードの「詳細」からポップアップを開きます。主操作には`links`へ入力した名前が表示されます。

ProductsとNewsのグリッド／リスト切替はPCの現在の表示中だけ有効で、再読み込みするとグリッドへ戻ります。スマートフォンは操作が重ならないよう、横幅を使うリスト表示に固定されます。

## その他のCSV

- `site.csv`: Hero、紹介文、連絡先、About本文
- `history.csv`: Historyの日時・見出し・説明・色。`20XX年`などのテンプレート行もAboutへ表示されます。
- `members.csv`: メンバー
- `partners.csv`: 協力関係
- `contacts.csv`: Contactへ追加する任意リンク

列名と列順は変更しません。CSVはUTF-8で保存します。直接編集する場合、カンマや改行を含むセルはダブルクォートで囲み、セル内の`"`は`""`と書きます。

## 利用規約とプライバシーポリシー

- 利用規約: `terms.md`
- プライバシーポリシー: `privacy.md`

対応するMarkdown記法:

```text
# ページタイトル
## 大見出し
### 小見出し

通常の段落

* 箇条書き
1. 番号付き箇条書き
[表示名](https://example.com/)
```

本文は明示された変更以外で言い換えません。

## 正式URLと旧URL

- Products: `/products/`
- News: `/news/`
- News詳細: `/news/{id}/`

旧`/product/`、`/information/`、`/information/{id}/`には新URLへの静的移動ページが生成されます。サイト内リンクには新URLだけを使います。

## ページ生成と検査

```powershell
bun run format
bun run format:check
bun run sync-pages
bun run check
git diff --check
```

`sync-pages`はCSVとMarkdownから、本文・title・description・canonical・OGPを含む静的HTMLを生成します。生成された各ページの`index.html`を直接編集しません。共通HTMLは`templates/page.html`、表示構造は`page-views.js`を編集します。

同時にCSSとJavaScriptの内容からキャッシュ用の版を自動生成し、Import Mapを含むURLへ反映します。更新時にURLの番号を手作業で変更する必要はありません。

## 公開

```powershell
git status --short
git add .
git commit -m "サイトを更新"
git push origin HEAD:main
```

GitHub ActionsとPages公開が完了したら、`https://towapc.com/`でProducts、News、添付、規約、モバイル表示を確認します。
