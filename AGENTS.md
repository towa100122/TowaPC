# TowaPCサイト作業メモ

このファイルは、会話のコンテキストが切り替わってもサイトの設計と作業方法を維持するための記録です。

## 最優先の保守性ルール

- Gitにはサイトのソース、正本データ、必要な画像、生成・検査スクリプトだけを含める。キャッシュ、ログ、ローカルサーバーの一時物、OS・エディター固有ファイル、配布ZIPは `.gitignore` で除外する。
- データ、表示、スタイル、ページ生成、検査の責務を分け、同じ処理や値を複数箇所へ重複させない。
- 依存関係と処理の流れを上から追える構造にし、暗黙の副作用や用途不明の互換コードを増やさない。
- 更新箇所と確認方法を `data/README.md` と各スクリプト名から判断できる状態に保つ。
- 新しいCSV列・ページ・テーマを追加しやすくし、追加時は同じ定義から読み込み・検査・生成へ反映できる構造を優先する。
- 関数名・変数名・ファイル名は役割が分かる語を使い、不要な略語、過剰なコメント、機械的に長い処理を避ける。
- 公開前に未追跡ファイル、無視対象、生成ページ、リンク、構文、レスポンシブ表示を確認し、長期運用で壊れにくい状態を維持する。

## リポジトリと公開

- 作業リポジトリ: `C:\Users\towa\towapc\TowaPC-repo`
- 作業ブランチ: `update/towapc-site`
- 公開先ブランチ: GitHubの `main`
- 公開コマンド: `git push origin HEAD:main`
- 公開URL: `https://towapc.com/`
- 配布用フォルダー: `C:\Users\towa\towapc\outputs\towapc`
- 配布用ZIP: `C:\Users\towa\towapc\outputs\TowaPC-Web.zip`
- 公開後は実サイトを開き、静的本文、表示件数、ブラウザーエラーを確認する。

## 設計

