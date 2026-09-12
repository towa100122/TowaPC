import {
  escapeHtml as E,
  loadSiteData,
  safeContactUrl,
  safeHttpUrl,
  safeImageSource,
  site as S,
} from "./site-data.js?v=61";
import { privacyContent, termsContent } from "./legal-content.js?v=61";
const APPEARANCE_KEY = "towapc-appearance-v1";
const appearanceDefaults = {
  theme: "system",
  motion: "standard",
  accent: "standard",
  customColor: "#ffff99",
  surface: "standard",
  corners: "soft",
  density: "comfortable",
  glass: true,
  animationMode: false,
  duration: 520,
  stagger: 42,
  travel: 42,
  blur: 8,
  startScale: 965,
  uiScale: 100,
  headerTransparency: 42,
  headerBlur: 14,
  headerMotion: "slide",
  headerDuration: 480,
};
const appearanceOptions = {
  theme: ["system", "light", "dark"],
  motion: ["standard", "smooth", "snappy", "none", "custom"],
  accent: ["standard", "lavender", "mint", "peach", "custom"],
  surface: ["standard", "material", "liquid", "paper"],
  corners: ["soft", "round", "precise"],
  density: ["comfortable", "compact"],
  headerMotion: ["slide", "fade", "none"],
};
function loadAppearance() {
  try {
    const stored = JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "{}");
    const settings = { ...appearanceDefaults };
    Object.entries(appearanceOptions).forEach(([key, values]) => {
      if (values.includes(stored[key])) settings[key] = stored[key];
    });
    if (typeof stored.glass === "boolean") settings.glass = stored.glass;
    if (typeof stored.animationMode === "boolean")
      settings.animationMode = stored.animationMode;
    const ranges = {
      duration: [200, 1200],
      stagger: [0, 120],
      travel: [0, 90],
      blur: [0, 18],
      startScale: [880, 1000],
      uiScale: [90, 110],
      headerTransparency: [0, 80],
      headerBlur: [0, 30],
      headerDuration: [200, 1200],
    };
    Object.entries(ranges).forEach(([key, [minimum, maximum]]) => {
      const value = Number(stored[key]);
      if (Number.isFinite(value))
        settings[key] = Math.min(maximum, Math.max(minimum, value));
    });
    if (/^#[0-9a-f]{6}$/i.test(stored.customColor || ""))
      settings.customColor = stored.customColor;
    return settings;
  } catch {
    return { ...appearanceDefaults };
  }
}
let appearanceSettings = loadAppearance();
function saveAppearance() {
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearanceSettings));
  } catch {}
}
function resolvedTheme() {
  if (appearanceSettings.theme !== "system") return appearanceSettings.theme;
  return matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light";
}
function applyAppearance() {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme();
  root.dataset.motion = appearanceSettings.motion;
  root.dataset.accent = appearanceSettings.accent;
  root.dataset.surface = appearanceSettings.surface;
  root.dataset.corners = appearanceSettings.corners;
  root.dataset.density = appearanceSettings.density;
  root.dataset.glass = appearanceSettings.glass ? "on" : "off";
  root.dataset.headerMotion = appearanceSettings.headerMotion;
  root.style.setProperty("--custom-accent", appearanceSettings.customColor);
  root.style.setProperty(
    "--header-opacity",
    `${100 - appearanceSettings.headerTransparency}%`,
  );
  root.style.setProperty("--header-blur", `${appearanceSettings.headerBlur}px`);
  root.style.setProperty(
    "--header-duration",
    `${appearanceSettings.headerDuration}ms`,
  );
  root.style.setProperty(
    "--reveal-duration",
    `${appearanceSettings.duration}ms`,
  );
  root.style.setProperty("--reveal-travel", `${appearanceSettings.travel}px`);
  root.style.setProperty("--reveal-blur", `${appearanceSettings.blur}px`);
  root.style.setProperty(
    "--reveal-start-scale",
    String(appearanceSettings.startScale / 1000),
  );
  const uiScale = appearanceSettings.uiScale / 100;
  root.style.setProperty("--ui-scale", String(uiScale));
  root.style.setProperty("--body-font-size", `${14 * uiScale}px`);
  root.style.setProperty("--content-width", `${1100 * uiScale}px`);
  document.body?.classList.toggle(
    "animation-mode",
    appearanceSettings.animationMode,
  );
}
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
  palette: "palette",
  motion: "animation",
  corners: "rounded_corner",
  density: "density_medium",
  sparkle: "auto_awesome",
  reset: "restart_alt",
  header: "web_asset",
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
  const logo = safeImageSource(S.logo) || "/assets/TowaPC.svg";
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
  return `${pageHero("About", "TowaPCについて")}<section class="section wrap"><div class="article floating about-summary"><div class="about-heading"><button class="about-logo-trigger" type="button" aria-label="TowaPCロゴ" data-animation-trigger><img class="about-logo" src="${E(logo)}" alt="TowaPC"></button><h2>TowaPCについて</h2></div><p>${E(S.description)}</p><p>かゆいところに手が届く、派手でもないけれど確実に便利。日常の細やかな部分を良くしていきたい。TowaPCはそう考えます。</p><div class="about-links"><a class="soft-button" href="/members/"><span>TowaPCのメンバー</span>${icon("right")}</a><a class="soft-button" href="/cooperation/"><span>協力関係がある団体・個人</span>${icon("right")}</a><a class="soft-button" href="/join/"><span>私たちの一員になる</span>${icon("right")}</a></div></div><div class="values">${values.map(([h, p, c]) => `<div class="value floating ${c}"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div></section>`;
}
function settingChoices(key, label, choices) {
  return `<div class="setting-field"><span class="setting-label">${label}</span><div class="setting-choices" role="group" aria-label="${label}">${choices.map(([value, title, copy]) => `<button type="button" data-setting="${key}" data-value="${value}" aria-pressed="${appearanceSettings[key] === value}"><strong>${title}</strong>${copy ? `<small>${copy}</small>` : ""}</button>`).join("")}</div></div>`;
}
function settingRange(key, label, minimum, maximum, step, unit) {
  const value = appearanceSettings[key];
  const shown = key === "startScale" ? (value / 10).toFixed(1) : value;
  return `<label class="setting-range"><span><strong>${label}</strong><output data-setting-output="${key}">${shown}${unit}</output></span><input type="range" min="${minimum}" max="${maximum}" step="${step}" value="${value}" data-setting-range="${key}" aria-label="${label}">${key === "duration" ? '<span class="range-hints"><small>速い</small><small>ゆっくり</small></span>' : ""}</label>`;
}
function settingToggle(key, title, copy) {
  return `<button class="setting-toggle" type="button" role="switch" aria-checked="${appearanceSettings[key]}" data-setting-toggle="${key}"><span><strong>${title}</strong><small>${copy}</small></span><i aria-hidden="true"></i></button>`;
}
function colorPicker() {
  return `<label class="color-picker${appearanceSettings.accent === "custom" ? " active" : ""}"><input type="color" value="${E(appearanceSettings.customColor)}" data-custom-color aria-label="自由な差し色"><span aria-hidden="true" style="--picked-color:${E(appearanceSettings.customColor)}"></span><div><strong>カラーパレット</strong><small>好きな色を選ぶ</small></div></label>`;
}
function appearanceLab() {
  return `${pageHero("Appearance Lab", "見つけた人だけの外観実験室", "appearance-hero")}<section class="section wrap appearance-lab"><div class="article floating appearance-intro"><div><h2>見た目で遊ぶ。</h2><p>サイトの動き、色、形、大きさを好きなように調整できます。変更はこの端末に自動で保存されます。</p></div><div class="appearance-orbit" aria-hidden="true"><span></span><span></span><span></span><span></span><i></i></div></div><div class="settings-grid"><section class="settings-card floating settings-motion"><div class="settings-heading">${icon("motion")}<div><h2>Motion</h2><p>カードが現れる動きを調整</p></div><button class="preview-button" type="button" data-play-preview>${icon("sparkle")}再生</button></div>${settingChoices(
    "motion",
    "プリセット",
    [
      ["standard", "標準", "軽く、素早く"],
      ["smooth", "ゆったり", "今回の新しい動き"],
      ["snappy", "きびきび", "短く小さく"],
      ["none", "静止", "動かさない"],
    ],
  )}<div class="motion-preview" data-motion-preview><span></span><strong>Preview card</strong><small>設定した動きをここで確認</small></div><div class="range-grid">${settingRange("duration", "アニメーション速度", 200, 1200, 20, "ms")}${settingRange("stagger", "カード間隔", 0, 120, 2, "ms")}${settingRange("travel", "移動量", 0, 90, 2, "px")}${settingRange("blur", "ぼかし", 0, 18, 1, "px")}${settingRange("startScale", "開始時の大きさ", 880, 1000, 5, "%")}</div></section><section class="settings-card floating settings-header"><div class="settings-heading">${icon("header")}<div><h2>Header</h2><p>透け方、ぼかし、登場を調整</p></div><button class="preview-button" type="button" data-play-header>${icon("sparkle")}再生</button></div><div class="range-grid">${settingRange("headerTransparency", "透明度", 0, 80, 2, "%")}${settingRange("headerBlur", "背景のブラー", 0, 30, 1, "px")}${settingRange("headerDuration", "アニメーション時間", 200, 1200, 20, "ms")}</div>${settingChoices(
    "headerMotion",
    "ヘッダーのアニメーション",
    [
      ["slide", "スライド", "上からなめらかに"],
      ["fade", "フェード", "その場で現れる"],
      ["none", "静止", "動かさない"],
    ],
  )}${settingToggle("glass", "ガラス効果", "透けとブラーを有効にする")}</section><section class="settings-card floating"><div class="settings-heading">${icon("palette")}<div><h2>Theme</h2><p>色と質感を選択</p></div></div>${settingChoices(
    "theme",
    "明るさ",
    [
      ["system", "自動", "端末に合わせる"],
      ["light", "Light", "明るい表示"],
      ["dark", "Dark", "暗い表示"],
    ],
  )}${settingChoices("surface", "デザインテーマ", [
    ["standard", "標準", "TowaPCの基本"],
    ["material", "Material 3", "明快な面と輪郭"],
    ["liquid", "Liquid Glass", "透明感と光"],
    ["paper", "Paper", "影を抑えた紙面"],
  ])}${settingChoices("accent", "カラーテーマ", [
    ["standard", "標準", "TowaPC Yellow"],
    ["lavender", "藤", "Lavender"],
    ["mint", "若葉", "Mint"],
    ["peach", "夕焼け", "Peach"],
  ])}${colorPicker()}</section><section class="settings-card floating"><div class="settings-heading">${icon("corners")}<div><h2>Shape & Size</h2><p>形と画面の密度を調整</p></div></div>${settingChoices(
    "corners",
    "カードの角",
    [
      ["soft", "標準", "やわらかい"],
      ["round", "まるい", "大きな丸み"],
      ["precise", "かっちり", "小さな丸み"],
    ],
  )}${settingChoices("density", "余白", [
    ["comfortable", "ゆったり", "広めの間隔"],
    ["compact", "コンパクト", "情報を近く"],
  ])}${settingRange("uiScale", "UIの大きさ", 90, 110, 1, "%")}</section><section class="settings-card floating secret-settings"><div class="settings-heading">${icon("sparkle")}<div><h2>Secret</h2><p>ここへ移動した謎の機能</p></div></div>${settingToggle("animationMode", "謎のアニメーションモード", "光と浮遊がサイト全体を動き回ります")}</section></div><div class="settings-reset floating"><div><strong>最初の見た目へ戻す</strong><small>このページの設定だけをリセットします。</small></div><button type="button" data-reset-appearance>${icon("reset")}リセット</button></div></section>`;
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
function legalPage(kind) {
  const privacy = kind === "privacy";
  const title = privacy ? "Privacy Policy" : "Terms of Service";
  const subtitle = privacy ? "プライバシーポリシー" : "利用規約";
  const content = privacy ? privacyContent : termsContent;
  return `${pageHero(title, subtitle)}<section class="section wrap"><article class="article legal-document floating"><header><span>TowaPC.com</span><h2>${subtitle}</h2></header>${content}</article></section>`;
}
function missing() {
  return `<section class="section wrap not-found"><div class="not-found-card floating"><button class="not-found-number" type="button" aria-label="404" data-shred-trigger>404</button><p class="not-found-label">Not found</p><p class="not-found-copy">お探しのページは迷子かもしれません。</p></div></section>`;
}

const COOKIE_CONSENT_KEY = "towapc-cookie-consent";
function cookieConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
}
function saveCookieConsent(value) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {}
}
function showCookieConsent() {
  document.querySelector(".cookie-consent")?.remove();
  const banner = document.createElement("aside");
  banner.className = "cookie-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookieの利用について");
  banner.innerHTML = `<div><strong>Cookieの利用について</strong><p>サイト改善のため、同意後にGoogle Analyticsを使用します。拒否しても主要機能は利用できます。<a href="/privacy/">詳しく見る</a></p></div><div class="cookie-actions"><button type="button" data-cookie-reject>拒否する</button><button type="button" data-cookie-accept>同意する</button></div>`;
  document.body.append(banner);
  banner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
    saveCookieConsent("accepted");
    window.enableTowaAnalytics?.();
    banner.remove();
  });
  banner.querySelector("[data-cookie-reject]").addEventListener("click", () => {
    saveCookieConsent("rejected");
    window.disableTowaAnalytics?.();
    banner.remove();
  });
}
function setupCookieConsent() {
  const consent = cookieConsent();
  if (consent === "accepted") window.enableTowaAnalytics?.();
  else if (consent !== "rejected") showCookieConsent();
  document
    .querySelector("[data-cookie-settings]")
    ?.addEventListener("click", showCookieConsent);
}

function showEggStatus(message) {
  document.querySelector(".egg-status")?.remove();
  const status = document.createElement("div");
  status.className = "egg-status";
  status.setAttribute("role", "status");
  status.textContent = message;
  document.body.append(status);
  setTimeout(() => status.remove(), 2600);
}

function animationSweep() {
  const sweep = document.createElement("div");
  sweep.className = "animation-sweep";
  sweep.setAttribute("aria-hidden", "true");
  document.body.append(sweep);
  setTimeout(() => sweep.remove(), 1400);
}

function setupAppearanceEgg() {
  const trigger = document.querySelector("[data-animation-trigger]");
  if (!trigger) return;
  let clicks = 0;
  let resetTimer;
  trigger.addEventListener("click", () => {
    clicks += 1;
    trigger.classList.remove("logo-tap");
    void trigger.offsetWidth;
    trigger.classList.add("logo-tap");
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (clicks = 0), 1800);
    if (clicks < 5) return;
    clicks = 0;
    clearTimeout(resetTimer);
    history.pushState(null, "", "/appearance/");
    render();
  });
}

const motionPresets = {
  standard: {
    duration: 520,
    stagger: 42,
    travel: 42,
    blur: 8,
    startScale: 965,
  },
  smooth: { duration: 680, stagger: 48, travel: 42, blur: 8, startScale: 965 },
  snappy: { duration: 360, stagger: 28, travel: 24, blur: 4, startScale: 980 },
  none: { duration: 200, stagger: 0, travel: 0, blur: 0, startScale: 1000 },
};
function syncThemeControls() {
  const theme = resolvedTheme();
  const switcher = document.querySelector(".theme-switch");
  if (switcher) switcher.dataset.active = theme;
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const active = button.dataset.themeOption === theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
function syncAppearanceControls() {
  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(
        appearanceSettings[button.dataset.setting] === button.dataset.value,
      ),
    );
  });
  document.querySelectorAll("[data-setting-toggle]").forEach((button) => {
    button.setAttribute(
      "aria-checked",
      String(Boolean(appearanceSettings[button.dataset.settingToggle])),
    );
  });
  const picker = document.querySelector(".color-picker");
  picker?.classList.toggle("active", appearanceSettings.accent === "custom");
  syncThemeControls();
}
function playMotionPreview() {
  const preview = document.querySelector("[data-motion-preview]");
  if (!preview) return;
  preview.classList.remove("preview-play");
  void preview.offsetWidth;
  preview.classList.add("preview-play");
}
function playHeaderPreview() {
  const header = document.querySelector(".header");
  if (!header) return;
  header.classList.remove("header-replay");
  void header.offsetWidth;
  header.classList.add("header-replay");
  header.addEventListener(
    "animationend",
    () => header.classList.remove("header-replay"),
    { once: true },
  );
}
function updateAppearance(setting, value) {
  appearanceSettings[setting] = value;
  saveAppearance();
  applyAppearance();
  syncAppearanceControls();
}
function setupAppearanceControls() {
  if (!document.querySelector(".appearance-lab")) return;
  document.querySelectorAll("[data-setting]").forEach((button) =>
    button.addEventListener("click", () => {
      const { setting, value } = button.dataset;
      appearanceSettings[setting] = value;
      if (setting === "motion")
        Object.assign(appearanceSettings, motionPresets[value]);
      saveAppearance();
      applyAppearance();
      syncAppearanceControls();
      if (setting === "motion") {
        document.querySelectorAll("[data-setting-range]").forEach((input) => {
          const key = input.dataset.settingRange;
          input.value = appearanceSettings[key];
          const output = document.querySelector(
            `[data-setting-output="${key}"]`,
          );
          if (!output) return;
          const value = appearanceSettings[key];
          const unit =
            key === "uiScale" || key === "startScale"
              ? "%"
              : key === "travel" || key === "blur"
                ? "px"
                : "ms";
          output.textContent = `${key === "startScale" ? (value / 10).toFixed(1) : value}${unit}`;
        });
        playMotionPreview();
      }
      if (setting === "headerMotion") playHeaderPreview();
    }),
  );
  document.querySelectorAll("[data-setting-range]").forEach((input) =>
    input.addEventListener("input", () => {
      const key = input.dataset.settingRange;
      const value = Number(input.value);
      appearanceSettings[key] = value;
      if (["duration", "stagger", "travel", "blur", "startScale"].includes(key))
        appearanceSettings.motion = "custom";
      const output = document.querySelector(`[data-setting-output="${key}"]`);
      if (output) {
        const unit =
          key === "uiScale" ||
          key === "startScale" ||
          key === "headerTransparency"
            ? "%"
            : key === "travel" || key === "blur" || key === "headerBlur"
              ? "px"
              : "ms";
        output.textContent = `${key === "startScale" ? (value / 10).toFixed(1) : value}${unit}`;
      }
      saveAppearance();
      applyAppearance();
      syncAppearanceControls();
    }),
  );
  document.querySelectorAll("[data-setting-toggle]").forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.settingToggle;
      updateAppearance(key, !appearanceSettings[key]);
      if (key === "animationMode" && appearanceSettings[key]) animationSweep();
    }),
  );
  document
    .querySelector("[data-play-preview]")
    ?.addEventListener("click", playMotionPreview);
  document
    .querySelector("[data-play-header]")
    ?.addEventListener("click", playHeaderPreview);
  document
    .querySelector("[data-custom-color]")
    ?.addEventListener("input", (event) => {
      const value = event.currentTarget.value;
      if (!/^#[0-9a-f]{6}$/i.test(value)) return;
      appearanceSettings.customColor = value;
      appearanceSettings.accent = "custom";
      saveAppearance();
      applyAppearance();
      const picker = event.currentTarget.closest(".color-picker");
      picker?.classList.add("active");
      picker?.querySelector("span")?.style.setProperty("--picked-color", value);
      syncAppearanceControls();
    });
  document
    .querySelector("[data-reset-appearance]")
    ?.addEventListener("click", () => {
      appearanceSettings = { ...appearanceDefaults };
      saveAppearance();
      applyAppearance();
      render();
      showEggStatus("APPEARANCE // RESET");
    });
  syncAppearanceControls();
}

function shredPage() {
  if (document.querySelector(".page-shredder")) return;
  const shredder = document.createElement("div");
  shredder.className = "page-shredder";
  shredder.setAttribute("role", "status");
  shredder.setAttribute("aria-live", "polite");
  const strips = Array.from({ length: 24 }, (_, index) => {
    const offset = -46 + index * 4;
    const turn = -7 + ((index * 11) % 15);
    const length = 25 + ((index * 7) % 6);
    return `<span style="--strip:${index};--strip-x:${offset}px;--strip-turn:${turn}deg;--strip-length:${length}vh"></span>`;
  }).join("");
  shredder.innerHTML = `<div class="shred-machine" aria-hidden="true"><div class="shred-machine-top"><span>404 PAGE SHREDDER</span><i></i><i></i></div><div class="shred-slot"></div><div class="shred-strips">${strips}</div></div><div class="shred-complete"><strong>404は細断されました。</strong><small>ページの残り容量：0 byte</small><button type="button" data-shred-restore>ページを再構成する</button></div>`;
  document.body.append(shredder);
  document.body.classList.add("shredding-page");
  shredder
    .querySelector("[data-shred-restore]")
    .addEventListener("click", () => {
      document.body.classList.remove("shredding-page");
      shredder.remove();
    });
}

function setupShredEgg() {
  const trigger = document.querySelector("[data-shred-trigger]");
  if (!trigger) return;
  let clicks = 0;
  let resetTimer;
  trigger.addEventListener("click", () => {
    clicks += 1;
    trigger.classList.remove("shred-tap");
    void trigger.offsetWidth;
    trigger.classList.add("shred-tap");
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (clicks = 0), 1800);
    if (clicks < 4) return;
    clicks = 0;
    clearTimeout(resetTimer);
    shredPage();
  });
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
      appearance: appearanceLab,
      join,
      cooperation: () => directory("cooperation"),
      members: () => directory("members"),
      contact,
      terms: () => legalPage("terms"),
      privacy: () => legalPage("privacy"),
    };
  const main = document.getElementById("main");
  const pageContent =
    parts.length > 1 ? detail(route, parts[1]) : (pages[route] || missing)();
  main.innerHTML =
    pageContent +
    (route
      ? `<div class="page-home-link wrap"><a class="text-link" href="/">${icon("left")} ホームに戻る</a></div>`
      : "");
  const specialTitles = {
    appearance: "Appearance Lab",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
  };
  document.title = `TowaPC — ${specialTitles[route] || routes.find(([p]) => p === `/${route}`)?.[1] || (route ? "Not found" : "Home")}`;
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
  setupAppearanceEgg();
  setupAppearanceControls();
  setupShredEgg();
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
  const items = [...document.querySelectorAll(".floating,.section-heading")];
  if (
    matchMedia("(prefers-reduced-motion:reduce)").matches ||
    appearanceSettings.motion === "none"
  ) {
    items.forEach((element) => {
      element.classList.add("reveal", "is-visible");
      element.classList.remove("play-reveal");
    });
    return;
  }
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
  items.forEach((e, i) => {
    e.classList.remove("is-visible", "play-reveal");
    e.classList.add("reveal");
    e.dataset.revealDelay = String((i % 4) * appearanceSettings.stagger);
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
  document.querySelectorAll("[data-theme-option]").forEach((button) =>
    button.addEventListener("click", () => {
      updateAppearance("theme", button.dataset.themeOption);
    }),
  );
  const systemTheme = matchMedia("(prefers-color-scheme:dark)");
  systemTheme.addEventListener("change", () => {
    if (appearanceSettings.theme !== "system") return;
    applyAppearance();
    syncThemeControls();
  });
  syncThemeControls();
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
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    document.body.classList.contains("animation-mode") &&
    !document.querySelector("dialog[open]")
  ) {
    appearanceSettings.animationMode = false;
    saveAppearance();
    applyAppearance();
    syncAppearanceControls();
    showEggStatus("ANIMATION MODE // OFF");
  }
});
document.fonts.ready.then(positionSelection);
applyAppearance();
setupTheme();
setupCookieConsent();
migrate();
start();
