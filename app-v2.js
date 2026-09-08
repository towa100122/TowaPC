import {
  escapeHtml as E,
  loadSiteData,
  safeContactUrl,
  safeHttpUrl,
  safeImageSource,
  site as S,
} from "./site-data.js?v=38";
const routes = [
  ["/", "Home"],
  ["/product", "Product"],
  ["/information", "Information"],
  ["/about", "About"],
  ["/join", "Join"],
  ["/cooperation", "Cooperation"],
  ["/members", "Members"],
  ["/contact", "Contact"],
];
const iconNames = {
  bell: "notifications",
  grid: "grid_view",
  list: "view_list",
  about: "info",
  join: "person_add",
  right: "arrow_forward",
  left: "arrow_back",
  people: "group",
  link: "link",
  mail: "mail",
};
const icon = (n) =>
  `<span class="material-symbols-rounded icon" aria-hidden="true">${iconNames[n] || iconNames.grid}</span>`;
const brandIcon = (n) =>
  `<img class="brand-icon brand-${E(n)}" src="/assets/social-${E(n)}.svg" alt="" aria-hidden="true">`;
const img = (src, alt, cls = "") =>
  safeImageSource(src)
    ? `<img class="${E(cls)}" src="${E(safeImageSource(src))}" alt="${E(alt)}" loading="lazy">`
    : "";
