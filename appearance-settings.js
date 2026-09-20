import { escapeHtml } from "./site-data.js";
import { icon } from "./ui.js";

const STORAGE_KEY = "towapc-appearance-v1";

const defaults = {
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
  headerDuration: 480,
};

const choices = {
  theme: ["light", "dark"],
  motion: ["standard", "smooth", "snappy", "none", "custom"],
  accent: ["standard", "lavender", "mint", "peach", "custom"],
  surface: [
    "standard",
    "material",
    "liquid",
    "paper",
    "shadowless",
    "monochrome",
  ],
  corners: ["soft", "round", "precise"],
  density: ["comfortable", "compact"],
  headerMotion: ["slide", "fade", "none"],
};

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

function normalizeSettings(source, base = defaults) {
  const settings = { ...base };
  if (!source || typeof source !== "object" || Array.isArray(source))
    return settings;

  Object.entries(choices).forEach(([key, allowedValues]) => {
    if (allowedValues.includes(source[key])) settings[key] = source[key];
  });
  for (const key of ["glass", "themePinned", "animationMode"]) {
    if (typeof source[key] === "boolean") settings[key] = source[key];
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
    return normalizeSettings(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
    );
  } catch {
    return { ...defaults };
  }
}

export let appearanceSettings = loadSettings();
let temporaryTheme = null;

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearanceSettings));
  } catch {}
}

function resolvedTheme() {
  if (appearanceSettings.themePinned) return appearanceSettings.theme;
  if (temporaryTheme) return temporaryTheme;
  return matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light";
}

