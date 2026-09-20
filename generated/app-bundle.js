// csv.js
function parseCsv(text) {
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;
  for (let index = 0;index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === `
`) {
      record.push(field.replace(/\r$/, ""));
      records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted)
    throw new Error("閉じていないダブルクォートがあります。");
  if (field || record.length) {
    record.push(field.replace(/\r$/, ""));
    records.push(record);
  }
  if (!records.length)
    return { headers: [], rows: [] };
  const headers = records.shift().map((header, index) => (index ? header : header.replace(/^\uFEFF/, "")).trim());
  const rows = records.filter((values) => values.some((value) => value.trim())).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`${index + 2}行目の列数が${values.length}個です。${headers.length}個必要です。`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column].trim()]));
  });
  return { headers, rows };
}

// site-schema.js
var dataFiles = [
  ["site", "/data/site.csv"],
  ["products", "/data/products.csv"],
  ["news", "/data/news.csv"],
  ["partners", "/data/partners.csv"],
  ["members", "/data/members.csv"],
  ["history", "/data/history.csv"],
  ["contacts", "/data/contacts.csv"]
];
var productTypeLabels = {
  app: "アプリケーション",
  web: "Webサービス",
  project: "開発プロジェクト"
};
var productTypes = Object.keys(productTypeLabels);
var newsTagLabels = {
  new: "NEW",
  important: "Important",
  release: "Release",
  update: "Update"
};
var directSiteKeys = [
  "logo",
  "hero",
  "headline",
  "description",
  "joinUrl",
  "contactUrl"
];
var requiredSiteKeys = [
  ...directSiteKeys,
  "socials.youtube",
  "socials.x",
  "socials.discord",
  "labels.youtube",
  "labels.x",
  "labels.discord",
  "labels.contact",
  "about.originTitle",
  "about.originBody",
  "about.statement"
];
var nonEmptySiteKeys = requiredSiteKeys.filter((key) => key !== "joinUrl");

