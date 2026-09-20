import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "../csv.js";
import {
  csvSchemas,
  newsTagLabels,
  nonEmptySiteKeys,
  productColors,
  productTypes,
  requiredFields,
  requiredSiteKeys,
} from "../site-schema.js";
import {
  getPageDescriptors,
  getPageFiles,
  getRedirectDescriptors,
} from "./site-files.mjs";

const root = resolve(import.meta.dirname, "..");
const problems = [];
const csvData = {};

const ignoredTrackedPatterns = [
  /(^|\/)node_modules\//,
  /(^|\/)(?:\.bun|\.cache|dist|coverage|tmp|temp|outputs)\//,
  /(^|\/)\.env(?:\.|$)/,
  /\.(?:log|pid|tmp|bak|swp|swo|tsbuildinfo|zip)$/i,
  /(^|\/)\.eslintcache$/,
  /(^|\/)(?:\.DS_Store|Thumbs\.db|Desktop\.ini)$/i,
  /(^|\/)(?:\.idea|\.vscode|\.history)\//,
];

function problem(message) {
  problems.push(message);
}

try {
  const tracked = Bun.spawnSync(["git", "ls-files", "-z"], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (tracked.exitCode !== 0) throw new Error(tracked.stderr.toString().trim());
  for (const file of tracked.stdout.toString().split("\0").filter(Boolean)) {
    if (ignoredTrackedPatterns.some((pattern) => pattern.test(file))) {
      problem(`${file}: Gitへ含めない種類のファイルが追跡されています。`);
    }
  }
} catch (error) {
  problem(`Git管理対象の検査: ${error.message}`);
}

const clientScripts = [
  "analytics.js",
  "app-v2.js",
  "appearance-settings.js",
  "cookie-consent.js",
  "csv.js",
  "easter-eggs.js",
  "legal-markdown.js",
  "member-dialog.js",
  "page-views.js",
  "project-dialog.js",
  "site-data.js",
  "site-schema.js",
  "theme-bootstrap.js",
  "ui.js",
  "editor/editor.js",
  "generated/app-bundle.js",
];
const serverScripts = [
  "editor/server.mjs",
  "scripts/check-editor-security.mjs",
  "scripts/load-site-data.mjs",
  "scripts/site-files.mjs",
  "scripts/sync-pages.mjs",
];
const stylesheets = [
  "styles/foundation.css",
  "styles/home.css",
  "styles/content.css",
  "styles/footer.css",
  "styles/responsive.css",
  "styles/dark-motion.css",
  "styles/legal-cookie.css",
  "styles/appearance-lab.css",
  "styles/ui-polish.css",
  "styles/features.css",
  "styles/shadowless-theme.css",
  "styles/material-theme.css",
  "styles/monochrome-theme.css",
  "styles/easter-eggs.css",
];
const requiredClientFiles = [
  ...clientScripts,
  ...stylesheets,
  "apple-touch-icon.png",
  "favicon.png",
  "assets/TowaPC.svg",
  "assets/social-discord.svg",
  "assets/social-x.svg",
  "assets/social-youtube.svg",
  "data/terms.md",
  "data/privacy.md",
  "editor/index.html",
  "editor/editor.css",
  "editor/server.mjs",
  "files/.gitkeep",
  "assets/uploads/.gitkeep",
];
for (const file of requiredClientFiles) {
  if (!existsSync(resolve(root, file))) {
    problem(`${file}: サイト表示に必要な固定ファイルがありません。`);
  }
}

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isContactUrl(value) {
  return /^mailto:[^\s@]+@[^\s@]+$/i.test(value) || isHttpUrl(value);
}

function markdownOrderedNumbers(source) {
  return String(source)
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^(\d+)\.\s+/)?.[1])
    .filter(Boolean)
    .map(Number);
}

