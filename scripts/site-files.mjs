import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCsv } from "./csv.mjs";

export const basePageFiles = [
  "index.html",
  "404.html",
  "about/index.html",
  "contact/index.html",
  "cooperation/index.html",
  "join/index.html",
  "members/index.html",
  "product/index.html",
  "information/index.html",
];

export async function getPageFiles(root) {
  const [productsText, newsText] = await Promise.all([
    readFile(resolve(root, "data/products.csv"), "utf8"),
    readFile(resolve(root, "data/news.csv"), "utf8"),
  ]);
  const products = parseCsv(productsText).rows;
  const news = parseCsv(newsText).rows;
  return [
    ...basePageFiles,
    ...products.map(({ id }) => `product/${id}/index.html`),
    ...news.map(({ id }) => `information/${id}/index.html`),
  ];
}
