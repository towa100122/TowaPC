# TowaPCサイト作業メモ

このファイルは、会話のコンテキストが切り替わってもサイトの設計と作業方法を維持するための記録です。

## リポジトリと公開

- 作業リポジトリ: `C:\Users\towa\Documents\Codex\2026-09-06\k\work\TowaPC-repo`
- 作業ブランチ: `update/towapc-site`
- 公開先ブランチ: GitHubの `main`
- 公開コマンド: `git push origin HEAD:main`
- 公開URL: `https://towapc.com/`
- 配布用フォルダー: `C:\Users\towa\Documents\Codex\2026-09-06\k\outputs\towapc`
- 配布用ZIP: `C:\Users\towa\Documents\Codex\2026-09-06\k\outputs\TowaPC-Web.zip`
- 公開後は実サイトを開き、CSV読み込み完了後の表示件数とブラウザーエラーを確認する。

## 設計

- 表示内容の正本は `data` フォルダー内のCSV。実際の紹介文をJavaScriptへ重複させない。
- `site-data.js` がCSVの読み込み、URL検証、画像パス検証、HTMLエスケープを担当する。
- `app-v2.js` がページ表示と画面操作を担当するES Module。
- `style-v2.css` がレイアウトと配色を担当する。
- 全ページ共通のHTMLは `templates/page.html` だけを直接編集する。
- HTML更新後や製品・お知らせのID変更後は `bun run sync-pages` を実行する。
- `scripts/check-site.mjs` がCSVの列、必須値、ID重複、日付、URL、画像、共通HTML、JavaScriptを検査する。
- 公開前に必ず `bun run format`、`bun run sync-pages`、`bun run check`、`git diff --check` を実行する。
- GitHub Actionsの `.github/workflows/check-site.yml` でも同じ検査を行う。
- キャッシュ番号を変更するときは `templates/page.html` のCSS・JavaScriptと、`app-v2.js` の `site-data.js` importを同じ番号にする。現在は `v45`。
- `content-v2.js` はv30以前のキャッシュ互換専用。実際の表示内容を書かない。
- 旧 `app.js`、`content.js`、`style.css` は未使用のため削除済み。Git履歴から復元できる。

## 現在の表示内容

- 製品は1件だけ。
  - ID: `site-preparing`
  - 種別: `Webサービス`
  - 名前: `サイト現在準備中`
  - 説明: `現在、TowaPC.comは準備中です。まだ不完全なところがあり、調整をおこなっています。完成までしばらくお待ちください。`
  - 画像: `assets/product-site-preparing.svg`。淡い紫一色のシンプルな画像。
- お知らせは1件だけ。
  - ID: `site-preparing`
  - 日付: `2026.09.09`
  - タグ: `important`
  - 名前と説明は製品と同じ。
  - 画像なし。
- `※ 製品・お知らせの内容は、レイアウト確認用のサンプルです。` と `サンプルプロジェクト` は表示しない。
- ホームとAboutの共通説明:
  - `人々が抱える、永遠と思えるような難しい課題を、少しずつテクノロジーで解決できるように。少しの発見とのびのびとした発想で、暮らしを少し豊かに、便利にしていくためのものづくりを。`
- About固有の文章:
  - `かゆいところに手が届く、派手でもないけれど確実に便利。日常の細やかな部分を良くしていきたい。TowaPCはそう考えます。`
- Aboutの色付き枠:
  - `小さな不便を見つける。`
  - `確実に便利にする。`
  - `少しずつ、育てる。`
- Aboutのリンクは「TowaPCのメンバー」「協力関係がある団体・個人」「私たちの一員になる」の順。
- Aboutの白い「TowaPCについて」カードは、上からTowaPCロゴ、`TowaPCについて` の順に中央揃え。ロゴを1.8秒以内に5回押すとアニメーションモードを切り替え、Escキーでも終了できる。

## ナビゲーションと連絡先

