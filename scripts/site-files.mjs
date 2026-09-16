import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "../csv.js";

export const basePageFiles = [
  "index.html",
  "404.html",
  "about/index.html",
  "appearance/index.html",
  "contact/index.html",
  "cooperation/index.html",
  "join/index.html",
  "members/index.html",
  "product/index.html",
  "information/index.html",
  "privacy/index.html",
  "terms/index.html",
];

export async function getPageFiles(root) {
  const newsText = await readFile(resolve(root, "data/news.csv"), "utf8");
  const news = parseCsv(newsText).rows;
  return [
    ...basePageFiles,
    ...news.map(({ id }) => `information/${id}/index.html`),
  ];
}