export function applyAppearance() {
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

function pageHero() {
  return `<section class="page-hero appearance-hero">
    <div class="wrap">
      <div class="breadcrumbs"><a href="/">Home</a> / Appearance Lab</div>
      <h1>Appearance Lab</h1>
      <p>見つけた人だけの外観実験室</p>
    </div>
  </section>`;
}

function settingChoices(key, label, options) {
  const buttons = options
    .map(
      ([value, title, copy]) =>
        `<button type="button" data-setting="${key}" data-value="${value}" aria-pressed="${appearanceSettings[key] === value}">
          <strong>${title}</strong>
          ${copy ? `<small>${copy}</small>` : ""}
        </button>`,
    )
    .join("");
  return `<div class="setting-field">
    <span class="setting-label">${label}</span>
    <div class="setting-choices" role="group" aria-label="${label}">${buttons}</div>
  </div>`;
}

function settingRange(key, label, minimum, maximum, step, unit) {
  const value = appearanceSettings[key];
  const shown = key === "startScale" ? (value / 10).toFixed(1) : value;
  const hints =
    key === "duration"
      ? '<span class="range-hints"><small>速い</small><small>ゆっくり</small></span>'
      : "";
  return `<label class="setting-range">
    <span><strong>${label}</strong><output data-setting-output="${key}">${shown}${unit}</output></span>
    <input type="range" min="${minimum}" max="${maximum}" step="${step}" value="${value}" data-setting-range="${key}" aria-label="${label}">
    ${hints}
  </label>`;
}

function settingToggle(key, title, copy) {
  return `<button class="setting-toggle" type="button" role="switch" aria-checked="${appearanceSettings[key]}" data-setting-toggle="${key}">
    <span><strong>${title}</strong><small>${copy}</small></span>
    <i aria-hidden="true"></i>
  </button>`;
}

function colorPicker() {
  return `<label class="color-picker${appearanceSettings.accent === "custom" ? " active" : ""}">
    <input type="color" value="${escapeHtml(appearanceSettings.customColor)}" data-custom-color aria-label="自由な差し色">
    <span aria-hidden="true" style="--picked-color:${escapeHtml(appearanceSettings.customColor)}"></span>
    <div><strong>カラーパレット</strong><small>好きな色を選ぶ</small></div>
  </label>`;
}

function motionSettings() {
  const options = [
    ["standard", "標準", "軽く、素早く"],
    ["smooth", "ゆったり", "今回の新しい動き"],
    ["snappy", "きびきび", "短く小さく"],
    ["none", "静止", "動かさない"],
  ];
  return `<section class="settings-card floating settings-motion">
    <div class="settings-heading">
      ${icon("motion")}
      <div><h2>Motion</h2><p>カードが現れる動きを調整</p></div>
      <button class="preview-button" type="button" data-play-preview>${icon("sparkle")}再生</button>
    </div>
    ${settingChoices("motion", "プリセット", options)}
    <div class="motion-preview" data-motion-preview>
      <span></span><strong>Preview card</strong><small>設定した動きをここで確認</small>
    </div>
    <div class="range-grid">
      ${settingRange("duration", "アニメーション速度", 200, 1200, 20, "ms")}
      ${settingRange("stagger", "カード間隔", 0, 120, 2, "ms")}
      ${settingRange("travel", "移動量", 0, 90, 2, "px")}
      ${settingRange("blur", "ぼかし", 0, 18, 1, "px")}
      ${settingRange("startScale", "開始時の大きさ", 880, 1000, 5, "%")}
    </div>
  </section>`;
}

function headerSettings() {
  const options = [
    ["slide", "スライド", "上からなめらかに"],
    ["fade", "フェード", "その場で現れる"],
    ["none", "静止", "動かさない"],
  ];
  return `<section class="settings-card floating settings-header">
    <div class="settings-heading">
      ${icon("header")}
      <div><h2>Header</h2><p>透け方、ぼかし、登場を調整</p></div>
      <button class="preview-button" type="button" data-play-header>${icon("sparkle")}再生</button>
    </div>
    <div class="range-grid">
      ${settingRange("headerTransparency", "透明度", 0, 80, 2, "%")}
      ${settingRange("headerBlur", "背景のブラー", 0, 30, 1, "px")}
      ${settingRange("headerDuration", "アニメーション時間", 200, 1200, 20, "ms")}
    </div>
    ${settingChoices("headerMotion", "ヘッダーのアニメーション", options)}
    ${settingToggle("glass", "ガラス効果", "透けとブラーを有効にする")}
  </section>`;
}

function themeSettings() {
  const themes = [
    ["light", "Light", "明るい表示"],
    ["dark", "Dark", "暗い表示"],
  ];
  const surfaces = [
    ["standard", "標準", "TowaPCの基本"],
    ["material", "Material 3", "明快な面と輪郭"],
    ["liquid", "Liquid Glass", "透明感と光"],
    ["paper", "Paper", "影を抑えた紙面"],
    ["shadowless", "Shadowless", "標準から影だけをなくす"],
    ["monochrome", "Monochrome", "線と白黒、影なし"],
  ];
  const accents = [
    ["standard", "標準", "TowaPC Yellow"],
    ["lavender", "藤", "Lavender"],
    ["mint", "若葉", "Mint"],
    ["peach", "夕焼け", "Peach"],
  ];
  return `<section class="settings-card floating">
    <div class="settings-heading">
      ${icon("palette")}
      <div><h2>Theme</h2><p>色と質感を選択</p></div>
    </div>
    ${settingToggle("themePinned", "テーマを任意で固定する", "オフなら端末の設定を優先")}
    ${settingChoices("theme", "固定する明るさ", themes)}
    ${settingChoices("surface", "デザインテーマ", surfaces)}
    ${settingChoices("accent", "カラーテーマ", accents)}
    ${colorPicker()}
  </section>`;
}

function shapeSettings() {
  const corners = [
    ["soft", "標準", "やわらかい"],
    ["round", "まるい", "大きな丸み"],
    ["precise", "かっちり", "小さな丸み"],
  ];
  const densities = [
    ["comfortable", "ゆったり", "広めの間隔"],
    ["compact", "コンパクト", "情報を近く"],
  ];
  return `<section class="settings-card floating">
    <div class="settings-heading">
      ${icon("corners")}
      <div><h2>Shape & Size</h2><p>形と画面の密度を調整</p></div>
    </div>
    ${settingChoices("corners", "カードの角", corners)}
    ${settingChoices("density", "余白", densities)}
    ${settingRange("uiScale", "UIの大きさ", 90, 110, 1, "%")}
  </section>`;
}

function secretSettings() {
  return `<section class="settings-card floating secret-settings">
    <div class="settings-heading">
      ${icon("sparkle")}
      <div><h2>Secret</h2><p>ここへ移動した謎の機能</p></div>
    </div>
    ${settingToggle("animationMode", "謎のアニメーションモード", "光と浮遊がサイト全体を動き回ります")}
  </section>`;
}

function importSettings() {
  const example = escapeHtml(
    JSON.stringify(
      {
        name: "My Theme",
        version: 1,
        settings: {
          theme: "dark",
          themePinned: true,
          surface: "monochrome",
          accent: "custom",
          customColor: "#ffff99",
          corners: "soft",
          density: "comfortable",
          motion: "standard",
        },
      },
      null,
      2,
    ),
  );
  return `<section class="settings-card floating settings-import">
    <div class="settings-heading">
      ${icon("upload")}
      <div><h2>External Theme</h2><p>外部テーマをJSONから読み込む</p></div>
    </div>
    <label class="theme-import-button">
      ${icon("upload")}テーマJSONを選ぶ
      <input type="file" accept="application/json,.json" data-theme-import>
    </label>
    <small class="theme-import-note">読み込めるのは外観設定だけです。HTML、CSS、JavaScript、外部URLは実行しません。</small>
    <details class="theme-guide">
      <summary>テーマ作成ガイドライン</summary>
      <div>
        <p><code>version</code>は1、設定値は<code>settings</code>の中へ書きます。記載しない項目は現在の設定を維持します。</p>
        <ul>
          <li><code>theme</code>: light / dark</li>
          <li><code>surface</code>: standard / material / liquid / paper / shadowless / monochrome</li>
          <li><code>accent</code>: standard / lavender / mint / peach / custom</li>
          <li><code>customColor</code>: #から始まる6桁のカラーコード</li>
          <li><code>corners</code>: soft / round / precise</li>
          <li><code>density</code>: comfortable / compact</li>
          <li><code>motion</code>: standard / smooth / snappy / none</li>
        </ul>
        <pre><code>${example}</code></pre>
      </div>
    </details>
  </section>`;
}

export function renderAppearanceLab() {
  return `${pageHero()}
    <section class="section wrap appearance-lab">
      <div class="article floating appearance-intro">
        <div>
          <h2>見た目で遊ぶ。</h2>
          <p>サイトの動き、色、形、大きさを好きなように調整できます。変更はこの端末に自動で保存されます。</p>
        </div>
        <div class="appearance-orbit" aria-hidden="true">
          <span></span><span></span><span></span><span></span><i></i>
        </div>
      </div>
      <div class="settings-grid">
        ${motionSettings()}
        ${headerSettings()}
        ${themeSettings()}
        ${shapeSettings()}
        ${secretSettings()}
        ${importSettings()}
      </div>
      <div class="settings-reset floating">
        <div><strong>最初の見た目へ戻す</strong><small>このページの設定だけをリセットします。</small></div>
        <button type="button" data-reset-appearance>${icon("reset")}リセット</button>
      </div>
    </section>`;
}

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

function syncControls() {
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
  document
    .querySelector(".color-picker")
    ?.classList.toggle("active", appearanceSettings.accent === "custom");
  syncThemeControls();
}

function playPreview(selector, className) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.classList.remove(className);
  void target.offsetWidth;
  target.classList.add(className);
}

