import {
  mkdir,
  readFile,
  readdir,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
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

const expectedPages = new Set(
  pageFiles.map((page) => page.replaceAll("\\", "/")),
);
for (const section of ["product", "information"]) {
  const sectionPath = resolve(root, section);
  const entries = await readdir(sectionPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const relativePage = `${section}/${entry.name}/index.html`;
    if (expectedPages.has(relativePage)) continue;
    await rm(resolve(root, relativePage), { force: true });
    await rmdir(resolve(sectionPath, entry.name)).catch(() => {});
  }
}

console.log(
  `${pageFiles.length}個のページを共通テンプレートから更新しました。`,
);