// site-data.js
var site = {
  logo: "/assets/TowaPC.svg",
  hero: "",
  headline: "TowaPC",
  description: "サイトの情報を読み込めませんでした。時間を置いて再読み込みしてください。",
  joinUrl: "",
  contactUrl: "/contact/",
  socials: {},
  labels: {},
  about: {},
  products: [],
  news: [],
  partners: [],
  members: [],
  history: [],
  contacts: [],
  legal: { terms: "", privacy: "" },
  attachmentMeta: {}
};
var escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);
var safeHttpUrl = (value) => {
  try {
    const source = String(value || "").trim();
    if (!source)
      return "";
    const url = new URL(source, location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};
var safeContactUrl = (value) => {
  const url = String(value || "").trim();
  return /^mailto:[^\s@]+@[^\s@]+$/i.test(url) ? url : safeHttpUrl(url);
};
var safeImageSource = (value) => {
  const source = String(value || "").trim();
  if (source.startsWith("/") && !source.startsWith("//"))
    return source;
  return safeHttpUrl(source);
};
async function fetchCsv(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw new Error(`${path}: ${response.status}`);
  return parseCsv(await response.text()).rows;
}
async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw new Error(`${path}: ${response.status}`);
  return response.text();
}
async function loadSiteData() {
  const embedded = document.getElementById("site-data")?.textContent;
  if (embedded) {
    Object.assign(site, JSON.parse(embedded));
    return [];
  }
  const results = await Promise.allSettled(dataFiles.map(([, path]) => fetchCsv(path)));
  const failures = [];
  results.forEach((result, index) => {
    const [name, path] = dataFiles[index];
    if (result.status === "rejected") {
      console.warn(`CSVを読み込めませんでした: ${path}`, result.reason);
      failures.push(path);
      return;
    }
    if (name === "site") {
      const directKeys = new Set(directSiteKeys);
      result.value.forEach(({ key, value }) => {
        if (directKeys.has(key))
          site[key] = value;
        else if (key.startsWith("socials."))
          site.socials[key.slice(8)] = value;
        else if (key.startsWith("labels."))
          site.labels[key.slice(7)] = value;
        else if (key.startsWith("about."))
          site.about[key.slice(6)] = value;
      });
    } else
      site[name] = result.value;
  });
  const legalFiles = [
    ["terms", "/data/terms.md"],
    ["privacy", "/data/privacy.md"]
  ];
  const legalResults = await Promise.allSettled(legalFiles.map(([, path]) => fetchText(path)));
  legalResults.forEach((result, index) => {
    const [name, path] = legalFiles[index];
    if (result.status === "fulfilled")
      site.legal[name] = result.value;
    else
      failures.push(path);
  });
  return failures;
}

// ui.js
var iconPaths = {
  bell: "M12 22a2.3 2.3 0 0 0 2.2-2h-4.4A2.3 2.3 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1Z",
  grid: "M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z",
  list: "M4 5h3v3H4Zm5 0h11v3H9ZM4 10.5h3v3H4Zm5 0h11v3H9ZM4 16h3v3H4Zm5 0h11v3H9Z",
  right: "m9 5 7 7-7 7-1.4-1.4 4.6-4.6H3v-2h9.2L7.6 6.4Z",
  left: "m15 5-7 7 7 7 1.4-1.4-4.6-4.6H21v-2h-9.2l4.6-4.6Z",
  about: "M11 10h2v7h-2Zm0-3h2v2h-2Zm1-5a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  mail: "M3 5h18v14H3Zm2 2v.5l7 4.5 7-4.5V7Zm14 10V9.8l-7 4.4-7-4.4V17Z",
  join: "M15 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM6 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9 3c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4ZM6 13c-2.4 0-5 1.2-5 3.5V19h6v-1c0-1.4.7-2.6 1.8-3.5A7 7 0 0 0 6 13Z",
  people: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 13c-3.3 0-7 1.7-7 4.5V21h14v-3.5C15 14.7 11.3 13 8 13Zm8 .5c-.5 0-1 .1-1.5.2 1.5 1.1 2.5 2.6 2.5 4.3v3h6v-3c0-2.8-3.7-4.5-7-4.5Z",
  link: "M10.6 13.4a1 1 0 0 0 1.4 1.4l3.6-3.6a3 3 0 0 0-4.2-4.2L9.3 9.1 7.9 7.7 10 5.6a5 5 0 0 1 7.1 7.1l-3.7 3.7a3 3 0 0 1-4.2 0 1 1 0 0 1 0-1.4Zm2.8-2.8a1 1 0 0 0-1.4-1.4L8.4 12.8a3 3 0 1 0 4.2 4.2l2.1-2.1 1.4 1.4-2.1 2.1a5 5 0 1 1-7.1-7.1l3.7-3.7a3 3 0 0 1 4.2 0 1 1 0 0 1 0 1.4Z",
  palette: "M12 3a9 9 0 0 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2a7 7 0 0 0 0-14Zm-5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  motion: "M4 6h11v2H4Zm0 5h16v2H4Zm0 5h11v2H4Z",
  corners: "M4 4h7v2H6v5H4Zm9 0h7v7h-2V6h-5ZM4 13h2v5h5v2H4Zm14 0h2v7h-7v-2h5Z",
  density: "M4 5h16v2H4Zm0 6h16v2H4Zm0 6h16v2H4Z",
  sparkle: "m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7Zm6 12 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9Z",
  reset: "M12 4a8 8 0 1 1-7.4 5H7L3.5 5.5 0 9h2.5A10 10 0 1 0 12 2Z",
  header: "M3 4h18v16H3Zm2 2v3h14V6Zm0 5v7h14v-7Z",
  upload: "M11 16h2V8.8l2.6 2.6L17 10l-5-5-5 5 1.4 1.4L11 8.8ZM4 18h16v2H4Z",
  close: "m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4Z",
  external: "M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14ZM5 5h6v2H7v10h10v-4h2v6H5Z",
  popup: "M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14ZM5 5h6v2H7v10h10v-4h2v6H5Z",
  file: "M6 2h8l5 5v15H6Zm8 2.5V8h3.5ZM8 12h8v2H8Zm0 4h8v2H8Z",
  download: "M11 3h2v10.2l3.6-3.6L18 11l-6 6-6-6 1.4-1.4 3.6 3.6ZM4 19h16v2H4Z"
};
function icon(name) {
  const path = iconPaths[name] || iconPaths.grid;
  return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${path}"></path></svg></span>`;
}
function brandIcon(name) {
  const safeName = escapeHtml(name);
  return `<img class="brand-icon brand-${safeName}" src="/assets/social-${safeName}.svg" alt="" aria-hidden="true">`;
}
function image(source, alt, className = "") {
  const safeSource = safeImageSource(source);
  if (!safeSource)
    return "";
  const square = /directory|member|company/.test(className);
  const article = /article-image/.test(className);
  const width = square ? 512 : article ? 1200 : 640;
  const height = square ? 512 : article ? 675 : 400;
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(safeSource)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy">`;
}
function textWithBreaks(value) {
  return escapeHtml(String(value ?? "").replace(/\\n/g, `
`)).replace(/\r?\n/g, "<br>");
}

// appearance-settings.js
var STORAGE_KEY = "towapc-appearance-v1";
var defaults = {
  theme: "light",
  themePinned: false,
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
  headerDuration: 480
};
var choices = {
  theme: ["light", "dark"],
  motion: ["standard", "smooth", "snappy", "none", "custom"],
  accent: ["standard", "lavender", "mint", "peach", "custom"],
  surface: [
    "standard",
    "material",
    "liquid",
    "paper",
    "shadowless",
    "monochrome"
  ],
  corners: ["soft", "round", "precise"],
  density: ["comfortable", "compact"],
  headerMotion: ["slide", "fade", "none"]
};
var ranges = {
  duration: [200, 1200],
  stagger: [0, 120],
  travel: [0, 90],
  blur: [0, 18],
  startScale: [880, 1000],
  uiScale: [90, 110],
  headerTransparency: [0, 80],
  headerBlur: [0, 30],
  headerDuration: [200, 1200]
};
var motionPresets = {
  standard: {
    duration: 520,
    stagger: 42,
    travel: 42,
    blur: 8,
    startScale: 965
  },
  smooth: { duration: 680, stagger: 48, travel: 42, blur: 8, startScale: 965 },
  snappy: { duration: 360, stagger: 28, travel: 24, blur: 4, startScale: 980 },
  none: { duration: 200, stagger: 0, travel: 0, blur: 0, startScale: 1000 }
};
function normalizeSettings(source, base = defaults) {
  const settings = { ...base };
  if (!source || typeof source !== "object" || Array.isArray(source))
    return settings;
  Object.entries(choices).forEach(([key, allowedValues]) => {
    if (allowedValues.includes(source[key]))
      settings[key] = source[key];
  });
  for (const key of ["glass", "themePinned", "animationMode"]) {
    if (typeof source[key] === "boolean")
      settings[key] = source[key];
  }
  Object.entries(ranges).forEach(([key, [minimum, maximum]]) => {
    const value = Number(source[key]);
    if (Number.isFinite(value)) {
      settings[key] = Math.min(maximum, Math.max(minimum, value));
    }
  });
  if (/^#[0-9a-f]{6}$/i.test(source.customColor || "")) {
    settings.customColor = source.customColor;
  }
  return settings;
}
function loadSettings() {
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return { ...defaults };
  }
}
var appearanceSettings = loadSettings();
function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearanceSettings));
  } catch {}
}
function resolvedTheme() {
  if (appearanceSettings.themePinned)
    return appearanceSettings.theme;
  return matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light";
}
function applyAppearance() {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme();
  root.dataset.themePinned = appearanceSettings.themePinned ? "on" : "off";
  root.dataset.motion = appearanceSettings.motion;
  root.dataset.accent = appearanceSettings.accent;
  root.dataset.surface = appearanceSettings.surface;
  root.dataset.corners = appearanceSettings.corners;
  root.dataset.density = appearanceSettings.density;
  root.dataset.glass = appearanceSettings.glass ? "on" : "off";
  root.dataset.headerMotion = appearanceSettings.headerMotion;
  root.style.setProperty("--custom-accent", appearanceSettings.customColor);
  root.style.setProperty("--header-opacity", `${100 - appearanceSettings.headerTransparency}%`);
  root.style.setProperty("--header-blur", `${appearanceSettings.headerBlur}px`);
  root.style.setProperty("--header-duration", `${appearanceSettings.headerDuration}ms`);
  root.style.setProperty("--reveal-duration", `${appearanceSettings.duration}ms`);
  root.style.setProperty("--reveal-travel", `${appearanceSettings.travel}px`);
  root.style.setProperty("--reveal-blur", `${appearanceSettings.blur}px`);
  root.style.setProperty("--reveal-start-scale", String(appearanceSettings.startScale / 1000));
  const uiScale = appearanceSettings.uiScale / 100;
  root.style.setProperty("--ui-scale", String(uiScale));
  root.style.setProperty("--body-font-size", `${14 * uiScale}px`);
  root.style.setProperty("--content-width", `${1100 * uiScale}px`);
  document.body?.classList.toggle("animation-mode", appearanceSettings.animationMode);
}
function showStatus(message) {
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
function syncThemeControls() {
  const theme = resolvedTheme();
  const switcher = document.querySelector(".theme-switch");
  if (switcher)
    switcher.dataset.active = theme;
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const active = button.dataset.themeOption === theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
function syncControls() {
  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.setAttribute("aria-pressed", String(appearanceSettings[button.dataset.setting] === button.dataset.value));
  });
  document.querySelectorAll("[data-setting-toggle]").forEach((button) => {
    button.setAttribute("aria-checked", String(Boolean(appearanceSettings[button.dataset.settingToggle])));
  });
  document.querySelector(".color-picker")?.classList.toggle("active", appearanceSettings.accent === "custom");
  syncThemeControls();
}
function playPreview(selector, className) {
  const target = document.querySelector(selector);
  if (!target)
    return;
  target.classList.remove(className);
  target.offsetWidth;
  target.classList.add(className);
}
function updateSetting(key, value) {
  appearanceSettings[key] = value;
  saveSettings();
  applyAppearance();
  syncControls();
}
function rangeUnit(key) {
  if (["uiScale", "startScale", "headerTransparency"].includes(key))
    return "%";
  if (["travel", "blur", "headerBlur"].includes(key))
    return "px";
  return "ms";
}
function syncRangeOutputs() {
  document.querySelectorAll("[data-setting-range]").forEach((input) => {
    const key = input.dataset.settingRange;
    const value = appearanceSettings[key];
    input.value = value;
    const shown = key === "startScale" ? (value / 10).toFixed(1) : value;
    const output = document.querySelector(`[data-setting-output="${key}"]`);
    if (output)
      output.textContent = `${shown}${rangeUnit(key)}`;
  });
}
async function importTheme(file) {
  if (!file)
    return;
  try {
    if (file.size > 128 * 1024)
      throw new Error("ファイルが大きすぎます");
    const imported = JSON.parse(await file.text());
    if (imported.version !== 1 || !imported.settings) {
      throw new Error("version 1のsettingsが必要です");
    }
    appearanceSettings = normalizeSettings(imported.settings, appearanceSettings);
    saveSettings();
    applyAppearance();
    syncControls();
    syncRangeOutputs();
    showStatus(`${String(imported.name || "THEME").slice(0, 40)} // IMPORTED`);
  } catch (error) {
    showStatus(`IMPORT ERROR // ${error.message}`);
  }
}
function setupAppearanceControls() {
  if (!document.querySelector(".appearance-lab"))
    return;
  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const { setting, value } = button.dataset;
      appearanceSettings[setting] = value;
      if (setting === "theme")
        appearanceSettings.themePinned = true;
      if (setting === "motion")
        Object.assign(appearanceSettings, motionPresets[value]);
      saveSettings();
      applyAppearance();
      syncControls();
      if (setting === "motion") {
        syncRangeOutputs();
        playPreview("[data-motion-preview]", "preview-play");
      }
      if (setting === "headerMotion") {
        playPreview(".header", "header-replay");
      }
    });
  });
  document.querySelectorAll("[data-setting-range]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.settingRange;
      const value = Number(input.value);
      appearanceSettings[key] = value;
      if (["duration", "stagger", "travel", "blur", "startScale"].includes(key)) {
        appearanceSettings.motion = "custom";
      }
      saveSettings();
      applyAppearance();
      syncRangeOutputs();
      syncControls();
    });
  });
  document.querySelectorAll("[data-setting-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.settingToggle;
      const nextValue = !appearanceSettings[key];
      if (key === "themePinned" && nextValue)
        appearanceSettings.theme = resolvedTheme();
      updateSetting(key, nextValue);
      if (key === "animationMode" && nextValue)
        animationSweep();
    });
  });
  document.querySelector("[data-play-preview]")?.addEventListener("click", () => playPreview("[data-motion-preview]", "preview-play"));
  document.querySelector("[data-play-header]")?.addEventListener("click", () => playPreview(".header", "header-replay"));
  document.querySelector("[data-custom-color]")?.addEventListener("input", (event) => {
    const value = event.currentTarget.value;
    if (!/^#[0-9a-f]{6}$/i.test(value))
      return;
    appearanceSettings.customColor = value;
    appearanceSettings.accent = "custom";
    saveSettings();
    applyAppearance();
    event.currentTarget.closest(".color-picker")?.querySelector("span")?.style.setProperty("--picked-color", value);
    syncControls();
  });
  document.querySelector("[data-theme-import]")?.addEventListener("change", (event) => {
    importTheme(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  });
  document.querySelector("[data-reset-appearance]")?.addEventListener("click", () => {
    appearanceSettings = { ...defaults };
    saveSettings();
    applyAppearance();
    syncControls();
    syncRangeOutputs();
    showStatus("APPEARANCE // RESET");
  });
  syncControls();
}
function setupAppearanceEgg(navigate) {
  const trigger = document.querySelector("[data-animation-trigger]");
  if (!trigger)
    return;
  let clicks = 0;
  let resetTimer;
  trigger.addEventListener("click", () => {
    clicks += 1;
    trigger.classList.remove("logo-tap");
    trigger.offsetWidth;
    trigger.classList.add("logo-tap");
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => clicks = 0, 1800);
    if (clicks < 5)
      return;
    clicks = 0;
    clearTimeout(resetTimer);
    navigate("/appearance/");
  });
}
function setupTheme() {
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      appearanceSettings.theme = button.dataset.themeOption;
      appearanceSettings.themePinned = true;
      saveSettings();
      applyAppearance();
      syncControls();
    });
  });
  matchMedia("(prefers-color-scheme:dark)").addEventListener("change", () => {
    if (appearanceSettings.themePinned)
      return;
    applyAppearance();
    syncThemeControls();
  });
  syncThemeControls();
}
function disableAnimationMode() {
  if (!appearanceSettings.animationMode)
    return false;
  appearanceSettings.animationMode = false;
  saveSettings();
  applyAppearance();
  syncControls();
  showStatus("ANIMATION MODE // OFF");
  return true;
}

