export const site = {
  logo: "/assets/TowaPC.svg",
  hero: "",
  headline: "TowaPC",
  description:
    "サイトの情報を読み込めませんでした。時間を置いて再読み込みしてください。",
  joinUrl: "",
  contactUrl: "/contact/",
  socials: {},
  products: [],
  news: [],
  partners: [],
  members: [],
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

function parseCsv(text) {
  const rows = [];
  const row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push([...row]);
      row.length = 0;
      field = "";
    } else field += character;
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  if (!rows.length) return [];

  const headers = rows
    .shift()
    .map((header, index) =>
      (index ? header : header.replace(/^\uFEFF/, "")).trim(),
    );
  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, (values[index] ?? "").trim()]),
      ),
    );
}

async function fetchCsv(path) {
  const response = await fetch(`${path}?v=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return parseCsv(await response.text());
}

export async function loadSiteData() {
  const files = [
    ["site", "/data/site.csv"],
    ["products", "/data/products.csv"],
    ["news", "/data/news.csv"],
    ["partners", "/data/partners.csv"],
    ["members", "/data/members.csv"],
  ];
  const results = await Promise.allSettled(
    files.map(([, path]) => fetchCsv(path)),
  );
  const failures = [];

  results.forEach((result, index) => {
    const [name, path] = files[index];
    if (result.status === "rejected") {
      console.warn(`CSVを読み込めませんでした: ${path}`, result.reason);
      failures.push(path);
      return;
    }
    if (name === "site") {
      const directKeys = new Set([
        "logo",
        "hero",
        "headline",
        "description",
        "joinUrl",
        "contactUrl",
      ]);
      result.value.forEach(({ key, value }) => {
        if (directKeys.has(key)) site[key] = value;
        else if (key.startsWith("socials.")) site.socials[key.slice(8)] = value;
      });
    } else site[name] = result.value;
  });

  return failures;
}