- ヘッダー: `Home / Product / Information / About / Contact`
- ホーム以外の全ページは、本文の下・フッターの手前に「← ホームに戻る」を表示する。
- ホームのお知らせ欄の「すべて見る」は、PCでは中央揃えにした「Information」の下へ2px間隔で置き、見出し全体をカード中央から2px下へ調整する。スマートフォンでは「Information」と同じ行の右端に置き、矢印を下のお知らせ行の矢印とそろえる。ショートカットは `Product / About / Contact / Join` の順。
- ダークテーマの選択中ヘッダータブは、薄い背景 `#eef1e8` と濃い文字 `#171a16` で表示する。スマートフォンの展開メニューでも同じ配色を使う。
- Productの説明は「私たちの製品の紹介」、Joinの説明は「私たちの一員になる」。
- 製品・お知らせの外部URLは各CSVの `url` 列へ記入し、詳細ページにボタンを表示する。
- テキストリンクには下線を付けず、ホーム内の「TowaPCについて」や一覧リンクは右揃えにする。
- フッターのLinksにはJoinを含め、右側にContact欄を置く。
- フッターのContact欄にはYouTube、X、Discord、お問い合わせを置く。
- Joinページの参加ボタンも同じDiscord招待リンクを開く。
- Join上部の「あなたの『つくりたい』を、ここから。」カードはテーマと反転させ、ライトでは黒背景・白文字・白ボタン、ダークでは白背景・黒文字・黒ボタンにする。
- ダークテーマで白背景・黒文字のままにするのは、Join最上部、Contact、Aboutの「TowaPCについて」カード。Aboutカード内のリンクは薄いグレー背景・黒文字にする。ほかのカードはダーク配色にする。Informationリストの外側は透明にして、角の後ろに四角い背景が見えないようにする。
- Discord招待URL: `https://discord.gg/WJrAwzMp2U`
- Contactカードの補足表示:
  - YouTube: `@TowaPC`
  - X: `@TowaPC_Official`
  - Discord: `TowaPC Community`
  - お問い合わせ: `contact@towapc.com`
- Contactカードの値は `data/site.csv` の `labels.*` で管理する。
- ContactのXロゴは、ライト・ダークとも黒で固定する。
- 404ページは上部ヒーローを表示せず、白またはダーク配色のカード中央に `404` と `Not found` だけを表示する。
- 404カード右下には、表示も文字もない56px四方の隠しボタンがある。押すと「AIセンスで作った全く謎の謎の\"えにい\"ゲーム」が開く。
- えにいゲームは、逃げる `え / に / い / ゑ / 何` を押して、失った時間・えにい度・完成度を増やす。完成度99%以上で進捗を0%へ戻して3 eniiを没収し、13 eniiでも1 eniiへ戻す。クリア条件はない。ライト・ダーク両テーマに対応する。

## メンバーと協力関係

- メンバー画像と企業ロゴは常に正方形。
- PCは180×180px、スマートフォンは104×104px。
- メンバー画像は正方形にトリミングし、企業ロゴは正方形内に全体を収める。
- Towaの画像: `assets/member-towa.png`
- Arielogicは現在、淡い紫一色の `assets/partner-sample.svg`。利用者が後で自分で画像を用意する予定。

## この変更の確認状況

- ローカル表示で製品1件、お知らせ1件を確認済み。
- Contactの表示は `@TowaPC`、`@TowaPC_Official`、`TowaPC Community`、`contact@towapc.com`。
- Aboutの新しい文章、3つの色付き枠、Joinリンクを確認済み。
- JoinとフッターのDiscordリンクを確認済み。
- サンプル注記が表示されないことを確認済み。
- ブラウザーの警告・エラーなし。
- 変更を公開するときは、最終検査、コミット、`main`へのpush、配布ZIP更新、公開サイト確認までを一続きで行う。

## v45 完了状態（2026-09-10）

- v45の404・えにいゲーム変更はコミット `81d72e4 Turn the 404 secret into an enii game` で確定。
- 404上部の `Page not found` と「ページが見つかりませんでした」を削除し、本文を `404 / Not found` の構成へ変更。ブラウザーのページ名も `TowaPC — Not found` にした。
- 右下の `✦` は廃止し、見た目に何も表示されないカード右下の隠しボタンへ変更した。
- ペイントゲームはコードとスタイルを含めて削除。タイトルどおり意味の分からない、クリア不能の「えにい」追跡ゲームへ置き換えた。
- ライト・ダーク、1280×720、390×844で目視確認済み。404とゲームに横はみ出し・ダイアログ内の縦はみ出しなし。
- 時間計測、逃げる文字、完成度99%での没収、説明書、リセットを操作確認済み。ライト・ダークの配色も切り替わり、ブラウザーの警告・エラーなし。
- `bun run format`、`bun run sync-pages`、`bun run check`、`git diff --check` は成功済み。旧404文言とペイントゲームの残存コードがないことも確認済み。
