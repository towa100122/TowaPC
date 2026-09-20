import {
  escapeHtml,
  safeContactUrl,
  safeHttpUrl,
  safeImageSource,
  site,
} from "./site-data.js";
import { renderLegalMarkdown } from "./legal-markdown.js";
import { newsTagLabels, productTypeLabels } from "./site-schema.js";
import { brandIcon, icon, image, textWithBreaks } from "./ui.js";

export const routes = [
  ["/", "Home"],
  ["/products", "Products"],
  ["/news", "News"],
  ["/about", "About"],
  ["/cooperation", "Cooperation"],
  ["/members", "Members"],
  ["/contact", "Contact"],
  ["/join", "Join"],
];

function plainText(value) {
  return escapeHtml(
    String(value ?? "")
      .replace(/\\n/g, " ")
      .replace(/\s+/g, " "),
  );
}

function externalAttributes(url) {
  return /^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : "";
}

function productArt(product) {
  return `<div class="product-art ${escapeHtml(product.color)}">
    ${image(product.image, product.name, "product-image")}
  </div>`;
}

function productPrimaryAction(product) {
  const destination = parseRelatedLinks(product.links)[0];
  return destination
    ? `<a class="project-move" href="${escapeHtml(destination.url)}" target="_blank" rel="noopener">${escapeHtml(destination.label)} ${icon("external")}</a>`
    : `<span class="project-move is-disabled">リンク準備中</span>`;
}

function productDetails(product) {
  return `<button class="product-detail-action" type="button" data-project-id="${escapeHtml(product.id)}" aria-label="${escapeHtml(product.name)}の詳細を表示">詳細 ${icon("right")}</button>`;
}

function productGridCard(product) {
  return `<article class="product floating" data-project-card="${escapeHtml(product.id)}">
    ${productArt(product)}
    <div class="product-copy">
      <h3>${escapeHtml(product.name)}</h3>
      <span class="category">${escapeHtml(product.category)}</span>
      <p class="product-description">${plainText(product.description)}</p>
      ${productDetails(product)}
      ${productPrimaryAction(product)}
    </div>
  </article>`;
}

function productListRow(product) {
  return `<article class="product-row floating" data-project-card="${escapeHtml(product.id)}">
    ${productArt(product)}
    <div class="product-copy">
      <h3>${escapeHtml(product.name)}</h3>
      <span class="category">${escapeHtml(product.category)}</span>
      <p class="product-description">${plainText(product.description)}</p>
      <div class="product-row-actions">
        ${productDetails(product)}
        ${productPrimaryAction(product)}
      </div>
    </div>
  </article>`;
}

function productCards(items) {
  return `<div class="grid">${items.map(productGridCard).join("")}</div>`;
}

function productRows(items) {
  return `<div class="product-list">${items
    .map(productListRow)
    .join("")}</div>`;
}

export function productView() {
  return "grid";
}

export function productResults(items, view) {
  if (!items.length)
    return '<div class="empty-state">該当する製品はありません。</div>';
  return view === "list" ? productRows(items) : productCards(items);
}

export function newsView() {
  return "grid";
}

export function newsResults(items, view) {
  if (!items.length)
    return '<div class="empty-state">該当するお知らせはありません。</div>';
  return view === "list" ? newsRows(items) : newsCards(items);
}

function newsBadge(item) {
  const tag = String(item.tag || "").toLowerCase();
  return `<span class="badge ${escapeHtml(tag)}">${escapeHtml(newsTagLabels[tag] || item.tag)}</span>`;
}

function parseRelatedLinks(value) {
  return String(value || "")
    .replace(/\\n/g, "\n")
    .split(/;;|\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("|");
      if (separator < 1) return null;
      const label = entry.slice(0, separator).trim();
      const url = safeHttpUrl(entry.slice(separator + 1).trim());
      return label && url ? { label, url } : null;
    })
    .filter(Boolean);
}

function parseAttachments(value) {
  return String(value || "")
    .replace(/\\n/g, "\n")
    .split(/;;|\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("|");
      const label = separator > 0 ? entry.slice(0, separator).trim() : "";
      const path = separator > 0 ? entry.slice(separator + 1).trim() : "";
      if (!label || !/^\/files\/[a-zA-Z0-9._-]+$/.test(path)) return null;
      const extension = path.split(".").pop()?.toUpperCase() || "FILE";
      return { label, path, extension, size: site.attachmentMeta[path] || "" };
    })
    .filter(Boolean);
}

