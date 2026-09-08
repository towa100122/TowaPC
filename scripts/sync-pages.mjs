import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { getPageFiles } from "./site-files.mjs";

const root = resolve(import.meta.dirname, "..");
const template = await readFile(resolve(root, "templates/page.html"), "utf8");
const pageFiles = await getPageFiles(root);

for (const page of pageFiles) {
  const target = resolve(root, page);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, template, "utf8");
}

console.log(
  `${pageFiles.length}個のページを共通テンプレートから更新しました。`,
);