function updateSetting(key, value) {
  appearanceSettings[key] = value;
  saveSettings();
  applyAppearance();
  syncControls();
}

function rangeUnit(key) {
  if (["uiScale", "startScale", "headerTransparency"].includes(key)) return "%";
  if (["travel", "blur", "headerBlur"].includes(key)) return "px";
  return "ms";
}

function syncRangeOutputs() {
  document.querySelectorAll("[data-setting-range]").forEach((input) => {
    const key = input.dataset.settingRange;
    const value = appearanceSettings[key];
    input.value = value;
    const shown = key === "startScale" ? (value / 10).toFixed(1) : value;
    const output = document.querySelector(`[data-setting-output="${key}"]`);
    if (output) output.textContent = `${shown}${rangeUnit(key)}`;
  });
}

async function importTheme(file) {
  if (!file) return;
  try {
    if (file.size > 128 * 1024) throw new Error("ファイルが大きすぎます");
    const imported = JSON.parse(await file.text());
    if (imported.version !== 1 || !imported.settings) {
      throw new Error("version 1のsettingsが必要です");
    }
    appearanceSettings = normalizeSettings(
      imported.settings,
      appearanceSettings,
    );
    saveSettings();
    applyAppearance();
    syncControls();
    syncRangeOutputs();
    showStatus(`${String(imported.name || "THEME").slice(0, 40)} // IMPORTED`);
  } catch (error) {
    showStatus(`IMPORT ERROR // ${error.message}`);
  }
}

