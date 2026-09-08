import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "./csv.mjs";
import { getPageFiles } from "./site-files.mjs";

const root = resolve(import.meta.dirname, "..");
const problems = [];
const schemas = {
  "site.csv": ["key", "value"],
  "products.csv": [
    "id",
    "name",
    "category",
    "type",
    "description",
    "color",
    "image",
  ],
  "news.csv": ["id", "date", "tag", "title", "body", "image"],
  "partners.csv": ["name", "role", "description", "image", "url"],
  "members.csv": ["name", "role", "description", "image", "url"],
};
const requiredFields = {
  "products.csv": ["id", "name", "category", "type", "description"],
  "news.csv": ["id", "date", "tag", "title", "body"],
  "partners.csv": ["name", "role", "description"],
  "members.csv": ["name", "role", "description"],
};
const csvData = {};

function problem(message) {
  problems.push(message);
}

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
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

for (const [file, expectedHeaders] of Object.entries(schemas)) {
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

const productTypes = new Set(["app", "web", "project"]);
const productColors = new Set(["pink", "lavender", "mint", "cream", "peach"]);
for (const [index, product] of (csvData["products.csv"] || []).entries()) {
  if (!productTypes.has(product.type)) {
    problem(
      `products.csv ${index + 2}行目: type「${product.type}」は使用できません。`,
    );
  }
  if (product.color && !productColors.has(product.color)) {
    problem(
      `products.csv ${index + 2}行目: color「${product.color}」は使用できません。`,
    );
  }
}

for (const [index, news] of (csvData["news.csv"] || []).entries()) {
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(news.date)) {
    problem(
      `news.csv ${index + 2}行目: dateはYYYY.MM.DD形式で指定してください。`,
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
const requiredSiteKeys = [
  "logo",
  "hero",
  "headline",
  "description",
  "joinUrl",
  "contactUrl",
  "socials.youtube",
  "socials.x",
  "socials.discord",
  "labels.youtube",
  "labels.x",
  "labels.discord",
  "labels.contact",
];
for (const key of requiredSiteKeys) {
  if (!(key in site)) problem(`site.csv: ${key}の行がありません。`);
}
for (const key of [
  "logo",
  "hero",
  "headline",
  "description",
  "contactUrl",
  "socials.youtube",
  "socials.x",
  "socials.discord",
  "labels.youtube",
  "labels.x",
  "labels.discord",
  "labels.contact",
]) {
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
} catch (error) {
  problem(`共通ページ検査: ${error.message}`);
}

const transpiler = new Bun.Transpiler({ loader: "js" });
for (const file of ["app-v2.js", "site-data.js", "content-v2.js"]) {
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
