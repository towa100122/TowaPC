import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadSiteDataFromDisk } from "./load-site-data.mjs";
import {
  getPageDescriptors,
  getPageFiles,
  getRedirectDescriptors,
} from "./site-files.mjs";

const root = resolve(import.meta.dirname, "..");
const template = await readFile(resolve(root, "templates/page.html"), "utf8");
const themeBootstrap = await readFile(
  resolve(root, "theme-bootstrap.js"),
  "utf8",
);
const bundleResult = await Bun.build({
  entrypoints: [resolve(root, "app-v2.js")],
  target: "browser",
  format: "esm",
  minify: false,
  sourcemap: "none",
});
if (!bundleResult.success) {
  throw new Error(
    `ブラウザー用JavaScriptの生成に失敗しました。\n${bundleResult.logs.join("\n")}`,
  );
}
const appBundle = await bundleResult.outputs[0].text();
await mkdir(resolve(root, "generated"), { recursive: true });
await writeFile(resolve(root, "generated/app-bundle.js"), appBundle, "utf8");
const styleFiles = [...template.matchAll(/href="\/(styles\/[^"?]+\.css)/g)].map(
  (match) => match[1],
);
const styleSources = await Promise.all(
  styleFiles.map((file) => readFile(resolve(root, file), "utf8")),
);
const assetVersion = createHash("sha256")
  .update(appBundle)
  .update(styleSources.join("\n"))
  .digest("hex")
  .slice(0, 12);
const data = await loadSiteDataFromDisk(root);

globalThis.location = new URL("https://towapc.com/");
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const [{ site }, views, appearance, ui] = await Promise.all([
  import("../site-data.js"),
  import("../page-views.js"),
  import("../appearance-settings.js"),
  import("../ui.js"),
]);
Object.assign(site, data);

function escapeAttribute(value) {
  return String(value).replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
  );
}

function headerNavigation() {
  const routes = [
    ["", "Home"],
    ["products", "Products"],
    ["news", "News"],
    ["about", "About"],
    ["contact", "Contact"],
  ];
  return `<span class="nav-selection"></span>${routes
    .map(
      ([path, label]) =>
        `<a href="/${path ? `${path}/` : ""}" data-route="${path}">${label}</a>`,
    )
    .join("")}`;
}

function renderDocument(page) {
  const label = page.title === "Home" ? "Home" : page.title;
  const title = `TowaPC — ${label}`;
  const routeDescriptions = {
    products: "TowaPCの製品と開発プロジェクトを紹介します。",
    news: "TowaPCからの最新のお知らせです。",
    about: "TowaPCの考え方、歩み、名前の由来を紹介します。",
    members: "TowaPCのメンバーを紹介します。",
    cooperation: "TowaPCと協力関係がある団体・個人を紹介します。",
    contact: "TowaPCの公式リンクとお問い合わせ先です。",
    join: "TowaPC Communityへの参加方法です。",
    terms: "TowaPC.comの利用規約です。",
    privacy: "TowaPC.comのプライバシーポリシーです。",
    appearance: "TowaPC.comの外観をこの端末向けに調整できます。",
    404: "お探しのページは見つかりませんでした。",
  };
  const description = (
    page.description ||
    routeDescriptions[page.route] ||
    data.description
  ).slice(0, 160);
  const canonicalPath =
    page.file === "index.html"
      ? "/"
      : `/${page.file.replace(/index\.html$/, "")}`;
  const canonical = new URL(canonicalPath, location.origin).href;
  const body = views.renderPage(
    page.route,
    page.id,
    appearance.renderAppearanceLab,
  );
  const homeLink = page.route
    ? `<div class="page-home-link wrap"><a class="text-link" href="/">${ui.icon("left")} ホームに戻る</a></div>`
    : "";
  const replacements = {
    "{{TITLE}}": escapeAttribute(title),
    "{{DESCRIPTION}}": escapeAttribute(description),
    "{{CANONICAL}}": escapeAttribute(canonical),
    "{{HEADER_NAV}}": headerNavigation(),
    "{{MAIN}}": body + homeLink,
    "{{FOOTER_LINKS}}": views.renderFooterLinks(),
    "{{FOOTER_CONTACTS}}": views.renderFooterContacts(),
    "{{ASSET_VERSION}}": assetVersion,
    "{{SITE_DATA}}": JSON.stringify(embeddedDataFor(page)).replaceAll(
      "<",
      "\\u003c",
    ),
    "/*__THEME_BOOTSTRAP__*/": themeBootstrap.trim(),
  };
  return Object.entries(replacements)
    .reduce(
      (html, [placeholder, value]) => html.replaceAll(placeholder, value),
      template,
    )
    .replace(/[ \t]+$/gm, "");
}

function embeddedDataFor(page) {
  const {
    products,
    news,
    partners,
    members,
    history,
    legal,
    attachmentMeta,
    ...shared
  } = data;
  const embedded = { ...shared };
  if (["", "products"].includes(page.route)) embedded.products = products;
  if (["", "news"].includes(page.route)) {
    embedded.news =
      page.route === "news" && page.id
        ? news
            .filter((item) => item.id === page.id)
            .concat(news.filter((item) => item.id !== page.id).slice(0, 4))
        : news;
    embedded.attachmentMeta = attachmentMeta;
  }
  if (page.route === "about") embedded.history = history;
  if (page.route === "members") embedded.members = members;
  if (page.route === "cooperation") embedded.partners = partners;
  if (page.route === "terms") embedded.legal = { terms: legal.terms };
  if (page.route === "privacy") embedded.legal = { privacy: legal.privacy };
  return embedded;
}

function redirectDocument(target) {
  const url = new URL(target, location.origin).href;
  const safeUrl = escapeAttribute(url);
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>ページを移動しました — TowaPC</title>
    <link rel="canonical" href="${safeUrl}">
    <meta http-equiv="refresh" content="0;url=${safeUrl}">
    <script>location.replace(${JSON.stringify(url)});</script>
  </head>
  <body><p>ページを移動しました。<a href="${safeUrl}">新しいページを開く</a></p></body>
</html>
`;
}

const [pages, redirects] = await Promise.all([
  getPageDescriptors(root),
  getRedirectDescriptors(root),
]);
for (const page of pages) {
  const target = resolve(root, page.file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, renderDocument(page), "utf8");
}
for (const redirect of redirects) {
  const target = resolve(root, redirect.file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, redirectDocument(redirect.target), "utf8");
}

const expected = new Set(await getPageFiles(root));
for (const section of ["products", "news", "product", "information"]) {
  const sectionPath = resolve(root, section);
  const entries = await readdir(sectionPath, { withFileTypes: true }).catch(
    () => [],
  );
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const page = `${section}/${entry.name}/index.html`;
    if (!expected.has(page))
      await rm(resolve(sectionPath, entry.name), { recursive: true });
  }
}

console.log(
  `${pages.length}ページと${redirects.length}リダイレクトを更新しました。`,
);
