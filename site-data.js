import { parseCsv } from "./csv.js?v=73";
import { dataFiles, directSiteKeys } from "./site-schema.js?v=73";

export const site = {
  logo: "/assets/TowaPC.svg",
  hero: "",
  headline: "TowaPC",
  description:
    "サイトの情報を読み込めませんでした。時間を置いて再読み込みしてください。",
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
};

export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

export const safeHttpUrl = (value) => {
  try {
    const source = String(value || "").trim();
    if (!source) return "";
    const url = new URL(source, location.origin);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : "";
  } catch {
    return "";
  }
};

export const safeContactUrl = (value) => {
  const url = String(value || "").trim();
  return /^mailto:[^\s@]+@[^\s@]+$/i.test(url) ? url : safeHttpUrl(url);
};

export const safeImageSource = (value) => {
  const source = String(value || "").trim();
  if (source.startsWith("/") && !source.startsWith("//")) return source;
  return safeHttpUrl(source);
};

async function fetchCsv(path) {
  const response = await fetch(`${path}?v=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return parseCsv(await response.text()).rows;
}

async function fetchText(path) {
  const response = await fetch(`${path}?v=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.text();
}

export async function loadSiteData() {
  const results = await Promise.allSettled(
    dataFiles.map(([, path]) => fetchCsv(path)),
  );
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
        if (directKeys.has(key)) site[key] = value;
        else if (key.startsWith("socials.")) site.socials[key.slice(8)] = value;
        else if (key.startsWith("labels.")) site.labels[key.slice(7)] = value;
        else if (key.startsWith("about.")) site.about[key.slice(6)] = value;
      });
    } else site[name] = result.value;
  });

  const legalFiles = [
    ["terms", "/data/terms.md"],
    ["privacy", "/data/privacy.md"],
  ];
  const legalResults = await Promise.allSettled(
    legalFiles.map(([, path]) => fetchText(path)),
  );
  legalResults.forEach((result, index) => {
    const [name, path] = legalFiles[index];
    if (result.status === "fulfilled") site.legal[name] = result.value;
    else failures.push(path);
  });

  return failures;
}