export function setupAppearanceControls() {
  if (!document.querySelector(".appearance-lab")) return;

  document.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const { setting, value } = button.dataset;
      appearanceSettings[setting] = value;
      if (setting === "theme") appearanceSettings.themePinned = true;
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
      if (
        ["duration", "stagger", "travel", "blur", "startScale"].includes(key)
      ) {
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
      if (key === "themePinned" && !nextValue) temporaryTheme = null;
      updateSetting(key, nextValue);
      if (key === "animationMode" && nextValue) animationSweep();
    });
  });

  document
    .querySelector("[data-play-preview]")
    ?.addEventListener("click", () =>
      playPreview("[data-motion-preview]", "preview-play"),
    );
  document
    .querySelector("[data-play-header]")
    ?.addEventListener("click", () => playPreview(".header", "header-replay"));
  document
    .querySelector("[data-custom-color]")
    ?.addEventListener("input", (event) => {
      const value = event.currentTarget.value;
      if (!/^#[0-9a-f]{6}$/i.test(value)) return;
      appearanceSettings.customColor = value;
      appearanceSettings.accent = "custom";
      saveSettings();
      applyAppearance();
      event.currentTarget
        .closest(".color-picker")
        ?.querySelector("span")
        ?.style.setProperty("--picked-color", value);
      syncControls();
    });
  document
    .querySelector("[data-theme-import]")
    ?.addEventListener("change", (event) => {
      importTheme(event.currentTarget.files?.[0]);
      event.currentTarget.value = "";
    });
  document
    .querySelector("[data-reset-appearance]")
    ?.addEventListener("click", () => {
      appearanceSettings = { ...defaults };
      saveSettings();
      applyAppearance();
      syncControls();
      syncRangeOutputs();
      showStatus("APPEARANCE // RESET");
    });
  syncControls();
}

export function setupAppearanceEgg(navigate) {
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
    navigate("/appearance/");
  });
}

export function setupTheme() {
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      temporaryTheme = button.dataset.themeOption;
      appearanceSettings.themePinned = false;
      saveSettings();
      applyAppearance();
      syncControls();
    });
  });
  matchMedia("(prefers-color-scheme:dark)").addEventListener("change", () => {
    if (appearanceSettings.themePinned) return;
    temporaryTheme = null;
    applyAppearance();
    syncThemeControls();
  });
  syncThemeControls();
}

export function disableAnimationMode() {
  if (!appearanceSettings.animationMode) return false;
  appearanceSettings.animationMode = false;
  saveSettings();
  applyAppearance();
  syncControls();
  showStatus("ANIMATION MODE // OFF");
  return true;
}