// cookie-consent.js
var COOKIE_CONSENT_KEY = "towapc-cookie-consent";
var cookieConsentObserver;
function readCookieConsent() {
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
function hideCookieConsent(banner) {
  cookieConsentObserver?.disconnect();
  cookieConsentObserver = null;
  banner?.remove();
  document.body.classList.remove("cookie-consent-visible");
  document.body.style.removeProperty("--cookie-consent-height");
}
function showCookieConsent() {
  hideCookieConsent(document.querySelector(".cookie-consent"));
  const banner = document.createElement("aside");
  banner.className = "cookie-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookieの利用について");
  banner.innerHTML = `<div>
    <strong>Cookieの利用について</strong>
    <p>サイト改善のため、同意後にGoogle Analyticsを使用します。拒否しても主要機能は利用できます。<a href="/privacy/">詳しく見る</a></p>
  </div>
  <div class="cookie-actions">
    <button type="button" data-cookie-reject>拒否する</button>
    <button type="button" data-cookie-accept>同意する</button>
  </div>`;
  document.body.append(banner);
  document.body.classList.add("cookie-consent-visible");
  const syncCookieSpace = () => document.body.style.setProperty("--cookie-consent-height", `${banner.offsetHeight}px`);
  syncCookieSpace();
  cookieConsentObserver = new ResizeObserver(syncCookieSpace);
  cookieConsentObserver.observe(banner);
  banner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
    saveCookieConsent("accepted");
    window.enableTowaAnalytics?.();
    hideCookieConsent(banner);
  });
  banner.querySelector("[data-cookie-reject]").addEventListener("click", () => {
    saveCookieConsent("rejected");
    window.disableTowaAnalytics?.();
    hideCookieConsent(banner);
  });
}
function setupCookieConsent() {
  const consent = readCookieConsent();
  if (consent === "accepted")
    window.enableTowaAnalytics?.();
  else if (consent !== "rejected")
    showCookieConsent();
  document.querySelector("[data-cookie-settings]")?.addEventListener("click", showCookieConsent);
}

