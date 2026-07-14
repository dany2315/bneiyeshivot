import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = 4123;
const rootDir = fileURLToPath(new URL("../", import.meta.url));
let server;

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 20_000) {
    try {
      const response = await fetch(`http://localhost:${port}/`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error("Next server did not start in time");
}

test.before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      cwd: rootDir,
      stdio: "ignore",
      detached: false,
    },
  );
  await waitForServer();
});

test.after(async () => {
  if (!server?.pid) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
      }).on("exit", resolve);
    });
  } else {
    server.kill("SIGTERM");
  }
});

async function render(path = "/") {
  return fetch(`http://localhost:${port}${path}`, {
    headers: { accept: "text/html" },
  });
}

test("renders the Bnei Yeshivot public homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Bnei Yeshivot<\/title>/i);
  assert.match(html, /Je viens etudier en Israel/);
  assert.match(html, /Visa etudiant/);
  assert.match(html, /Koupat Holim/);
  assert.match(html, /ETA-IL/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders protected auth surfaces", async () => {
  const [admin, client, register] = await Promise.all([
    render("/admin"),
    render("/client"),
    render("/inscription"),
  ]);

  assert.equal(admin.status, 200);
  assert.equal(client.status, 200);
  assert.equal(register.status, 200);

  assert.match(await admin.text(), /Connexion admin/);
  assert.match(await client.text(), /Connexion/);
  assert.match(await register.text(), /Creer mon acces Bahour/);
});
