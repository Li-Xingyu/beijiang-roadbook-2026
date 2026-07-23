import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the North Xinjiang roadbook", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /北疆在路上 · 乌鲁木齐到伊宁自驾助手/);
  assert.match(html, /2026 · 北疆单程自驾/);
  assert.match(html, /乌鲁木齐 → 伊宁/);
  assert.match(html, /在高德打开下一站/);
  assert.match(html, /0<!-- -->\/<!-- -->35/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Codex is working/i);
});

test("keeps optional stops out of required progress and records both Duku reservations", async () => {
  const [page, css, manifest, staticEntry, staticConfig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../static-site/main.tsx", import.meta.url), "utf8"),
    readFile(new URL("../vite.static.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /optional\?: boolean/);
  assert.match(page, /id: "yuhu"[\s\S]*optional: true/);
  assert.match(page, /filter\(\(stop\) => !stop\.optional\)/);
  assert.match(page, /备选，不计进度/);
  assert.match(page, /8月1日乌苏驿入口08:00–10:00预约/);
  assert.match(page, /8月2日乔尔玛入口12:00–14:00预约/);
  assert.match(page, /独库北段预约 ×2/);
  assert.match(css, /\.optional-badge/);
  assert.match(css, /\.timeline-row\.is-optional/);

  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.start_url, "./");
  assert.equal(parsedManifest.scope, "./");
  assert.match(staticEntry, /createRoot/);
  assert.match(staticConfig, /\/beijiang-roadbook-2026\//);
});
