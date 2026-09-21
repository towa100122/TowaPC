import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "../csv.js";
import { dataFiles, directSiteKeys } from "../site-schema.js";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 1024 / 102.4) / 10} MB`;
}

export async function loadSiteDataFromDisk(root) {
  const data = {
    logo: "/assets/TowaPC.svg",
    hero: "",
    headline: "TowaPC",
    description: "",
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
    legal: {},
    attachmentMeta: {},
  };
  const directKeys = new Set(directSiteKeys);
  for (const [name, path] of dataFiles) {
    const rows = parseCsv(
      await readFile(resolve(root, path.replace(/^\//, "")), "utf8"),
    ).rows;
    if (name === "site") {
      for (const { key, value } of rows) {
        if (directKeys.has(key)) data[key] = value;
        else if (key.startsWith("socials.")) data.socials[key.slice(8)] = value;
        else if (key.startsWith("labels.")) data.labels[key.slice(7)] = value;
        else if (key.startsWith("about.")) data.about[key.slice(6)] = value;
      }
    } else data[name] = rows;
  }
  data.legal.terms = await readFile(resolve(root, "data/terms.md"), "utf8");
  data.legal.privacy = await readFile(resolve(root, "data/privacy.md"), "utf8");
  for (const news of data.news) {
    const entries = String(news.attachments || "")
      .replace(/\\n/g, "\n")
      .split(/;;|\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    for (const entry of entries) {
      const path = entry.slice(entry.indexOf("|") + 1).trim();
      if (!/^\/files\/[a-zA-Z0-9._-]+$/.test(path)) continue;
      try {
        const filePath = resolve(root, path.slice(1));
        const extension = path.split(".").pop()?.toLowerCase();

        if (["txt", "md", "csv", "json", "js", "css", "html"].includes(extension)) {
          const content = await readFile(filePath, "utf8");
          const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

          data.attachmentMeta[path] = formatSize(
            Buffer.byteLength(normalized, "utf8"),
          );
        } else {
          data.attachmentMeta[path] = formatSize((await stat(filePath)).size);
        }
      } catch { }
    }
  }
  return data;
}