function htmlOrderedNumbers(html) {
  const numbers = [];
  for (const list of html.matchAll(
    /<ol(?: start="(\d+)")?>([\s\S]*?)<\/ol>/g,
  )) {
    let next = Number(list[1] || 1);
    for (const item of list[2].matchAll(/<li(?: value="(\d+)")?>/g)) {
      const value = Number(item[1] || next);
      numbers.push(value);
      next = value + 1;
    }
  }
  return numbers;
}

function checkLinks(file, rowNumber, value) {
  if (!value) return;
  const entries = String(value)
    .replace(/\\n/g, "\n")
    .split(/;;|\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  entries.forEach((entry, index) => {
    const separator = entry.indexOf("|");
    const label = separator > 0 ? entry.slice(0, separator).trim() : "";
    const url = separator > 0 ? entry.slice(separator + 1).trim() : "";
    if (!label || !url) {
      problem(
        `${file} ${rowNumber}行目: linksの${index + 1}件目は「ボタン名|https://...」で指定してください。`,
      );
    } else if (!isHttpUrl(url)) {
      problem(
        `${file} ${rowNumber}行目: linksの${index + 1}件目のURLが正しいHTTP(S) URLではありません。`,
      );
    }
  });
}

function checkImage(file, rowNumber, image) {
  if (!image) return;
  if (!image.startsWith("/assets/") || image.startsWith("//")) {
    problem(`${file} ${rowNumber}行目: imageは/assets/から始めてください。`);
    return;
  }
  if (!existsSync(resolve(root, image.slice(1)))) {
    problem(`${file} ${rowNumber}行目: ${image}が見つかりません。`);
  }
}

function checkAttachments(file, rowNumber, value) {
  if (!value) return;
  const entries = String(value)
    .replace(/\\n/g, "\n")
    .split(/;;|\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  entries.forEach((entry, index) => {
    const separator = entry.indexOf("|");
    const label = separator > 0 ? entry.slice(0, separator).trim() : "";
    const path = separator > 0 ? entry.slice(separator + 1).trim() : "";
    if (!label || !/^\/files\/[a-zA-Z0-9._-]+$/.test(path)) {
      problem(
        `${file} ${rowNumber}行目: attachmentsの${index + 1}件目は「表示名|/files/ファイル名」で指定してください。`,
      );
    } else if (!existsSync(resolve(root, path.slice(1)))) {
      problem(
        `${file} ${rowNumber}行目: 添付ファイル${path}が見つかりません。`,
      );
    }
  });
}

for (const [file, expectedHeaders] of Object.entries(csvSchemas)) {
  try {
    const text = await readFile(resolve(root, "data", file), "utf8");
    const parsed = parseCsv(text);
    csvData[file] = parsed.rows;
    if (parsed.headers.join(",") !== expectedHeaders.join(",")) {
      problem(
        `${file}: 列名は ${expectedHeaders.join(",")} の順にしてください。`,
      );
    }
    parsed.rows.forEach((row, index) => {
      const rowNumber = index + 2;
      for (const field of requiredFields[file] || []) {
        if (!row[field])
          problem(`${file} ${rowNumber}行目: ${field}は必須です。`);
      }
      checkImage(file, rowNumber, row.image);
      const validRowUrl =
        file === "contacts.csv" ? isContactUrl(row.url) : isHttpUrl(row.url);
      if (row.url && !validRowUrl) {
        problem(
          `${file} ${rowNumber}行目: urlが正しい${file === "contacts.csv" ? "HTTP(S)またはmailto" : "HTTP(S)"} URLではありません。`,
        );
      }
      checkLinks(file, rowNumber, row.links);
      if (file === "news.csv")
        checkAttachments(file, rowNumber, row.attachments);
    });
  } catch (error) {
    problem(`${file}: ${error.message}`);
  }
}

for (const file of ["products.csv", "news.csv"]) {
  const ids = new Set();
  for (const [index, row] of (csvData[file] || []).entries()) {
    const rowNumber = index + 2;
    if (row.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id)) {
      problem(
        `${file} ${rowNumber}行目: idは半角英小文字・数字・ハイフンで指定してください。`,
      );
    }
    if (ids.has(row.id))
      problem(`${file} ${rowNumber}行目: id「${row.id}」が重複しています。`);
    ids.add(row.id);
  }
}

const allowedProductTypes = new Set(productTypes);
const allowedProductColors = new Set(productColors);
for (const [index, product] of (csvData["products.csv"] || []).entries()) {
  if (!allowedProductTypes.has(product.type)) {
    problem(
      `products.csv ${index + 2}行目: type「${product.type}」は使用できません。`,
    );
  }
  if (product.color && !allowedProductColors.has(product.color)) {
    problem(
      `products.csv ${index + 2}行目: color「${product.color}」は使用できません。`,
    );
  }
}

const newsTags = new Set(Object.keys(newsTagLabels));
for (const [index, news] of (csvData["news.csv"] || []).entries()) {
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(news.date)) {
    problem(
      `news.csv ${index + 2}行目: dateはYYYY.MM.DD形式で指定してください。`,
    );
  }
  if (!newsTags.has(news.tag)) {
    problem(
      `news.csv ${index + 2}行目: tag「${news.tag}」は使用できません。new、important、release、updateから選んでください。`,
    );
  }
}