function compactNewsRows(items) {
  return items
    .map(
      (item) =>
        `<a class="news-row" href="/news/${escapeHtml(item.id)}/">
          <span class="news-title">${escapeHtml(item.title)}</span>
          <span class="news-meta"><time>${escapeHtml(item.date)}</time>${newsBadge(item)}</span>
          <span class="row-actions">
            ${image(item.image, "", "news-thumb")}
            <span class="arrow">${icon("right")}</span>
          </span>
        </a>`,
    )
    .join("");
}

function newsArt(item, imageClass) {
  return item.image
    ? image(item.image, "", imageClass)
    : `<span>${icon("bell")}</span>`;
}

export function newsRows(items) {
  return `<div class="news-list-view">${items
    .map(
      (item) =>
        `<a class="news-list-row floating" href="/news/${escapeHtml(item.id)}/">
          <div class="news-list-art">${newsArt(item, "news-list-image")}</div>
          <div class="news-list-copy">
            <h2>${escapeHtml(item.title)}</h2>
            <div class="news-meta"><time>${escapeHtml(item.date)}</time>${newsBadge(item)}</div>
            <p>${plainText(item.body)}</p>
            <span class="news-list-more">詳しく見る ${icon("right")}</span>
          </div>
        </a>`,
    )
    .join("")}</div>`;
}

export function newsCards(items) {
  const cards = items
    .map(
      (
        item,
      ) => `<a class="news-card floating" href="/news/${escapeHtml(item.id)}/">
        <div class="news-card-art">${newsArt(item, "news-card-image")}</div>
        <div class="news-card-copy">
          <h2>${escapeHtml(item.title)}</h2>
          <div class="news-meta"><time>${escapeHtml(item.date)}</time>${newsBadge(item)}</div>
          <p>${plainText(item.body)}</p>
          <span class="news-card-more">詳しく見る ${icon("right")}</span>
        </div>
      </a>`,
    )
    .join("");
  return `<div class="news-grid">${cards}</div>`;
}

export function pageHero(title, subtitle, extraClass = "") {
  return `<section class="page-hero ${extraClass}">
    <div class="wrap">
      <div class="breadcrumbs"><a href="/">Home</a> / ${escapeHtml(title)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
    </div>
  </section>`;
}

function home() {
  const quickLinks = [
    ["products", "Products", "私たちの製品の紹介", "lavender", "grid"],
    ["about", "About", "TowaPCについて", "mint", "about"],
    ["contact", "Contact", "お問い合わせ", "pink", "mail"],
    ["join", "Join", "私たちの一員になる", "cream", "join"],
  ]
    .map(
      ([path, label, subtitle, color, type]) =>
        `<a href="/${path}/" class="quick-link floating ${color}">
          ${icon(type)}
          <div><strong>${label}</strong><small>${subtitle}</small></div>
          <span class="arrow">${icon("right")}</span>
        </a>`,
    )
    .join("");
  const heroSource = safeImageSource(site.hero);
  return `<section class="hero">
    ${heroSource ? `<img class="hero-background" src="${escapeHtml(heroSource)}" alt="夕焼けに染まる街並み" fetchpriority="high">` : ""}
    <h1>${escapeHtml(site.headline)}</h1>
  </section>
  <div class="wrap">
    <section class="intro floating">
      <h2>What’s TowaPC?</h2>
      <p>${escapeHtml(site.description)}</p>
      <a class="text-link" href="/about/">TowaPCについて ${icon("right")}</a>
    </section>
    <section class="news-strip floating">
      <div class="news-heading">
        <a class="news-label" href="/news/">${icon("bell")}News</a>
        <a class="news-all text-link" href="/news/">すべて見る ${icon("right")}</a>
      </div>
      <div class="news-list">${compactNewsRows(site.news.slice(0, 3))}</div>
    </section>
    <section class="quick-links">${quickLinks}</section>
    <section class="section home-products-section">
      <div class="section-heading">
        <h2>Our products</h2>
        <a class="text-link" href="/products/">すべての製品を見る ${icon("right")}</a>
      </div>
      ${productCards(site.products.slice(0, 3))}
    </section>
  </div>`;
}

function products() {
  const view = productView();
  const filters = [["all", "すべて"], ...Object.entries(productTypeLabels)]
    .map(
      ([value, label]) =>
        `<button class="filter ${value === "all" ? "active" : ""}" data-filter="${value}" aria-pressed="${value === "all"}">${label}</button>`,
    )
    .join("");
  return `${pageHero("Products", "私たちの製品の紹介")}
    <section class="section wrap">
      <div class="product-toolbar">
        <div class="filters">${filters}</div>
        <div class="view-switch" role="group" aria-label="製品の表示形式">
          <button class="view-button ${view === "grid" ? "active" : ""}" data-product-view="grid" aria-pressed="${view === "grid"}">${icon("grid")}グリッド</button>
          <button class="view-button ${view === "list" ? "active" : ""}" data-product-view="list" aria-pressed="${view === "list"}">${icon("list")}リスト</button>
        </div>
      </div>
      <div id="product-results">${productResults(site.products, view)}</div>
    </section>`;
}