// easter-eggs.js
function setupShredEgg() {
  const trigger = document.querySelector("[data-shred-trigger]");
  if (!trigger)
    return;
  let clicks = 0;
  let resetTimer;
  trigger.addEventListener("click", () => {
    clicks += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => clicks = 0, 1800);
    if (clicks < 4)
      return;
    clicks = 0;
    clearTimeout(resetTimer);
    shredPage();
  });
}
function shredPage() {
  if (document.querySelector(".page-shredder"))
    return;
  const shredder = document.createElement("div");
  shredder.className = "page-shredder";
  shredder.setAttribute("role", "status");
  shredder.setAttribute("aria-live", "polite");
  const strips = Array.from({ length: 24 }, (_, index) => {
    const offset = -46 + index * 4;
    const turn = -7 + index * 11 % 15;
    const length = 25 + index * 7 % 6;
    return `<span style="--strip:${index};--strip-x:${offset}px;--strip-turn:${turn}deg;--strip-length:${length}vh"></span>`;
  }).join("");
  shredder.innerHTML = `<div class="shred-machine" aria-hidden="true">
    <div class="shred-machine-top"><span>404 PAGE SHREDDER</span><i></i><i></i></div>
    <div class="shred-slot"></div>
    <div class="shred-strips">${strips}</div>
  </div>
  <div class="shred-complete">
    <strong>404は細断されました。</strong>
    <small>ページの残り容量：0 byte</small>
    <button type="button" data-shred-restore>ページを再構成する</button>
  </div>`;
  document.body.append(shredder);
  document.body.classList.add("shredding-page");
  shredder.querySelector("[data-shred-restore]").addEventListener("click", () => {
    document.body.classList.remove("shredding-page");
    shredder.remove();
  });
}

