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
import { getPageFiles } from "./site-files.mjs";

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

const requiredClientFiles = [
  "app-v2.js",
  "appearance.css",
  "cookie-consent.js",
  "csv.js",
  "legal-content.js",
  "site-data.js",
  "site-schema.js",
  "style-v2.css",
  "apple-touch-icon.png",
  "favicon.png",
  "assets/TowaPC.svg",
  "assets/social-discord.svg",
  "assets/social-x.svg",
  "assets/social-youtube.svg",
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
      if (row.url && !isHttpUrl(row.url)) {
        problem(
          `${file} ${rowNumber}行目: urlが正しいHTTP(S) URLではありません。`,
        );
      }
      checkLinks(file, rowNumber, row.links);
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
  const template = await readFile(resolve(root, "templates/page.html"), "utf8");
  const pageFiles = await getPageFiles(root);
  for (const page of pageFiles) {
    const pagePath = resolve(root, page);
    if (!existsSync(pagePath)) {
      problem(`${page}がありません。bun run sync-pagesを実行してください。`);
      continue;
    }
    if ((await readFile(pagePath, "utf8")) !== template) {
      problem(
        `${page}が共通テンプレートと一致していません。bun run sync-pagesを実行してください。`,
      );
    }
  }
  const expectedPages = new Set(
    pageFiles.map((page) => page.replaceAll("\\", "/")),
  );
  for (const section of ["product", "information"]) {
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

const transpiler = new Bun.Transpiler({ loader: "js" });
for (const file of [
  "app-v2.js",
  "cookie-consent.js",
  "csv.js",
  "site-data.js",
  "site-schema.js",
  "legal-content.js",
  "content-v2.js",
]) {
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
