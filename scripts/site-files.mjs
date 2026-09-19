import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "../csv.js";

const basePages = [
  ["index.html", "", "", "Home"],
  ["404.html", "404", "", "Not found"],
  ["about/index.html", "about", "", "About"],
  ["appearance/index.html", "appearance", "", "Appearance Lab"],
  ["contact/index.html", "contact", "", "Contact"],
  ["cooperation/index.html", "cooperation", "", "Cooperation"],
  ["join/index.html", "join", "", "Join"],
  ["members/index.html", "members", "", "Members"],
  ["products/index.html", "products", "", "Products"],
  ["news/index.html", "news", "", "News"],
  ["privacy/index.html", "privacy", "", "Privacy Policy"],
  ["terms/index.html", "terms", "", "Terms of Service"],
];

export async function getPageDescriptors(root) {
  const news = parseCsv(
    await readFile(resolve(root, "data/news.csv"), "utf8"),
  ).rows;
  return [
    ...basePages.map(([file, route, id, title]) => ({
      file,
      route,
      id,
      title,
    })),
    ...news.map((item) => ({
      file: `news/${item.id}/index.html`,
      route: "news",
      id: item.id,
      title: item.title,
      description: item.body.replace(/\\n/g, " ").replace(/\s+/g, " "),
    })),
  ];
}

export async function getRedirectDescriptors(root) {
  const news = parseCsv(
    await readFile(resolve(root, "data/news.csv"), "utf8"),
  ).rows;
  return [
    { file: "product/index.html", target: "/products/" },
    { file: "information/index.html", target: "/news/" },
    ...news.map((item) => ({
      file: `information/${item.id}/index.html`,
      target: `/news/${item.id}/`,
    })),
  ];
}

export async function getPageFiles(root) {
  const [pages, redirects] = await Promise.all([
    getPageDescriptors(root),
    getRedirectDescriptors(root),
  ]);
  return [...pages, ...redirects].map(({ file }) => file);
}
