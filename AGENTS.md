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
- キャッシュ番号を変更するときは `templates/page.html` のCSS・JavaScriptと、`app-v2.js` の `site-data.js` importを同じ番号にする。現在は `v39`。
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

## ナビゲーションと連絡先

- ヘッダー: `Home / Product / Information / About / Contact`
- ホームのお知らせ欄の「すべて見る」は、PCでは中央揃えにした「Information」の下、スマートフォンでは「Information」と同じ行の右端に置き、矢印を下のお知らせ行の矢印とそろえる。ショートカットは `Product / About / Contact / Join` の順。
- Productの説明は「私たちの製品の紹介」、Joinの説明は「私たちの一員になる」。
- 製品・お知らせの外部URLは各CSVの `url` 列へ記入し、詳細ページにボタンを表示する。
- テキストリンクには下線を付けず、ホーム内の「TowaPCについて」や一覧リンクは右揃えにする。
- フッターのLinksにはJoinを含め、右側にContact欄を置く。
- フッターのContact欄にはYouTube、X、Discord、お問い合わせを置く。
- Joinページの参加ボタンも同じDiscord招待リンクを開く。
- Join上部の「あなたの『つくりたい』を、ここから。」カードはテーマと反転させ、ライトでは黒背景・黄色タイトル・黄色ボタン、ダークでは黄色背景・黒文字・黒ボタンにする。
- Discord招待URL: `https://discord.gg/WJrAwzMp2U`
- Contactカードの補足表示:
  - YouTube: `@TowaPC`
  - X: `@TowaPC_Official`
  - Discord: `TowaPC Community`
  - お問い合わせ: `contact@towapc.com`
- Contactカードの値は `data/site.csv` の `labels.*` で管理する。

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

## v36 完了状態（2026-09-09）

- v36の表示変更はコミット `8e8d8f4 Refine mobile layout and content lists` で `main` へ公開済み。
- Aboutの3リンクは「メンバー」「協力関係」「参加」の順で、矢印をボタン右端へ固定。ボタンは単色・影なしにし、ダークテーマの文字と面のコントラストも上げた。
- About、Join、ホームのリンク配置を調整し、テキストリンクの下線を削除。ホームの「TowaPCについて」は右揃え。
- モバイルメニューは、メニュー外を押したときとリンク選択時に閉じる実装へ変更。
- Information一覧をProduct一覧と同じ画像付き構成に変更。製品・お知らせCSVへ任意の `url` 列を追加し、値がある詳細ページでは外部リンクボタンを表示する。
- モバイルのメンバー画像・協力団体ロゴは104px。協力団体の仮画像は淡い紫一色。
- モバイルフッターはロゴの右にテーマ切替を置き、`© 2025〜2026 TowaPC` をフッター最下部に置く。
- Joinのカード背景色を統一。参加ボタンはモバイルで横幅100%、折り返さない設定。
- ホームのヒーロー画像は彩度・コントラスト・明るさを少し下げ、過度なHDR感を抑えた。
- `Our products.` はピリオドを削除して `Our products` に変更。
- PC幅、390px幅のAbout・Information・Join、390px幅ダークテーマAboutは目視確認済み。横はみ出しなし、Aboutの矢印・Join参加ボタン・フッターのテーマ切替・Information画像付き一覧・ダーク配色は正常。
- モバイルメニューは、開閉表示、スクロール固定、`aria-expanded` が外側クリックですべて閉じた状態へ戻ることを確認済み。
- `bun run format`、`bun run sync-pages`、`bun run check`、`git diff --check` は成功済み。
- GitHub Actionsの「Check site」と「pages build and deployment」は成功済み。
- 公開サイトでv36のCSS・JavaScript、製品1件、お知らせ1件、`Our products`、`© 2025〜2026 TowaPC`、390px幅の横はみ出しなし、ブラウザーエラーなしを確認済み。