- 表示内容の正本は `data` フォルダー内のCSVと規約Markdown。実際の文章をJavaScriptへ重複させない。
- `csv.js` がブラウザー表示と検査で共用するCSV解析を担当する。CSV解析を別の場所へ複製しない。
- `site-schema.js` がCSVの列、必須項目、タグ、製品種別、色、読み込み対象を一元管理する。仕様追加時はここを正本にする。
- `scripts/load-site-data.mjs` が生成時のデータ読込、`site-data.js` がページ別に絞った埋め込みデータの復元、URL検証、HTMLエスケープを担当する。
- `cookie-consent.js` がCookie設定の保存、同意バー、アクセス解析の許可・拒否操作を担当する。
- `app-v2.js` は画面遷移、ナビゲーション、各機能の起動だけを担当する。
- `page-views.js` が各ページ本文、`legal-markdown.js` が規約Markdownの安全な表示、`appearance-settings.js` が外観設定、`member-dialog.js` と `project-dialog.js` が詳細表示、`easter-eggs.js` が404シュレッダー、`ui.js` が表示用共通部品を担当する。責務を `app-v2.js` へ戻さない。
- CSSは `styles` 内で基礎、ページ、レスポンシブ、ダーク、Cookie、Appearance Lab、Material 3、Monochrome、特殊演出に分ける。巨大なCSSへ再結合しない。
- HTML内へ長いJavaScriptやCSSを書かない。初期テーマは `theme-bootstrap.js`、アクセス解析は `analytics.js` を使う。
- `theme-bootstrap.js`は`sync-pages`がテンプレートの`/*__THEME_BOOTSTRAP__*/`へインライン展開し、外部ファイル待ちより前にテーマを確定する。Cloudflare Rocket Loaderによる遅延を防ぐため、このscriptの`data-cfasync="false"`を外さない。
- 全ページ共通のHTMLは `templates/page.html` だけを直接編集する。
- 正式URLは`/products/`、`/news/`、`/news/{id}/`。旧`/product/`、`/information/`、`/information/{id}/`は静的移動ページとしてのみ維持する。
- `bun run editor`は127.0.0.1専用の管理GUIを起動する。POST APIはEditor自身のOriginと起動ごとのCSRF tokenを両方検証し、CSV・規約Markdown・画像・News添付をOS非依存のパス検証で許可先だけへatomic writeする。画像uploadはPNG、JPEG、WebP、GIFだけを許可し、SVGは追加できない。Git操作は行わない。
- Preview Serverは127.0.0.1:4174とlocalhost:4174だけを許可し、公開サイト用allowlist外の`.git`、`.github`、`editor`、`scripts`、`data`、`node_modules`、環境変数ファイルを403にする。
- News添付は`news.csv`の`attachments`へ`表示名|/files/ファイル名`で保存し、複数は`;;`で区切る。公開ファイルは`files`直下に限定する。
- HTML更新後やNewsのID変更後は `bun run sync-pages` を実行する。
- `bun run sync-pages` はCSVとMarkdownからページ固有title、description、canonical、OGP、主要本文を含む静的HTMLを生成する。News詳細は`news/*/index.html`、Products詳細は一覧ポップアップ。旧`product`と`information`には新URLへの互換ページを生成する。生成HTMLを手作業で編集しない。
- `scripts/check-site.mjs` がCSVの列、必須値、ID重複、日付、URL、画像、固定表示資産、共通HTML、JavaScript、Git管理対象を検査する。
- CSVの全列、タグ、改行、リンク、News添付、管理GUI、公開手順は `data/README.md` に集約する。
- 公開前に必ず `bun run format`、`bun run format:check`、`bun run sync-pages`、`bun run check`、`bun run check:editor`、`git diff --check` を実行する。
- GitHub Actionsの `.github/workflows/check-site.yml` は固定済み依存関係を導入し、整形とサイト構造を検査する。リポジトリ取得はNode.js 24対応の `actions/checkout@v7` を使う。
- `sync-pages`はCSSとJavaScriptの内容由来の資産バージョンをURLとImport Mapへ自動付与する。手作業でキャッシュ番号を変更しない。
- `sync-pages`は公開ページから`sitemap.xml`と`robots.txt`も生成する。404、Appearance Lab、Editor、旧redirect URLはsitemapへ含めない。OGPは`assets/ogp.png`を使う。
- `.gitignore` は依存関係、キャッシュ、出力、ログ、環境変数、OS・エディター固有ファイル、ZIPを除外する。`bun run check` は除外対象が誤ってGit追跡されていないかも検査する。
- `.gitattributes` でテキストの改行をLFへ統一し、WindowsとGitHub間で内容と無関係な差分を作らない。画像はバイナリとして扱う。
- 旧 `app.js`、`content.js`、`style.css` は未使用のため削除済み。Git履歴から復元できる。

## 現在の表示内容

- Productsの掲載内容・件数は `data/products.csv` を正とする。
- Newsの掲載内容・件数は `data/news.csv` を正とする。
- `※ 製品・お知らせの内容は、レイアウト確認用のサンプルです。` と `サンプルプロジェクト` は表示しない。
- ホームとAboutの共通説明:
  - `難しい未来を、少し近く。伸びすぎず、手に届くように。`
  - 実際の表示文は `data/site.csv` を正とする。
- About固有の文章:
  - `かゆいところに手が届く、派手でもないけれど確実に便利。日常の細やかな部分を良くしていきたい。TowaPCはそう考えます。`
- Aboutのリンクは「TowaPCのメンバー」「協力関係がある団体・個人」「私たちの一員になる」の順。
- Aboutは白い紹介カード、History、名前の由来を中心に構成する。MembersとCooperationはURLを維持したままAbout配下として扱い、パンくずと本文下の戻り先をAboutにする。紹介カード内のTowaPCロゴを1.8秒以内に5回押すと、隠し外観設定 `/appearance/` を開く。
- Homeの「What’s TowaPC?」は白いカード表示を維持する。
- News、Products、History、Members、Partners、Contacts、規約本文など変化しやすい内容は、それぞれ対応する `data` 内のCSVまたはMarkdownを正とする。