function news() {
  const view = newsView();
  const filters = [["all", "すべて"], ...Object.entries(newsTagLabels)]
    .map(
      ([value, label]) =>
        `<button class="filter ${value === "all" ? "active" : ""}" data-news-filter="${escapeHtml(value)}" aria-pressed="${value === "all"}">${escapeHtml(label)}</button>`,
    )
    .join("");
  return `${pageHero("News", "TowaPCからのお知らせ")}
    <section class="section wrap">
      <div class="news-toolbar">
        <div class="filters">${filters}</div>
        <div class="view-switch" role="group" aria-label="お知らせの表示形式">
          <button class="view-button ${view === "grid" ? "active" : ""}" data-news-view="grid" aria-pressed="${view === "grid"}">${icon("grid")}グリッド</button>
          <button class="view-button ${view === "list" ? "active" : ""}" data-news-view="list" aria-pressed="${view === "list"}">${icon("list")}リスト</button>
        </div>
      </div>
      <div id="news-results">${newsResults(site.news, view)}</div>
    </section>`;
}

function historyCards() {
  return site.history
    .map((event) => {
      const colored =
        event.colored === "y" && /^#[0-9a-f]{6}$/i.test(event.color);
      const textColor = event.textColor === "white" ? "#fff" : "#171916";
      const style = colored
        ? ` style="--history-background:${escapeHtml(event.color)};--history-text:${textColor}"`
        : "";
      return `<article class="history-card floating${colored ? " is-colored" : ""}"${style}>
        <time>${textWithBreaks(event.date)}</time>
        <div><h3>${escapeHtml(event.title)}</h3><p>${textWithBreaks(event.description)}</p></div>
      </article>`;
    })
    .join("");
}

function about() {
  const logo = safeImageSource(site.logo) || "/assets/TowaPC.svg";
  const history = historyCards();
  return `${pageHero("About", "TowaPCについて")}
    <section class="section wrap about-page">
      <div class="article floating about-summary">
        <div class="about-heading">
          <button class="about-logo-trigger" type="button" aria-label="TowaPCロゴ" data-animation-trigger>
            <img class="about-logo" src="${escapeHtml(logo)}" alt="TowaPC">
          </button>
        </div>
        <p>${escapeHtml(site.description)}</p>
        ${site.about.statement ? `<p>${escapeHtml(site.about.statement)}</p>` : ""}
        <nav class="about-links about-actions" aria-label="TowaPCについてのリンク">
          <a class="soft-button" href="/members/"><span>TowaPCのメンバー</span>${icon("right")}</a>
          <a class="soft-button" href="/cooperation/"><span>協力関係がある団体・個人</span>${icon("right")}</a>
          <a class="soft-button" href="/join/"><span>私たちの一員になる</span>${icon("right")}</a>
        </nav>
      </div>
      ${
        history
          ? `<section class="about-section history-section">
        <div class="section-heading"><h2>History</h2></div>
        <div class="history-timeline">${history}</div>
      </section>`
          : ""
      }
      ${
        site.about.originTitle && site.about.originBody
          ? `<section class="about-section origin-section">
        <div class="origin-content">
          <h2>${escapeHtml(site.about.originTitle)}</h2>
          <p>${textWithBreaks(site.about.originBody)}</p>
        </div>
      </section>`
          : ""
      }
    </section>`;
}

function join() {
  const url = safeHttpUrl(site.joinUrl);
  const action = url
    ? `<a class="cta" href="${escapeHtml(url)}" target="_blank" rel="noopener">Discordサーバーに参加する ${icon("right")}</a>`
    : '<span class="status">参加リンクは、ただいま準備中です</span>';
  return `${pageHero("Join", "私たちの一員になる")}
    <section class="section wrap join-section">
      <div class="join-box floating">
        <h2>TowaPCのメンバーになる</h2>
        <p>TowaPCのメンバーになるには、以下のリンクから私たちのDiscordサーバーに参加してください。</p>
        ${action}
      </div>
    </section>`;
}