function art(p) {
  return `<div class="product-art ${E(p.color)}">${img(p.image, p.name, "product-image")}</div>`;
}
function cards(items) {
  return `<div class="grid">${items.map((p) => `<a class="product floating" href="/product/${E(p.id)}/">${art(p)}<div class="product-copy"><span class="category">${E(p.category)}</span><h3>${E(p.name)}</h3><p>${E(p.description)}</p><div class="product-bottom"><span>TowaPC.com</span><span>詳しく見る ${icon("right")}</span></div></div></a>`).join("")}</div>`;
}
function productRows(items) {
  return `<div class="product-list">${items.map((p) => `<a class="product-row floating" href="/product/${E(p.id)}/">${art(p)}<div class="product-copy"><span class="category">${E(p.category)}</span><h3>${E(p.name)}</h3><p>${E(p.description)}</p><div class="product-bottom"><span>TowaPC.com</span><span>詳しく見る ${icon("right")}</span></div></div></a>`).join("")}</div>`;
}
function productView() {
  try {
    return localStorage.getItem("towapc-product-view") === "list"
      ? "list"
      : "grid";
  } catch {
    return "grid";
  }
}
function productResults(items, view) {
  return view === "list" ? productRows(items) : cards(items);
}
function rows(items) {
  return items
    .map(
      (n) =>
        `<a class="news-row" href="/information/${E(n.id)}/"><time>${E(n.date)}</time><span class="badge ${E(String(n.tag || "").toLowerCase())}">${E(n.tag)}</span><span class="news-title">${E(n.title)}</span><span class="row-actions">${img(n.image, "", "news-thumb")}<span class="arrow">${icon("right")}</span></span></a>`,
    )
    .join("");
}
function informationRows(items) {
  return `<div class="information-list">${items
    .map(
      (n) =>
        `<a class="information-row floating" href="/information/${E(n.id)}/"><div class="information-row-art">${n.image ? img(n.image, "", "information-row-image") : `<span>${icon("bell")}</span>`}</div><div class="information-row-copy"><div><time>${E(n.date)}</time><span class="badge ${E(String(n.tag || "").toLowerCase())}">${E(n.tag)}</span></div><h2>${E(n.title)}</h2><p>${E(n.body)}</p><span class="information-row-more">詳しく見る ${icon("right")}</span></div></a>`,
    )
    .join("")}</div>`;
}
function newsCards(items) {
  return `<div class="news-grid">${items.map((n) => `<a class="news-card floating" href="/information/${E(n.id)}/"><div class="news-card-art">${n.image ? img(n.image, "", "news-card-image") : `<span>${icon("bell")}</span>`}</div><div class="news-card-copy"><div><time>${E(n.date)}</time><span class="badge ${E(String(n.tag || "").toLowerCase())}">${E(n.tag)}</span></div><h2>${E(n.title)}</h2><p>${E(n.body)}</p><span class="news-card-more">詳しく見る ${icon("right")}</span></div></a>`).join("")}</div>`;
}
function pageHero(title, jp, extra = "") {
  return `<section class="page-hero ${extra}"><div class="wrap"><div class="breadcrumbs"><a href="/">Home</a> / ${E(title)}</div><h1>${E(title)}</h1><p>${E(jp)}</p></div></section>`;
}
function home() {
  const quick = [
    ["product", "Product", "私たちの製品の紹介", "lavender", "grid"],
    ["about", "About", "TowaPCについて", "mint", "about"],
    ["contact", "Contact", "お問い合わせ", "pink", "mail"],
    ["join", "Join", "私たちの一員になる", "cream", "join"],
  ];
  const heroSource = safeImageSource(S.hero);
  return `<section class="hero">${heroSource ? `<img class="hero-background" src="${E(heroSource)}" alt="夕焼けに染まる街並み" fetchpriority="high">` : ""}<h1>${E(S.headline)}</h1></section><div class="wrap"><section class="intro floating"><h2>What’s “TowaPC”?</h2><p>${E(S.description)}</p><a class="text-link" href="/about/">TowaPCについて ${icon("right")}</a></section><section class="news-strip floating"><div class="news-heading"><a class="news-label" href="/information/">${icon("bell")}Information</a><a class="news-all text-link" href="/information/">すべて見る ${icon("right")}</a></div><div class="news-list">${rows(S.news)}</div></section><section class="quick-links">${quick.map(([path, label, jp, color, type]) => `<a href="/${path}/" class="quick-link floating ${color}">${icon(type)}<div><strong>${label}</strong><small>${jp}</small></div><span class="arrow">${icon("right")}</span></a>`).join("")}</section><section class="section"><div class="section-heading"><h2>Our products</h2><a class="text-link" href="/product/">すべての製品を見る ${icon("right")}</a></div>${cards(S.products)}</section></div>`;
}
function products() {
  const filters = [
      ["all", "すべて"],
      ["app", "アプリケーション"],
      ["web", "Webサービス"],
      ["project", "開発プロジェクト"],
    ],
    view = productView();
  return `${pageHero("Product", "私たちの製品の紹介")}<section class="section wrap"><div class="product-toolbar"><div class="filters">${filters.map(([v, t]) => `<button class="filter ${v === "all" ? "active" : ""}" data-filter="${v}" aria-pressed="${v === "all"}">${t}</button>`).join("")}</div><div class="view-switch" role="group" aria-label="製品の表示形式"><button class="view-button ${view === "grid" ? "active" : ""}" data-product-view="grid" aria-pressed="${view === "grid"}">${icon("grid")}グリッド</button><button class="view-button ${view === "list" ? "active" : ""}" data-product-view="list" aria-pressed="${view === "list"}">${icon("list")}リスト</button></div></div><div id="product-results">${productResults(S.products, view)}</div></section>`;
}
function newsView() {
  try {
    return localStorage.getItem("towapc-news-view") === "list"
      ? "list"
      : "grid";
  } catch {
    return "grid";
  }
}
function information() {
  const view = newsView();
  return `${pageHero("Information", "TowaPCからのお知らせ")}<section class="section wrap"><div class="view-switch" role="group" aria-label="お知らせの表示形式"><button class="view-button ${view === "grid" ? "active" : ""}" data-news-view="grid" aria-pressed="${view === "grid"}">${icon("grid")}グリッド</button><button class="view-button ${view === "list" ? "active" : ""}" data-news-view="list" aria-pressed="${view === "list"}">${icon("list")}リスト</button></div><div id="information-results" class="${view === "list" ? "info-list" : "news-results"}">${view === "list" ? informationRows(S.news) : newsCards(S.news)}</div></section>`;
}
function about() {
  const values = [
    [
      "小さな不便を見つける。",
      "日常の細やかな部分に目を向け、改善できることを探します。",
      "lavender",
    ],
    [
      "確実に便利にする。",
      "派手さよりも使いやすさを大切に、役立つものをつくります。",
      "mint",
    ],
    [
      "少しずつ、育てる。",
      "試して、調整して、長く安心して使える形へ育てていきます。",
      "cream",
    ],
  ];
  return `${pageHero("About", "TowaPCについて")}<section class="section wrap"><div class="article floating about-summary"><h2>TowaPCについて</h2><p>${E(S.description)}</p><p>かゆいところに手が届く、派手でもないけれど確実に便利。日常の細やかな部分を良くしていきたい。TowaPCはそう考えます。</p><div class="about-links"><a class="soft-button" href="/members/"><span>TowaPCのメンバー</span>${icon("right")}</a><a class="soft-button" href="/cooperation/"><span>協力関係がある団体・個人</span>${icon("right")}</a><a class="soft-button" href="/join/"><span>私たちの一員になる</span>${icon("right")}</a></div></div><div class="values">${values.map(([h, p, c]) => `<div class="value floating ${c}"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div></section>`;
}
function join() {
  const url = safeHttpUrl(S.joinUrl);
  const steps = [
    [
      "興味を見つける",
      "製品や取り組みを見て、気になるテーマを探してみてください。",
    ],
    [
      "アイデアを持ち寄る",
      "経験の多さよりも、知りたい・つくりたいという気持ちを。",
    ],
    [
      "TowaPC Communityへ",
      "Discordの招待リンクから参加し、興味のあることを共有できます。",
    ],
  ];
  return `${pageHero("Join", "私たちの一員になる")}<section class="section wrap join-section"><div class="join-box floating"><h2>あなたの「つくりたい」を、<br>ここから。</h2><p>プログラミング、デザイン、アイデア。<br>それぞれの得意や好奇心を持ち寄って、一緒に新しいものづくりをはじめませんか。</p>${url ? `<a class="cta" href="${E(url)}" target="_blank" rel="noopener">TowaPC Communityに参加する ${icon("right")}</a>` : '<span class="status">参加方法は、ただいま準備中です</span>'}</div><div class="values">${steps.map(([h, p]) => `<div class="value floating join-value"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div></section>`;
}
function directory(kind) {
  const cooperation = kind === "cooperation",
    list = cooperation ? S.partners : S.members,
    title = cooperation ? "Cooperation" : "Members",
    jp = cooperation ? "協力関係がある団体・個人" : "TowaPCのメンバー",
    imageClass = cooperation
      ? "directory-image company-logo"
      : "directory-image member-image";
  const entries = list
    .map((item) => {
      const url = safeHttpUrl(item.url);
      return `<article class="directory-card floating">${img(item.image, item.name, imageClass)}<div><span class="category">${E(item.role || "")}</span><h2>${E(item.name)}</h2><p>${E(item.description || "")}</p>${url ? `<a class="text-link" href="${E(url)}" target="_blank" rel="noopener">Webサイト ${icon("right")}</a>` : ""}</div></article>`;
    })
    .join("");
  return `${pageHero(title, jp)}<section class="section wrap"><div class="directory-grid">${entries || `<div class="empty-state floating">${icon(cooperation ? "link" : "people")}<p>${cooperation ? "掲載する団体・個人" : "メンバー情報"}を準備しています。</p><small>dataフォルダーのCSVから追加できます。</small></div>`}</div></section>`;
}
function contact() {
  const contacts = [
    ["youtube", "YouTube", S.socials.youtube, S.labels.youtube],
    ["x", "X", S.socials.x, S.labels.x],
    ["discord", "Discord", S.socials.discord, S.labels.discord],
    ["mail", "お問い合わせ", S.contactUrl, S.labels.contact],
  ];
  const cards = contacts
    .map(([type, label, value, detail]) => {
      const url = type === "mail" ? safeContactUrl(value) : safeHttpUrl(value);
      return url
        ? `<a id="${type}" class="contact-card floating" href="${E(url)}"${type === "mail" ? "" : ' target="_blank" rel="noopener"'}>${type === "mail" ? icon(type) : brandIcon(type)}<div><h2>${label}</h2><p>${E(detail || "公式ページ")}</p></div>${icon("right")}</a>`
        : `<button id="${type}" class="contact-card floating pending" type="button" aria-label="${label}：URL準備中">${type === "mail" ? icon(type) : brandIcon(type)}<div><h2>${label}</h2><p>URL準備中</p></div>${icon("right")}</button>`;
    })
    .join("");
  return `${pageHero("Contact", "お問い合わせ・公式リンク")}<section class="section wrap"><div class="contact-grid">${cards}</div></section>`;
}
function detail(kind, id) {
  if (!["product", "information"].includes(kind)) return missing();
  const isProduct = kind === "product",
    item = (isProduct ? S.products : S.news).find((x) => x.id === id);
  if (!item) return missing();
  const itemUrl = safeHttpUrl(item.url);
  const copy = `<div class="detail-copy"><span class="category">${isProduct ? E(item.category) : `${E(item.date)} · ${E(item.tag)}`}</span><h2>${E(isProduct ? item.name : item.title)}</h2><p>${E(isProduct ? item.description : item.body)}</p>${itemUrl ? `<a class="cta item-url" href="${E(itemUrl)}" target="_blank" rel="noopener">${isProduct ? "Webサイトを見る" : "関連リンクを開く"} ${icon("right")}</a>` : ""}<a class="text-link back-link" href="/${kind}/">${icon("left")} 一覧に戻る</a></div>`;
  return `${pageHero(isProduct ? "Product" : "Information", isProduct ? "私たちの製品の紹介" : "お知らせ")}<section class="section wrap"><article class="article floating ${isProduct ? "product-detail" : ""}">${isProduct ? `${art(item)}${copy}` : `${img(item.image, item.title, "article-image")}${copy}`}</article></section>`;
}
function missing() {
  return `${pageHero("Page not found", "ページが見つかりませんでした")}<section class="section wrap"><a class="cta" href="/">ホームに戻る</a></section>`;
}
function headerNav(route) {
  const items = [
    ["", "Home"],
    ["product", "Product"],
    ["information", "Information"],
    ["about", "About"],
    ["contact", "Contact"],
  ];
  return `<span class="nav-selection"></span>${items.map(([path, label]) => `<a href="/${path ? `${path}/` : ""}" data-route="${path}">${label}</a>`).join("")}`;
}
function render() {
  const parts = location.pathname.split("/").filter(Boolean),
    route = parts[0] || "",
    pages = {
      "": home,
      product: products,
      information,
      about,
      join,
      cooperation: () => directory("cooperation"),
      members: () => directory("members"),
      contact,
    };
  const main = document.getElementById("main");
  main.innerHTML =
    parts.length > 1 ? detail(route, parts[1]) : (pages[route] || missing)();
  document.title = `TowaPC — ${routes.find(([p]) => p === `/${route}`)?.[1] || (route ? "Page" : "Home")}`;
  const logo = safeImageSource(S.logo) || "/assets/TowaPC.svg";
  document
    .querySelectorAll(".custom-logo")
    .forEach((image) => image.setAttribute("src", logo));
  const nav = document.querySelector(".header nav");
  if (!nav.querySelector("[data-route]")) nav.innerHTML = headerNav(route);
  nav
    .querySelectorAll("[data-route]")
    .forEach((a) => a.classList.toggle("active", a.dataset.route === route));
  document.querySelector("[data-footer-links]").innerHTML = routes
    .filter(([p]) => p !== "/contact")
    .map(([p, t]) => `<a href="${p === "/" ? "/" : p + "/"}">${t}</a>`)
    .join("");
  const footerSocials = [
      ["YouTube", S.socials.youtube],
      ["X", S.socials.x],
      ["Discord", S.socials.discord],
    ],
    footerMail = safeContactUrl(S.contactUrl) || "/contact/";
  document.querySelector("[data-footer-contact]").innerHTML =
    footerSocials
      .map(([label, value]) => [label, safeHttpUrl(value)])
      .filter(([, url]) => url)
      .map(
        ([label, url]) =>
          `<a href="${E(url)}" target="_blank" rel="noopener">${label}</a>`,
      )
      .join("") + `<a href="${E(footerMail)}">お問い合わせ</a>`;
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("--menu-scroll-y");
  const menuButton = document.querySelector(".menu-button");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "メニューを開く");
  menuButton.querySelector(".material-symbols-rounded").textContent = "menu";
  document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      const view =
          document.querySelector("[data-product-view].active")?.dataset
            .productView || productView(),
        items = S.products.filter(
          (p) => b.dataset.filter === "all" || p.type === b.dataset.filter,
        );
      document.getElementById("product-results").innerHTML = productResults(
        items,
        view,
      );
      reveal();
    }),
  );
  document.querySelectorAll("[data-product-view]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-product-view]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      try {
        localStorage.setItem("towapc-product-view", b.dataset.productView);
      } catch {}
      const filter =
          document.querySelector("[data-filter].active")?.dataset.filter ||
          "all",
        items = S.products.filter((p) => filter === "all" || p.type === filter);
      document.getElementById("product-results").innerHTML = productResults(
        items,
        b.dataset.productView,
      );
      reveal();
    }),
  );
  document.querySelectorAll("[data-news-view]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-news-view]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      try {
        localStorage.setItem("towapc-news-view", b.dataset.newsView);
      } catch {}
      const results = document.getElementById("information-results");
      results.className =
        b.dataset.newsView === "list" ? "info-list" : "news-results";
      results.innerHTML =
        b.dataset.newsView === "list"
          ? informationRows(S.news)
          : newsCards(S.news);
      reveal();
    }),
  );
  window.scrollTo({ top: 0, behavior: "instant" });
  reveal();
  main.classList.remove("page-enter");
  void main.offsetWidth;
  main.classList.add("page-enter");
  requestAnimationFrame(positionSelection);
}
function showDataWarning(failures) {
  if (!failures.length) return;
  const warning = document.createElement("aside");
  warning.className = "data-warning";
  warning.setAttribute("role", "status");
  warning.textContent =
    "一部の情報を読み込めませんでした。時間を置いて再読み込みしてください。";
  document.getElementById("main").prepend(warning);
}
async function start() {
  const failures = await loadSiteData();
  render();
  showDataWarning(failures);
}
let menuScrollY = 0;
function setMenuLock(open) {
  if (open) {
    menuScrollY = window.scrollY;
    document.body.style.setProperty("--menu-scroll-y", `${menuScrollY}px`);
    document.body.classList.add("menu-open");
  } else {
    document.body.classList.remove("menu-open");
    document.body.style.removeProperty("--menu-scroll-y");
    window.scrollTo({ top: menuScrollY, behavior: "instant" });
  }
}
function setMenuState(open) {
  const nav = document.querySelector(".header nav"),
    button = document.querySelector(".menu-button");
  nav.classList.toggle("open", open);
  setMenuLock(open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute(
    "aria-label",
    open ? "メニューを閉じる" : "メニューを開く",
  );
  button.querySelector(".material-symbols-rounded").textContent = open
    ? "close"
    : "menu";
}
document.querySelector(".menu-button").addEventListener("click", () => {
  const nav = document.querySelector(".header nav");
  setMenuState(!nav.classList.contains("open"));
});
document.addEventListener("click", (e) => {
  const nav = document.querySelector(".header nav");
  if (
    nav.classList.contains("open") &&
    !e.target.closest(".header nav") &&
    !e.target.closest(".menu-button")
  )
    setMenuState(false);
});
document
  .querySelector(".back-top")
  .addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (
    !a ||
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    a.target
  )
    return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin) return;
  e.preventDefault();
  if (document.querySelector(".header nav").classList.contains("open"))
    setMenuState(false);
  const next = u.pathname === "/" ? "/" : u.pathname.replace(/\/?$/, "/");
  if (location.pathname !== next) history.pushState(null, "", next + u.hash);
  render();
  if (u.hash)
    requestAnimationFrame(() =>
      document.querySelector(u.hash)?.scrollIntoView({ behavior: "smooth" }),
    );
});
let observer;
function reveal() {
  if (observer) observer.disconnect();
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const current = new IntersectionObserver(
    (es) =>
      es.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        target.style.setProperty(
          "--reveal-delay",
          `${target.dataset.revealDelay || 0}ms`,
        );
        target.classList.add("is-visible", "play-reveal");
        target.addEventListener(
          "animationend",
          () => target.classList.remove("play-reveal"),
          { once: true },
        );
        current.unobserve(target);
      }),
    { threshold: 0.08 },
  );
  observer = current;
  const items = [...document.querySelectorAll(".floating,.section-heading")];
  items.forEach((e, i) => {
    e.classList.remove("is-visible", "play-reveal");
    e.classList.add("reveal");
    e.dataset.revealDelay = String((i % 4) * 55);
  });
  requestAnimationFrame(() => {
    if (observer === current) items.forEach((e) => current.observe(e));
  });
}
function positionSelection() {
  const nav = document.querySelector(".header nav");
  if (!nav) return;
  const selected = nav.querySelector(
      ":scope>a.active,:scope>details.active-group>summary",
    ),
    pill = nav.querySelector(".nav-selection");
  if (!pill) return;
  if (!selected || !nav.offsetWidth) {
    pill.style.opacity = "0";
    return;
  }
  pill.style.opacity = "1";
  pill.style.width = `${selected.offsetWidth}px`;
  pill.style.height = `${selected.offsetHeight}px`;
  pill.style.transform = `translate(${selected.offsetLeft}px,${selected.offsetTop}px)`;
  requestAnimationFrame(() => nav.classList.add("nav-ready"));
}
function setupTheme() {
  const switcher = document.querySelector(".theme-switch"),
    buttons = document.querySelectorAll("[data-theme-option]");
  const sync = () => {
    const theme = document.documentElement.dataset.theme;
    switcher.dataset.active = theme;
    buttons.forEach((button) => {
      const active = button.dataset.themeOption === theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      document.documentElement.dataset.theme = button.dataset.themeOption;
      sync();
    }),
  );
  const systemTheme = matchMedia("(prefers-color-scheme:dark)");
  systemTheme.addEventListener("change", (event) => {
    document.documentElement.dataset.theme = event.matches ? "dark" : "light";
    sync();
  });
  sync();
}
function migrate() {
  if (location.hash.startsWith("#/"))
    history.replaceState(null, "", location.hash.slice(1).replace(/\/?$/, "/"));
}
window.addEventListener("resize", positionSelection);
window.addEventListener("popstate", () => {
  migrate();
  render();
});
window.addEventListener("hashchange", () => {
  migrate();
  render();
});
document.fonts.ready.then(positionSelection);
setupTheme();
migrate();
start();