for (const [index, event] of (csvData["history.csv"] || []).entries()) {
  const rowNumber = index + 2;
  if (!["y", "n"].includes(event.colored)) {
    problem(
      `history.csv ${rowNumber}行目: coloredはyまたはnで指定してください。`,
    );
  }
  if (event.colored === "y" && !/^#[0-9a-f]{6}$/i.test(event.color)) {
    problem(
      `history.csv ${rowNumber}行目: coloredがyの場合、colorは#から始まる6桁のカラーコードにしてください。`,
    );
  }
  if (!["black", "white"].includes(event.textColor)) {
    problem(
      `history.csv ${rowNumber}行目: textColorはblackまたはwhiteで指定してください。`,
    );
  }
}

const siteRows = csvData["site.csv"] || [];
const site = Object.fromEntries(siteRows.map(({ key, value }) => [key, value]));
const siteKeys = new Set();
siteRows.forEach(({ key }, index) => {
  if (siteKeys.has(key))
    problem(`site.csv ${index + 2}行目: key「${key}」が重複しています。`);
  siteKeys.add(key);
});
for (const key of requiredSiteKeys) {
  if (!(key in site)) problem(`site.csv: ${key}の行がありません。`);
}
for (const key of nonEmptySiteKeys) {
  if (key in site && !site[key])
    problem(`site.csv: ${key}を空欄にできません。`);
}
for (const key of ["logo", "hero"]) checkImage("site.csv", key, site[key]);
for (const key of [
  "joinUrl",
  "socials.youtube",
  "socials.x",
  "socials.discord",
]) {
  if (site[key] && !isHttpUrl(site[key]))
    problem(`site.csv: ${key}のURLが正しくありません。`);
}
if (
  site.contactUrl &&
  !/^mailto:[^\s@]+@[^\s@]+$/i.test(site.contactUrl) &&
  !isHttpUrl(site.contactUrl)
) {
  problem("site.csv: contactUrlが正しくありません。");
}