// member-dialog.js
var previousFocus;
function closeDialog() {
  document.querySelector(".member-dialog-backdrop")?.remove();
  document.body.classList.remove("dialog-open");
  previousFocus?.focus();
  previousFocus = null;
}
function openDialog(item, trigger, kind) {
  closeDialog();
  previousFocus = trigger;
  const imageSource = safeImageSource(item.image);
  const url = safeHttpUrl(item.url);
  const label = kind === "partner" ? "Webサイト" : "プロフィール";
  const backdrop = document.createElement("div");
  backdrop.className = "member-dialog-backdrop";
  backdrop.innerHTML = `<section class="member-dialog ${kind}-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
    <button class="member-dialog-close" type="button" aria-label="閉じる" data-member-dialog-close>${icon("close")}</button>
    ${imageSource ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(item.name)}" class="member-dialog-image">` : ""}
    <div class="member-dialog-copy">
      <h2 id="member-dialog-title">${escapeHtml(item.name)}</h2>
      <span class="category">${escapeHtml(item.role || "")}</span>
      <p>${textWithBreaks(item.description || "")}</p>
      ${url ? `<a class="cta dialog-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${label} ${icon("right")}</a>` : ""}
    </div>
  </section>`;
  document.body.append(backdrop);
  document.body.classList.add("dialog-open");
  backdrop.querySelector("[data-member-dialog-close]").focus();
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest("[data-member-dialog-close]")) {
      closeDialog();
    }
  });
}
function classifyPartnerCard(card) {
  const image2 = card.querySelector(".company-logo");
  if (!image2)
    return;
  const classify = () => {
    const ratio = image2.naturalWidth / image2.naturalHeight;
    card.classList.toggle("is-square", ratio >= 0.88 && ratio <= 1.12);
    card.classList.toggle("is-wide", ratio < 0.88 || ratio > 1.12);
  };
  if (image2.complete)
    classify();
  else
    image2.addEventListener("load", classify, { once: true });
}
function setupMemberDialogs() {
  document.querySelectorAll("[data-member-index]").forEach((card) => {
    card.addEventListener("click", () => {
      const member = site.members[Number(card.dataset.memberIndex)];
      if (member)
        openDialog(member, card, "member");
    });
  });
  document.querySelectorAll("[data-partner-index]").forEach((card) => {
    classifyPartnerCard(card);
    card.addEventListener("click", () => {
      const partner = site.partners[Number(card.dataset.partnerIndex)];
      if (partner)
        openDialog(partner, card, "partner");
    });
  });
}
function handleMemberDialogEscape(event) {
  if (event.key !== "Escape" || !document.querySelector(".member-dialog-backdrop")) {
    return false;
  }
  closeDialog();
  return true;
}

// page-views.js
var routes = [
  ["/", "Home"],
  ["/products", "Products"],
  ["/news", "News"],
  ["/about", "About"],
  ["/cooperation", "Cooperation"],
  ["/members", "Members"],
  ["/contact", "Contact"],
  ["/join", "Join"]
];
function plainText(value) {
  return escapeHtml(String(value ?? "").replace(/\\n/g, " ").replace(/\s+/g, " "));
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
  return destination ? `<a class="project-move" href="${escapeHtml(destination.url)}" target="_blank" rel="noopener">${escapeHtml(destination.label)} ${icon("external")}</a>` : `<span class="project-move is-disabled">リンク準備中</span>`;
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
  return `<div class="product-list">${items.map(productListRow).join("")}</div>`;
}
function productView() {
  return "grid";
}
function productResults(items, view) {
  if (!items.length)
    return '<div class="empty-state">該当する製品はありません。</div>';
  return view === "list" ? productRows(items) : productCards(items);
}
function newsView() {
  return "grid";
}
function newsResults(items, view) {
  if (!items.length)
    return '<div class="empty-state">該当するお知らせはありません。</div>';
  return view === "list" ? newsRows(items) : newsCards(items);
}
function newsBadge(item) {
  const tag = String(item.tag || "").toLowerCase();
  return `<span class="badge ${escapeHtml(tag)}">${escapeHtml(newsTagLabels[tag] || item.tag)}</span>`;
}
function parseRelatedLinks(value) {
  return String(value || "").replace(/\\n/g, `
