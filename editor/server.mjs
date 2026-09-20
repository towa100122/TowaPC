import { randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import {
  basename,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { parseCsv, stringifyCsv } from "../csv.js";
import {
  csvSchemas,
  newsTagLabels,
  productColors,
  productTypeLabels,
} from "../site-schema.js";

const root = resolve(import.meta.dirname, "..");
const editorRoot = resolve(root, "editor");
const editorPort = Number(process.env.TOWAPC_EDITOR_PORT || 4175);
const csrfToken = randomBytes(32).toString("base64url");
const allowedOrigins = new Set([
  `http://127.0.0.1:${editorPort}`,
  `http://localhost:${editorPort}`,
]);
const datasets = {
  news: "news.csv",
  products: "products.csv",
  site: "site.csv",
  history: "history.csv",
  members: "members.csv",
  partners: "partners.csv",
  contacts: "contacts.csv",
};
const documents = { terms: "terms.md", privacy: "privacy.md" };
const uploadRules = {
  image: {
    directory: "assets/uploads",
    extensions: new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]),
  },
  attachment: {
    directory: "files",
    extensions: new Set([
      ".pdf",
      ".txt",
      ".md",
      ".docx",
      ".xlsx",
      ".pptx",
      ".zip",
    ]),
  },
};

function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function isInside(directory, target) {
  const path = relative(directory, target);
  return (
    path === "" ||
    (!isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`))
  );
}

function sameToken(value) {
  const supplied = Buffer.from(String(value || ""));
  const expected = Buffer.from(csrfToken);
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

function allowWrite(request) {
  return (
    allowedOrigins.has(request.headers.get("origin") || "") &&
    sameToken(request.headers.get("x-towapc-csrf"))
  );
}

function safeName(value) {
  const extension = extname(value).toLowerCase();
  const stem = basename(value, extension)
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${stem || `file-${Date.now()}`}${extension}`;
}

async function atomicWrite(path, content) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content, "utf8");
  await rename(temporary, path);
}

async function readState() {
  const result = {
    datasets: {},
    documents: {},
    schemas: csvSchemas,
    csrfToken,
  };
  for (const [name, file] of Object.entries(datasets)) {
    result.datasets[name] = parseCsv(
      await readFile(resolve(root, "data", file), "utf8"),
    ).rows;
  }
  for (const [name, file] of Object.entries(documents)) {
    result.documents[name] = await readFile(
      resolve(root, "data", file),
      "utf8",
    );
  }
  result.options = {
    tag: newsTagLabels,
    type: productTypeLabels,
    color: Object.fromEntries(productColors.map((value) => [value, value])),
    colored: { y: "有効", n: "無効" },
    textColor: { black: "黒", white: "白" },
  };
  return result;
}

async function save(request) {
  const body = await request.json();
  if (body.kind === "document") {
    const file = documents[body.name];
    if (!file || typeof body.content !== "string")
      return json({ error: "保存対象が不正です。" }, 400);
    await atomicWrite(
      resolve(root, "data", file),
      body.content.replace(/\r\n/g, "\n"),
    );
    return json({ ok: true, file: `data/${file}` });
  }
  const file = datasets[body.name];
  const headers = file ? csvSchemas[file] : null;
  if (!headers || !Array.isArray(body.rows))
    return json({ error: "保存対象が不正です。" }, 400);
  const rows = body.rows.map((row) =>
    Object.fromEntries(
      headers.map((header) => [header, String(row[header] ?? "")]),
    ),
  );
  await atomicWrite(resolve(root, "data", file), stringifyCsv(headers, rows));
  return json({ ok: true, file: `data/${file}` });
}

async function upload(request) {
  const form = await request.formData();
  const kind = String(form.get("kind") || "");
  const file = form.get("file");
  const rule = uploadRules[kind];
  if (!rule || !file || typeof file.arrayBuffer !== "function")
    return json({ error: "ファイル指定が不正です。" }, 400);
  if (file.size > 20 * 1024 * 1024)
    return json({ error: "20MB以下のファイルを選んでください。" }, 400);
  const name = safeName(file.name);
  if (!rule.extensions.has(extname(name).toLowerCase()))
    return json({ error: "この拡張子は使用できません。" }, 400);
  const directory = resolve(root, rule.directory);
  await mkdir(directory, { recursive: true });
  const target = resolve(directory, name);
  if (!isInside(directory, target) || relative(directory, target) === "")
    return json({ error: "保存先が不正です。" }, 400);
  const temporary = `${target}.${process.pid}.tmp`;
  await Bun.write(temporary, file);
  await rename(temporary, target);
  return json({
    ok: true,
    path: `/${rule.directory.replaceAll("\\", "/")}/${name}`,
    name: file.name,
  });
}

async function runChecks() {
  const commands = ["format", "sync-pages", "check"];
  const outputs = [];
  for (const command of commands) {
    const process = Bun.spawn(["bun", "run", command], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
      process.exited,
    ]);
    outputs.push(`$ bun run ${command}\n${stdout}${stderr}`);
    if (exitCode !== 0)
      return json({ ok: false, output: outputs.join("\n") }, 400);
  }
  return json({ ok: true, output: outputs.join("\n") });
}

const staticFiles = {
  "/": "index.html",
  "/editor.js": "editor.js",
  "/editor.css": "editor.css",
};

const previewTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

try {
  Bun.serve({
    hostname: "127.0.0.1",
    port: 4174,
    async fetch(request) {
      const url = new URL(request.url);
      let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      if (!relative || relative.endsWith("/")) relative += "index.html";
      const path = resolve(root, relative);
      if (!isInside(root, path) || path === root)
        return new Response("Forbidden", { status: 403 });
      const file = Bun.file(path);
      if (await file.exists()) {
        return new Response(file, {
          headers: {
            "content-type":
              previewTypes[extname(path).toLowerCase()] ||
              "application/octet-stream",
          },
        });
      }
      return new Response(Bun.file(resolve(root, "404.html")), {
        status: 404,
        headers: { "content-type": previewTypes[".html"] },
      });
    },
  });
  console.log("TowaPC Preview: http://127.0.0.1:4174/");
} catch {
  console.warn(
    "Preview port 4174 is already in use. The editor will continue.",
  );
}

Bun.serve({
  hostname: "127.0.0.1",
  port: editorPort,
  async fetch(request) {
    const url = new URL(request.url);
    if (
      !/^127\.0\.0\.1(?::\d+)?$|^localhost(?::\d+)?$/i.test(
        request.headers.get("host") || "",
      )
    )
      return new Response("Forbidden", { status: 403 });
    try {
      if (request.method === "GET" && staticFiles[url.pathname])
        return new Response(
          await readFile(resolve(editorRoot, staticFiles[url.pathname])),
          {
            headers: {
              "content-type": url.pathname.endsWith(".js")
                ? "text/javascript; charset=utf-8"
                : url.pathname.endsWith(".css")
                  ? "text/css; charset=utf-8"
                  : "text/html; charset=utf-8",
            },
          },
        );
      if (request.method === "GET" && url.pathname === "/api/state")
        return json(await readState());
      if (request.method === "POST" && !allowWrite(request))
        return json({ error: "OriginまたはCSRF tokenが不正です。" }, 403);
      if (request.method === "POST" && url.pathname === "/api/save")
        return await save(request);
      if (request.method === "POST" && url.pathname === "/api/upload")
        return await upload(request);
      if (request.method === "POST" && url.pathname === "/api/check")
        return await runChecks();
      return new Response("Not found", { status: 404 });
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  },
});

console.log(`TowaPC Editor: http://127.0.0.1:${editorPort}/`);