function directory(kind) {
  const cooperation = kind === "cooperation";
  const list = cooperation ? site.partners : site.members;
  const title = cooperation ? "Cooperation" : "Members";
  const subtitle = cooperation
    ? "協力関係がある団体・個人"
    : "TowaPCのメンバー";
  const entries = list
    .map((item, index) => {
      if (cooperation) {
        return `<button class="directory-card partner-card floating" type="button" data-partner-index="${index}" aria-label="${escapeHtml(item.name)}の詳細を表示">
          ${image(item.image, item.name, "directory-image company-logo")}
          <div class="directory-copy">
            <h2>${escapeHtml(item.name)}</h2>
            <span class="category">${escapeHtml(item.role || "")}</span>
            <p>${escapeHtml(item.description || "")}</p>
            <span class="directory-more">詳細 ${icon("popup")}</span>
          </div>
        </button>`;
      }
      return `<button class="directory-card member-card floating" type="button" data-member-index="${index}" aria-label="${escapeHtml(item.name)}の詳細を表示">
        ${image(item.image, item.name, "directory-image member-image")}
        <div class="directory-copy">
          <h2>${escapeHtml(item.name)}</h2>
          <span class="category">${escapeHtml(item.role || "")}</span>
          <p>${escapeHtml(item.description || "")}</p>
          <span class="directory-more">詳細 ${icon("popup")}</span>
        </div>
      </button>`;
    })
    .join("");
  const emptyState = `<div class="empty-state floating">
    ${icon(cooperation ? "link" : "people")}
    <p>${cooperation ? "掲載する団体・個人" : "メンバー情報"}を準備しています。</p>
    <small>dataフォルダーのCSVから追加できます。</small>
  </div>`;
  return `${pageHero(title, subtitle)}
    <section class="section wrap">
      <div class="directory-grid ${cooperation ? "partner-grid" : "member-grid"}">${entries || emptyState}</div>
    </section>`;
}

function coreContactCards() {
  const contacts = [
    ["youtube", "YouTube", site.socials.youtube, site.labels.youtube],
    ["x", "X", site.socials.x, site.labels.x],
    ["discord", "Discord", site.socials.discord, site.labels.discord],
    ["mail", "Email", site.contactUrl, site.labels.contact],
  ];
  return contacts
    .map(([type, label, value, detail]) => {
      const url = type === "mail" ? safeContactUrl(value) : safeHttpUrl(value);
      const contactIcon = type === "mail" ? icon(type) : brandIcon(type);
      if (!url) {
        return `<button id="${type}" class="contact-card floating pending" type="button" aria-label="${label}：URL準備中">
          ${contactIcon}<div><h2>${label}</h2><p>URL準備中</p></div>${icon("right")}
        </button>`;
      }
      if (type === "mail") {
        const address = url.replace(/^mailto:/i, "");
        return `<div id="${type}" class="contact-card contact-card-email floating">
          ${contactIcon}<div><h2>${label}</h2><p>${escapeHtml(detail || address)}</p></div>
          <div class="contact-card-actions">
            <button class="contact-copy" type="button" data-copy-email="${escapeHtml(address)}" aria-label="メールアドレスをコピー">${icon("copy")}</button>
            <a class="contact-arrow" href="${escapeHtml(url)}" aria-label="メールを開く">${icon("right")}</a>
          </div>
        </div>`;
      }
      return `<a id="${type}" class="contact-card floating" href="${escapeHtml(url)}"${externalAttributes(url)}>
        ${contactIcon}<div><h2>${label}</h2><p>${escapeHtml(detail || "公式ページ")}</p></div>${icon("right")}
      </a>`;
    })
    .join("");
}

function additionalContactCards() {
  return site.contacts
    .map((contact) => {
      const url = safeContactUrl(contact.url);
      if (!url) return "";
      return `<a class="contact-card contact-card-extra floating" href="${escapeHtml(url)}"${externalAttributes(url)}>
        ${icon("link")}
        <div><h2>${escapeHtml(contact.label)}</h2><p>${escapeHtml(contact.description || contact.url)}</p></div>
        ${icon("right")}
      </a>`;
    })
    .join("");
}

function contact() {
  return `${pageHero("Contact", "お問い合わせ・公式リンク")}
    <section class="section wrap">
      <div class="contact-grid">${coreContactCards()}${additionalContactCards()}</div>
    </section>`;
}