try {
  const pageFiles = await getPageFiles(root);
  for (const page of pageFiles) {
    const pagePath = resolve(root, page);
    if (!existsSync(pagePath)) {
      problem(`${page}がありません。bun run sync-pagesを実行してください。`);
      continue;
    }
  }
  const [pages, redirects] = await Promise.all([
    getPageDescriptors(root),
    getRedirectDescriptors(root),
  ]);
  for (const page of pages) {
    const html = await readFile(resolve(root, page.file), "utf8");
    if (/\{\{[A-Z_]+\}\}/.test(html))
      problem(`${page.file}: 未置換のテンプレート変数があります。`);
    if (
      html.includes("__THEME_BOOTSTRAP__") ||
      !html.includes("applyStoredThemeBeforePaint") ||
      html.indexOf("applyStoredThemeBeforePaint") >
        html.indexOf("/styles/foundation.css")
    ) {
      problem(
        `${page.file}: 初期テーマ処理がCSSより前に埋め込まれていません。`,
      );
    }
    if (!/<title>[^<]+<\/title>/.test(html))
      problem(`${page.file}: ページ固有titleがありません。`);
    if (!/<link rel="canonical" href="https:\/\/towapc\.com\//.test(html))
      problem(`${page.file}: canonicalがありません。`);
    if (!/<meta property="og:title" content="[^"]+"/.test(html))
      problem(`${page.file}: OGP titleがありません。`);
    if (!/<main id="main">[\s\S]+<\/main>/.test(html))
      problem(`${page.file}: 静的な主要本文がありません。`);
    const version = html.match(
      /\/styles\/foundation\.css\?v=([a-f0-9]{12})/,
    )?.[1];
    if (!version)
      problem(`${page.file}: 自動生成された資産バージョンがありません。`);
    if (
      version &&
      (!html.includes(`/generated/app-bundle.js?v=${version}`) ||
        [...html.matchAll(/href="\/styles\/[^"?]+\.css\?v=([^"&]+)/g)].some(
          (match) => match[1] !== version,
        ))
    ) {
      problem(`${page.file}: CSSとJavaScriptの資産バージョンが不一致です。`);
    }
    if (/href="\/(?:product|information)(?:\/|\")/.test(html))
      problem(`${page.file}: 旧URLへの内部リンクが残っています。`);
    if (["terms", "privacy"].includes(page.route)) {
      const markdown = await readFile(
        resolve(root, `data/${page.route}.md`),
        "utf8",
      );
      const expected = markdownOrderedNumbers(markdown);
      const actual = htmlOrderedNumbers(html);
      if (expected.join(",") !== actual.join(",")) {
        problem(
          `${page.file}: 番号付きリストがMarkdownの番号を維持していません。`,
        );
      }
    }
  }
  for (const redirect of redirects) {
    const html = await readFile(resolve(root, redirect.file), "utf8");
    if (!html.includes(`href="https://towapc.com${redirect.target}"`))
      problem(
        `${redirect.file}: ${redirect.target}への移動リンクがありません。`,
      );
    if (!html.includes('rel="canonical"'))
      problem(`${redirect.file}: canonicalがありません。`);
    if (!html.includes('http-equiv="refresh"'))
      problem(`${redirect.file}: meta refreshがありません。`);
  }
  const expectedPages = new Set(
    pageFiles.map((page) => page.replaceAll("\\", "/")),
  );
  for (const section of ["products", "news", "product", "information"]) {
    const entries = await readdir(resolve(root, section), {
      withFileTypes: true,
    });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const page = `${section}/${entry.name}/index.html`;
      if (existsSync(resolve(root, page)) && !expectedPages.has(page)) {
        problem(`${page}はCSVに存在しない古い詳細ページです。`);
      }
    }
  }
} catch (error) {
  problem(`共通ページ検査: ${error.message}`);
}

try {
  const editorSource = await readFile(
    resolve(root, "editor/server.mjs"),
    "utf8",
  );
  for (const required of [
    "allowedOrigins",
    "x-towapc-csrf",
    "timingSafeEqual",
    "relative(",
  ]) {
    if (!editorSource.includes(required))
      problem(`editor/server.mjs: Editor安全対策「${required}」がありません。`);
  }
} catch (error) {
  problem(`Editor安全対策の検査: ${error.message}`);
}

const transpiler = new Bun.Transpiler({ loader: "js" });
for (const file of [...clientScripts, ...serverScripts]) {
  try {
    const source = await readFile(resolve(root, file), "utf8");
    transpiler.transformSync(source);
  } catch (error) {
    problem(`${file}: JavaScriptの構文エラー: ${error.message}`);
  }
}

if (problems.length) {
  console.error("サイトの検査で問題が見つかりました:\n");
  problems.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log("サイトの構成・CSV・画像・リンクに問題はありません。\n");
}