`).split(/;;|\r?\n/).map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const separator = entry.indexOf("|");
    if (separator < 1)
      return null;
    const label = entry.slice(0, separator).trim();
    const url = safeHttpUrl(entry.slice(separator + 1).trim());
    return label && url ? { label, url } : null;
  }).filter(Boolean);
}
function newsArt(item, imageClass) {
  return item.image ? image(item.image, "", imageClass) : `<span>${icon("bell")}</span>`;
}
function newsRows(items) {
  return `<div class="news-list-view">${items.map((item) => `<a class="news-list-row floating" href="/news/${escapeHtml(item.id)}/">
          <div class="news-list-art">${newsArt(item, "news-list-image")}</div>
          <div class="news-list-copy">
            <h2>${escapeHtml(item.title)}</h2>
            <div class="news-meta"><time>${escapeHtml(item.date)}</time>${newsBadge(item)}</div>
            <p>${plainText(item.body)}</p>
            <span class="news-list-more">詳しく見る ${icon("right")}</span>
          </div>
        </a>`).join("")}</div>`;
}
function newsCards(items) {
  const cards = items.map((item) => `<a class="news-card floating" href="/news/${escapeHtml(item.id)}/">
        <div class="news-card-art">${newsArt(item, "news-card-image")}</div>
        <div class="news-card-copy">
          <h2>${escapeHtml(item.title)}</h2>
          <div class="news-meta"><time>${escapeHtml(item.date)}</time>${newsBadge(item)}</div>
          <p>${plainText(item.body)}</p>
          <span class="news-card-more">詳しく見る ${icon("right")}</span>
        </div>
      </a>`).join("");
  return `<div class="news-grid">${cards}</div>`;
}
function renderFooterLinks() {
  return routes.filter(([path]) => path !== "/contact").map(([path, title]) => `<a href="${path === "/" ? "/" : `${path}/`}">${title}</a>`).join("");
}
function renderFooterContacts() {
  const core = [
    ["youtube", "YouTube", safeHttpUrl(site.socials.youtube)],
    ["x", "X", safeHttpUrl(site.socials.x)],
    ["discord", "Discord", safeHttpUrl(site.socials.discord)],
    [
      "mail",
      "Email",
      safeContactUrl(site.contactUrl) ? "/contact/#mail" : "/contact/"
    ]
  ].filter(([, , url]) => url).map(([type, label, url]) => {
    const contactIcon = type === "mail" ? icon("mail") : brandIcon(type);
    return `<a class="footer-contact-icon footer-contact-${type}" href="${escapeHtml(url)}"${externalAttributes(url)} aria-label="${label}">${contactIcon}</a>`;
  }).join("");
  const additional = site.contacts.map((contact) => {
    const url = safeContactUrl(contact.url);
    return url ? `<a href="${escapeHtml(url)}"${externalAttributes(url)}>${escapeHtml(contact.label)}</a>` : "";
  }).join("");
  return `<div class="footer-contact-icons">${core}</div>${additional}`;
}

// project-dialog.js
var previousFocus2;
function destination(value) {
  const first = String(value || "").replace(/\\n/g, `
