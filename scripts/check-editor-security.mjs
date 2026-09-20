import { fileURLToPath } from "node:url";

const port = 4185;
const origin = `http://127.0.0.1:${port}`;
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
  console.log("EditorのOrigin・CSRF検査に問題はありません。\n");
} finally {
  process.kill();
  await process.exited;
}