## ナビゲーションと連絡先

### 最重要デザイン統一ルール

- Appearance Lab、利用規約、プライバシーポリシーを含む全ページは、既存の通常ページと同じコンテンツ幅、カード、余白、角丸、配色、見出し規則へ合わせる。機能専用ページだけ別サイトのような独自デザインにしない。
- 新しいページを追加するときも、`pageHero()`、`.section.wrap`、既存カードの視覚言語を基準にする。
- 規約本文カードに `TOWAPC.COM` のような飾り用の英字ラベルを追加しない。Homeと同じ内側シャドウを使い、リンク色を選択中のカラーテーマへ追従させる。
- 添付された利用規約・プライバシーポリシーの本文は原文を維持する。明示された変更、実リンクへの置換、実装に必要な追記以外では、要約・言い換え・段落結合をしない。
- 利用規約は `data/terms.md`、プライバシーポリシーは `data/privacy.md` を正本とし、本文変更のためにJavaScriptや生成HTMLを編集しない。
- 利用規約・プライバシーポリシーは共通のAppearance設定に追従させる。ライト／ダーク、カラーパレット、標準／Material／Liquid Glass／紙、角丸、密度を維持する。Markdown側の日本語タイトルだけをh1にする。
- フッターのLight／Darkは同一タブ内だけの一時選択で、端末テーマ変更時に追従へ戻す。Appearance Labで選択・固定した場合だけ端末設定より優先する。初回Dark表示でLightを挟まないことを公開環境でも確認する。

- ヘッダー: `Home / Products / News / About / Contact`
- ホーム以外の全ページは、本文の下・フッターの手前に戻るリンクを表示する。MembersとCooperationだけは「Aboutに戻る」、それ以外は「ホームに戻る」とする。
- HomeはNews最新3件、Products代表3件まで表示する。スマートフォンではHomeのProductsも一覧ページと同じ横長リストにする。Newsの「すべて見る」とProductsの一覧リンクから各正式URLへ移動する。ショートカットは `Products / About / Contact / Join` の順。
- ダークテーマの選択中ヘッダータブは、薄い背景 `#eef1e8` と濃い文字 `#171a16` で表示する。スマートフォンの展開メニューでも同じ配色を使う。
- Productsの説明は「私たちの製品の紹介」、Joinの説明は「私たちの一員になる」。
- 製品・お知らせのリンクは各CSVの `links` 列へ `ボタン名|URL` で記入する。複数リンクは `;;` またはセル内改行で区切る。製品は先頭のURLを一覧とポップアップの移動ボタンに使う。お知らせ詳細は広い画面で左に一覧へ戻るリンク、右に名前付き関連リンクを同じ行へ置き、狭い画面だけ縦へ折り返す。
- 製品の説明とお知らせ本文は `\\n` またはCSVセル内の実改行を詳細ページの改行として表示する。一覧では改行を空白へ整えてレイアウトを崩さない。
- Newsの `tag` は `new`、`important`、`release`、`update` の4種類とし、表示は `NEW`、`Important`、`Release`、`Update` にする。
- テキストリンクには下線を付けず、ホーム内の「TowaPCについて」や一覧リンクは右揃えにする。
- フッターのLinksにはJoinを含め、右側にContact欄を置く。
- フッターのContact欄にはYouTube、X、Discord、Emailを置く。
- フッターのContact欄ではYouTube、X、Discord、Emailをモノクロアイコン付きで表示し、`data/contacts.csv` の追加リンクは従来どおり文字リンクで表示する。
- フッターのLinksではJoinを最後尾に置く。著作権表示は `© 2024〜2026 TowaPC. All rights reserved.` とする。
- Joinページの参加ボタンも同じDiscord招待リンクを開く。
- Joinは「TowaPCのメンバーになるには、以下のリンクから私たちのDiscordサーバーに参加してください。」とDiscord参加ボタンだけを表示し、下部の説明カードは置かない。
- Aboutの3つの関連ボタンは紹介文の白いカード内へ置き、カード内カードに見えない静かな背景と影なしの形にする。
- Discordリンク: `https://towapc.com/discord`
- News一覧はPCでタグ絞り込みとグリッド／リスト切替を備え、再読み込み時はグリッドへ戻す。スマートフォンは切替を出さず、横幅を使ったリスト表示に固定する。詳細は広い画面で本文の右にほかの記事を表示し、関連リンクと添付の下へ一覧に戻る操作を置く。
- Productsは詳細ページを持たない。PCではグリッド／リストを切り替えられ、再読み込み時はグリッドへ戻す。スマートフォンはリスト表示に固定する。3行紹介の末尾付近に詳細、下部に`links`先頭の名前を使った大きな主操作を置く。
- Revealは初期表示範囲の静的HTMLを後から隠さず、画面外の対象だけを登場アニメーションへ登録する。初期HTMLをJavaScriptで同内容へ描き直さない。
- 利用規約・プライバシーポリシーの番号付きリストはMarkdownに書かれた開始番号と個別番号を維持する。スマートフォンでは重複する英語Heroを省き、日本語タイトルと本文冒頭を最初の画面へ出す。
- Emailは`mailto:`リンクに加え、矢印の左に44pxの小さなoutlineコピーアイコンを置く。成功・失敗フィードバックを維持し、横長のコピーボタンへ戻さない。
- MembersとCooperationは一覧本文を3行で省略し、カードからアニメーション付き詳細を開く。正方形の協力ロゴはメンバーと同じ配置、横長ロゴはロゴの右に名前を置く。
- Contactカードの補足表示:
  - YouTube: `@TowaPC`
  - X: `@TowaPC_Official`
  - Discord: `TowaPC Community`
  - Email: `contact@towapc.com`