`).split(/;;|\r?\n/)[0];
  const separator = first.indexOf("|");
  if (separator < 1)
    return null;
  const label = first.slice(0, separator).trim();
  const url = safeHttpUrl(first.slice(separator + 1).trim());
  return label && url ? { label, url } : null;
}
function closeDialog2() {
  document.querySelector(".project-dialog-backdrop")?.remove();
  document.body.classList.remove("dialog-open");
  previousFocus2?.focus();
  previousFocus2 = null;
}
function openDialog2(project, trigger) {
  closeDialog2();
  previousFocus2 = trigger;
  const imageSource = safeImageSource(project.image);
  const action = destination(project.links);
  const backdrop = document.createElement("div");
  backdrop.className = "project-dialog-backdrop";
  backdrop.innerHTML = `<section class="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
    <button class="project-dialog-close" type="button" aria-label="閉じる" data-project-dialog-close>${icon("close")}</button>
    ${imageSource ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(project.name)}" class="project-dialog-image">` : ""}
    <div class="project-dialog-copy">
      <h2 id="project-dialog-title">${escapeHtml(project.name)}</h2>
      <span class="category">${escapeHtml(project.category || "")}</span>
      <p>${textWithBreaks(project.description || "")}</p>
      ${action ? `<a class="project-dialog-move" href="${escapeHtml(action.url)}" target="_blank" rel="noopener">${escapeHtml(action.label)} ${icon("external")}</a>` : '<span class="project-dialog-move is-disabled">リンク準備中</span>'}
    </div>
  </section>`;
  document.body.append(backdrop);
  document.body.classList.add("dialog-open");
  backdrop.querySelector("[data-project-dialog-close]").focus();
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest("[data-project-dialog-close]"))
      closeDialog2();
  });
}
function setupProjectDialogs() {
  document.querySelectorAll("[data-project-id]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const project = site.products.find((item) => item.id === trigger.dataset.projectId);
      if (project)
        openDialog2(project, trigger);
    });
  });
  document.querySelectorAll("[data-project-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a,button,.project-move"))
        return;
      const project = site.products.find((item) => item.id === card.dataset.projectCard);
      if (project)
        openDialog2(project, card);
    });
  });
}
function handleProjectDialogEscape(event) {
  if (event.key !== "Escape" || !document.querySelector(".project-dialog-backdrop"))
    return false;
  closeDialog2();
  return true;
}

// app-v2.js
var headerRoutes = [
  ["", "Home"],
  ["products", "Products"],
  ["news", "News"],
  ["about", "About"],
  ["contact", "Contact"]
];
function headerNavigation() {
  const links = headerRoutes.map(([path, label]) => `<a href="/${path ? `${path}/` : ""}" data-route="${path}">${label}</a>`).join("");
  return `<span class="nav-selection"></span>${links}`;
}
function currentLocation() {
  const parts = location.pathname.split("/").filter(Boolean);
  return { route: parts[0] || "", id: parts[1] || "" };
}
function renderNavigation(route) {
  const nav = document.querySelector(".header nav");
  if (!nav.querySelector("[data-route]"))
    nav.innerHTML = headerNavigation();
  nav.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });
  document.querySelector("[data-footer-links]").innerHTML = renderFooterLinks();
  document.querySelector("[data-footer-contact]").innerHTML = renderFooterContacts();
}
function resetMenu() {
  const nav = document.querySelector(".header nav");
  const button = document.querySelector(".menu-button");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("--menu-scroll-y");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "メニューを開く");
  button.classList.remove("is-open");
}
function filterProducts(button) {
  document.querySelectorAll("[data-filter]").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  const view = document.querySelector("[data-product-view].active")?.dataset.productView || productView();
  const items = site.products.filter((product) => button.dataset.filter === "all" || product.type === button.dataset.filter);
  document.getElementById("product-results").innerHTML = productResults(items, view);
  setupProjectDialogs();
  reveal();
}
function switchProductView(button) {
  document.querySelectorAll("[data-product-view]").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  const filter = document.querySelector("[data-filter].active")?.dataset.filter || "all";
  const items = site.products.filter((product) => filter === "all" || product.type === filter);
  document.getElementById("product-results").innerHTML = productResults(items, button.dataset.productView);
  setupProjectDialogs();
  reveal();
}
function filteredNews() {
  const filter = document.querySelector("[data-news-filter].active")?.dataset.newsFilter || "all";
  return site.news.filter((item) => filter === "all" || item.tag === filter);
}
function renderNewsResults(view = newsView()) {
  document.getElementById("news-results").innerHTML = newsResults(filteredNews(), view);
  reveal();
}
function filterNews(button) {
  document.querySelectorAll("[data-news-filter]").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  const view = document.querySelector("[data-news-view].active")?.dataset.newsView || newsView();
  renderNewsResults(view);
}
function switchNewsView(button) {
  document.querySelectorAll("[data-news-view]").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  renderNewsResults(button.dataset.newsView);
}
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}
function setupContactActions() {
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      const copied = await copyText(button.dataset.copyEmail || "");
      const original = button.textContent;
      button.textContent = copied ? "コピーしました" : "コピーできませんでした";
      window.setTimeout(() => button.textContent = original, 1800);
    });
  });
}
function setupPageControls() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => filterProducts(button));
  });
  document.querySelectorAll("[data-product-view]").forEach((button) => {
    button.addEventListener("click", () => switchProductView(button));
  });
  document.querySelectorAll("[data-news-filter]").forEach((button) => {
    button.addEventListener("click", () => filterNews(button));
  });
  document.querySelectorAll("[data-news-view]").forEach((button) => {
    button.addEventListener("click", () => switchNewsView(button));
  });
  setupMemberDialogs();
  setupProjectDialogs();
  setupContactActions();
  setupAppearanceEgg((path) => location.assign(path));
  setupAppearanceControls();
  setupShredEgg();
}
function showDataWarning(failures) {
  if (!failures.length)
    return;
  const warning = document.createElement("aside");
  warning.className = "data-warning";
  warning.setAttribute("role", "status");
  warning.textContent = "一部の情報を読み込めませんでした。時間を置いて再読み込みしてください。";
  document.getElementById("main").prepend(warning);
}
async function start() {
  try {
    localStorage.removeItem("towapc-product-view");
    localStorage.removeItem("towapc-news-view");
  } catch {}
  const failures = await loadSiteData();
  const { route } = currentLocation();
  renderNavigation(route);
  resetMenu();
  setupPageControls();
  reveal();
  requestAnimationFrame(positionSelection);
  showDataWarning(failures);
}
var menuScrollY = 0;
function setMenuLock(open) {
  if (open) {
    menuScrollY = window.scrollY;
    document.body.style.setProperty("--menu-scroll-y", `${menuScrollY}px`);
    document.body.classList.add("menu-open");
    return;
  }
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("--menu-scroll-y");
  window.scrollTo({ top: menuScrollY, behavior: "instant" });
}
function setMenuState(open) {
  const nav = document.querySelector(".header nav");
  const button = document.querySelector(".menu-button");
  nav.classList.toggle("open", open);
  setMenuLock(open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  button.classList.toggle("is-open", open);
}
var observer;
function reveal() {
  const items = [...document.querySelectorAll(".floating,.section-heading")];
  if (matchMedia("(prefers-reduced-motion:reduce)").matches || appearanceSettings.motion === "none") {
    observer?.disconnect();
    observer = null;
    items.forEach((element) => {
      element.classList.add("reveal", "is-visible");
      element.dataset.revealReady = "true";
      element.classList.remove("play-reveal");
    });
    return;
  }
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting)
          return;
        const target = entry.target;
        target.style.setProperty("--reveal-delay", `${target.dataset.revealDelay || 0}ms`);
        target.classList.add("is-visible", "play-reveal");
        target.addEventListener("animationend", () => target.classList.remove("play-reveal"), { once: true });
        observer?.unobserve(target);
      });
    }, { threshold: 0.08 });
  }
  items.forEach((element, index) => {
    if (element.dataset.revealReady === "true")
      return;
    element.dataset.revealReady = "true";
    element.classList.add("reveal");
    element.dataset.revealDelay = String(index % 4 * appearanceSettings.stagger);
    if (element.getBoundingClientRect().top <= window.innerHeight * 1.05) {
      element.classList.add("is-visible");
      return;
    }
    element.classList.remove("is-visible", "play-reveal");
    observer.observe(element);
  });
}
function positionSelection() {
  const nav = document.querySelector(".header nav");
  if (!nav)
    return;
  const selected = nav.querySelector(":scope>a.active,:scope>details.active-group>summary");
  const pill = nav.querySelector(".nav-selection");
  if (!pill)
    return;
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
function migrateLegacyHash() {
  if (location.hash.startsWith("#/")) {
    location.replace(location.hash.slice(1).replace(/\/?$/, "/"));
  }
}
document.querySelector(".menu-button").addEventListener("click", () => {
  const nav = document.querySelector(".header nav");
  setMenuState(!nav.classList.contains("open"));
});
document.addEventListener("click", (event) => {
  const nav = document.querySelector(".header nav");
  if (nav.classList.contains("open") && !event.target.closest(".header nav") && !event.target.closest(".menu-button")) {
    setMenuState(false);
  }
});
document.querySelector(".back-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
window.addEventListener("resize", positionSelection);
document.addEventListener("keydown", (event) => {
  if (handleMemberDialogEscape(event))
    return;
  if (handleProjectDialogEscape(event))
    return;
  if (event.key === "Escape")
    disableAnimationMode();
});
document.fonts.ready.then(positionSelection);
applyAppearance();
setupTheme();
setupCookieConsent();
migrateLegacyHash();
start();
