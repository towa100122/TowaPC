import { fileURLToPath } from "node:url";

const port = 4185;
const origin = `http://127.0.0.1:${port}`;
const previewOrigin = "http://127.0.0.1:4174";
const process = Bun.spawn(["bun", "editor/server.mjs"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...Bun.env, TOWAPC_EDITOR_PORT: String(port) },
  stdout: "ignore",
  stderr: "ignore",
});

async function waitForEditor() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/state`);
      if (response.ok) return response.json();
    } catch {}
    await Bun.sleep(100);
  }
  throw new Error("Editorの起動を確認できませんでした。");
}

async function expectStatus(path, options, expected) {
  const response = await fetch(`${origin}${path}`, options);
  if (response.status !== expected) {
    throw new Error(`${path}: 期待 ${expected}、実際 ${response.status}`);
  }
}

function expectPreviewHeaders(response, path) {
  if (response.headers.get("cache-control") !== "no-store")
    throw new Error(`${path}: Cache-Control: no-storeがありません。`);
  if (response.headers.get("x-content-type-options") !== "nosniff")
    throw new Error(`${path}: X-Content-Type-Options: nosniffがありません。`);
}

try {
  const state = await waitForEditor();
  const invalidBody = JSON.stringify({ kind: "dataset", name: "invalid" });
  for (const path of ["/api/save", "/api/upload", "/api/check"]) {
    await expectStatus(
      path,
      {
        method: "POST",
        headers: {
          origin: "https://example.invalid",
          "content-type": "application/json",
          "x-towapc-csrf": state.csrfToken,
        },
        body: invalidBody,
      },
      403,
    );
  }
  await expectStatus(
    "/api/save",
    {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: invalidBody,
    },
    403,
  );
  await expectStatus(
    "/api/save",
    {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
        "x-towapc-csrf": state.csrfToken,
      },
      body: invalidBody,
    },
    400,
  );
  for (const path of ["/", "/app-v2.js"]) {
    const response = await fetch(`${previewOrigin}${path}`);
    if (!response.ok)
      throw new Error(`${path}: Previewの公開ファイルを取得できません。`);
    expectPreviewHeaders(response, path);
  }
  for (const path of [
    "/.git/config",
    "/.github/workflows/check-site.yml",
    "/editor/server.mjs",
    "/scripts/sync-pages.mjs",
    "/data/news.csv",
    "/node_modules/example.js",
    "/.env",
  ]) {
    const response = await fetch(`${previewOrigin}${path}`);
    if (response.status !== 403)
      throw new Error(`${path}: Previewから遮断されていません。`);
    expectPreviewHeaders(response, path);
  }
  const missing = await fetch(`${previewOrigin}/assets/not-found.example`);
  if (missing.status !== 404)
    throw new Error("Previewの404応答が正しくありません。");
  expectPreviewHeaders(missing, "Preview 404");
  const invalidHost = await fetch(`${previewOrigin}/`, {
    headers: { host: "example.invalid" },
  });
  if (invalidHost.status !== 403)
    throw new Error("Previewが外部Hostを拒否していません。");
  expectPreviewHeaders(invalidHost, "Preview invalid Host");
  console.log("EditorのOrigin・CSRF検査に問題はありません。\n");
} finally {
  process.kill();
  await process.exited;
}