- Contactカードの値は `data/site.csv` の `labels.*` で管理する。
- ContactのXロゴは、ライト・ダークとも黒で固定する。
- フッター下部に「利用規約」「プライバシーポリシー」「Cookie設定」を表示する。規約は `/terms/`、プライバシーポリシーは `/privacy/`。
- Google Analytics（`G-6FF3KH40W6`）は初期状態で読み込まず、Cookie同意後だけ読み込む。拒否してもサイトの主要機能は利用でき、フッターの「Cookie設定」から選択を変更できる。
- 通常カードとセクション見出しの標準登場は、下42px・0.965倍・8pxぼかし・透明から定位置・等倍・ぼかしなしへ0.52秒でフェードアップする。減速カーブは `cubic-bezier(0.16, 1, 0.3, 1)`、カード間の遅延は42ms。
- `/appearance/` は通常のヘッダー・フッターリンクへ載せない隠し外観設定ページ。設定は `towapc-appearance-v1` として端末のlocalStorageへ保存する。設定区画の見出しにはカテゴリーアイコンを付けない。
- 外観設定では、登場アニメーションのプリセットに加えて、速度200〜1200ms、カード間隔、移動量、ぼかし、開始時の大きさをスライダーで個別調整できる。標準は0.52秒、ゆったりは0.68秒、ほかにきびきび・静止を用意する。
- 外観設定では、端末設定へ追従する明るさ、任意固定時のLight・Dark、差し色（標準・藤・若葉・夕焼け・自由色カラーパレット）、デザインテーマ（標準・Material 3・Liquid Glass・Paper・Monochrome）、カードの角、余白、UIの大きさも変更できる。Material 3は専用のsurface container、outline、primary container、filled button、低いelevationを全ページに適用する。
- デザインテーマには、線とモノクロで構成しドロップシャドウを使わないMonochromeも含める。Appearance Labでは安全なJSON形式の外部テーマを読み込めるようにし、同ページへ作成ガイドラインと例を載せる。外部テーマからHTML、CSS、JavaScript、外部URLを実行しない。
- ヘッダーは標準で透明度42%・背景ブラー14px。外観設定では透明度、ブラー、ガラス効果だけを変更できる。ヘッダー本体の出現アニメーションは常時静止とし、選択・時間・再生項目を復活させない。
- PCヘッダーの選択ピルは通常ページ遷移を維持したまま移動元から移動先へ滑らかに動かす。Home起点とロゴからHomeへの移動も対象にし、非選択ページからHomeへ戻る場合はHome位置で出現させる。ピル移動中に次の操作が入った場合は次のアニメーションを省略する。reduced-motionとmotion:noneでも動かさない。
- 旧Aboutロゴ5回押しの謎のアニメーションモードは、外観設定内の保存可能なスイッチへ移す。Escキーでも解除できる。
- 隠し外観設定へ移動するときはスナックバーや花火を出さない。設定ページの回転する菱形は維持する。謎のアニメーションモードを有効化したときは、画面下から上へ抜ける白いオーバーレイを1回だけ表示する。`EASTER EGG 01` の文字は表示しない。
- 404ページは上部ヒーローを表示せず、白またはダーク配色のカード中央に `404`、`Not found`、`お探しのページは迷子かもしれません。` の順で表示する。
- 404の数字を1.8秒以内に4回押すと、404ページ全体をシュレッダーへ吸い込み、24本の紙片へ裁断するイースターエッグを発動する。完了後は `404は細断されました。`、`ページの残り容量：0 byte`、復元ボタンを表示する。
- 過去の「えにい」ゲーム、発光点、334警報、ゲーム用ダイアログはJavaScript・CSSを含めて削除済みで、シュレッダー機能とは無関係。