function detail(kind, id) {
  if (kind !== "news") return missing();
  const item = site.news.find((entry) => entry.id === id);
  if (!item) return missing();
  const links = parseRelatedLinks(item.links);
  const attachments = parseAttachments(item.attachments);
  const linkButtons = links.length
    ? `<div class="related-links">${links
        .map(
          ({ label, url }) =>
            `<a class="cta item-url" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ${icon("right")}</a>`,
        )
        .join("")}</div>`
    : "";
  const title = item.title;
  const body = item.body;
  const meta = `${escapeHtml(item.date)} · ${newsBadge(item)}`;
  const copy = `<div class="detail-copy">
    <h2>${escapeHtml(title)}</h2>
    <span class="category detail-category">${meta}</span>
    <p>${textWithBreaks(body)}</p>
    ${
      attachments.length
        ? `<section class="news-attachments" aria-label="添付ファイル"><h3>Attachments</h3>${attachments
            .map(
              (
                attachment,
              ) => `<a class="file-attachment" href="${escapeHtml(attachment.path)}" download>
          ${icon("file")}<span><strong>${escapeHtml(attachment.label)}</strong><small>${escapeHtml(attachment.extension)}${attachment.size ? ` · ${escapeHtml(attachment.size)}` : ""}</small></span>${icon("download")}
        </a>`,
            )
            .join("")}</section>`
        : ""
    }
    <div class="detail-actions">
      ${linkButtons}
      <a class="text-link back-link" href="/news/">${icon("left")} 一覧に戻る</a>
    </div>
  </div>`;
  const content = `${image(item.image, item.title, "article-image")}${copy}`;
  const otherNews = site.news.filter((entry) => entry.id !== id);
  const sidebar = otherNews.length
    ? `<aside class="article-sidebar" aria-label="ほかのお知らせ">
        <h2>ほかのお知らせ</h2>
        ${otherNews
          .map(
            (entry) => `<a href="/news/${escapeHtml(entry.id)}/">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(entry.date)} ${newsBadge(entry)}</span>
            </a>`,
          )
          .join("")}
      </aside>`
    : "";
  return `${pageHero("News", "お知らせ")}
    <section class="section wrap detail-layout">
      <article class="article floating news-article">${content}</article>
      ${sidebar}
    </section>`;
}

function legalPage(kind) {
  const privacy = kind === "privacy";
  const title = privacy ? "Privacy Policy" : "Terms of Service";
  const subtitle = privacy ? "プライバシーポリシー" : "利用規約";
  const content = renderLegalMarkdown(
    privacy ? site.legal.privacy : site.legal.terms,
  );
  return `<section class="page-hero">
    <div class="wrap">
      <div class="breadcrumbs"><a href="/">Home</a> / ${escapeHtml(title)}</div>
      <p class="page-hero-title">${escapeHtml(title)}</p>
      <p>${escapeHtml(subtitle)}</p>
    </div>
  </section>
    <section class="section wrap">
      <article class="article legal-document floating">
        ${content}
      </article>
    </section>`;
}

export function missing() {
  return `<section class="section wrap not-found">
    <div class="not-found-card floating">
      <button class="not-found-number" type="button" aria-label="404" data-shred-trigger>404</button>
      <h1 class="not-found-label">Not found</h1>
      <p class="not-found-copy">お探しのページは迷子かもしれません。</p>
    </div>
  </section>`;
}

export function renderPage(route, id, appearanceView) {
  if (id) return detail(route, id);
  const pages = {
    "": home,
    products,
    news,
    about,
    appearance: appearanceView,
    join,
    cooperation: () => directory("cooperation"),
    members: () => directory("members"),
    contact,
    terms: () => legalPage("terms"),
    privacy: () => legalPage("privacy"),
  };
  return (pages[route] || missing)();
}

export function renderFooterLinks() {
  return routes
    .filter(([path]) => path !== "/contact")
    .map(
      ([path, title]) =>
        `<a href="${path === "/" ? "/" : `${path}/`}">${title}</a>`,
    )
    .join("");
}

export function renderFooterContacts() {
  const core = [
    ["youtube", "YouTube", safeHttpUrl(site.socials.youtube)],
    ["x", "X", safeHttpUrl(site.socials.x)],
    ["discord", "Discord", safeHttpUrl(site.socials.discord)],
    [
      "mail",
      "Email",
      safeContactUrl(site.contactUrl) ? "/contact/#mail" : "/contact/",
    ],
  ]
    .filter(([, , url]) => url)
    .map(([type, label, url]) => {
      const contactIcon = type === "mail" ? icon("mail") : brandIcon(type);
      return `<a class="footer-contact-icon footer-contact-${type}" href="${escapeHtml(url)}"${externalAttributes(url)} aria-label="${label}">${contactIcon}</a>`;
    })
    .join("");
  const additional = site.contacts
    .map((contact) => {
      const url = safeContactUrl(contact.url);
      return url
        ? `<a href="${escapeHtml(url)}"${externalAttributes(url)}>${escapeHtml(contact.label)}</a>`
        : "";
    })
    .join("");
  return `<div class="footer-contact-icons">${core}</div>${additional}`;
}