## メンバーと協力関係

- メンバー画像は正方形にトリミングし、一覧ではPC 96×96px、スマートフォン72×72pxを基準にする。
- 企業ロゴは縦横比を維持して全体を収め、カード最上部へ置く。PCは高さ90px、スマートフォンは52pxを基準にする。
- Towaの画像: `assets/member-towa.png`
- Arielogicの画像は `assets/partner-arielogic.png`。利用者から提供された正方形のロゴ画像を使用する。
- メンバー一覧の説明は3行で省略する。カードを押すと、背景ブラーと暗転を使ったシャドウなしの詳細カードを開き、上に画像、下に全文、右上に×を表示する。

## 現行の確認基準

- DialogはMember、Partner、Productで共通して、開いた直後に閉じるボタンへfocusし、Tabを内部へ閉じ込め、背景を`inert`にする。Escまたは×で閉じ、元のtriggerへfocusを戻す。
- モバイルメニューはタップ、外側クリック、Escで閉じる。Escでは`aria-expanded`、open class、bodyのmenu lockを解除し、メニューボタンへfocusを戻す。
- 主要UIアイコンはoutlineを基準とし、SNSロゴだけはブランド形状を維持する。Footerは24pxのクリック領域を保ち、Email図形を21px、YouTube・X・Discord図形を18pxにする。
- ProductsとNews一覧はPCでHeroからtoolbarまで36px、toolbarからカードまで30pxを基準にする。720px以下は既存responsiveの44pxと18pxを優先する。
- TermsとPrivacyはh1を1個だけ持ち、404は`Not found`のh1と`noindex`を持つ。
- 初期テーマscriptはCloudflareで遅延させない。初回表示ではテーマ用transitionを有効化せず、描画完了後だけ通常のテーマ切替transitionを許可する。
- 公開前検査後はコミットして`main`へpushし、GitHub ActionsのCheck siteとPages公開が成功するまで確認する。公開後は実サイトで資産version、主要操作、Dark初期表示、PCと390pxのレイアウトを確認する。
- 古いコミット番号や固定件数を運用仕様として追加しない。履歴はGit、変化する表示内容は`data`、編集手順は`data/README.md`を正とする。
