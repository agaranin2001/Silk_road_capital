#!/usr/bin/env node
// Full-page screenshots of every page (sitemap + 404) → screenshots/<page-name>.jpg
// Requires a local Google Chrome and the dev server (`npm run dev`).
//
//   node scripts/screenshots.mjs                 desktop 1440px
//   WIDTH=390 node scripts/screenshots.mjs       another width
//
// Uses the Chrome DevTools Protocol over the WebSocket built into Node ≥ 22
// (same approach as the Silk Road Travel scripts/qa-compare.mjs).
import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.LOCAL_URL || "http://localhost:4330";
const WIDTH = Number(process.env.WIDTH) || 1440;
const HEIGHT = 900;
const root = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(root, "screenshots");
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// "/" → home, "/engagements/market-entry/" → engagements-market-entry, "/404.html" → 404
const nameOf = (path) => path.replace(/\.html$/, "").replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

function client(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      listeners.get(msg.method).forEach((fn) => fn(msg.params));
      listeners.delete(msg.method);
    }
  };
  const ready = new Promise((r) => { ws.onopen = r; });
  return {
    ready,
    send: (method, params = {}) => new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
    }),
    once: (method) => new Promise((r) => listeners.set(method, [...(listeners.get(method) || []), r])),
    close: () => ws.close(),
  };
}

async function main() {
  const sitemap = await readFile(join(root, "dist/sitemap.xml"), "utf8");
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  paths.push("/404.html");

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const profile = join(tmpdir(), `src-shots-${process.pid}`);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });

  try {
    const cdp = client(await connect());
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH < 810 });

    for (const path of paths) {
      const loaded = cdp.once("Page.loadEventFired");
      await cdp.send("Page.navigate", { url: `${BASE}${path}${path.includes("?") ? "&" : "?"}noanim` });
      await loaded;
      // Load every lazy image, then wait for them (and fonts) before capturing.
      await cdp.send("Runtime.evaluate", {
        awaitPromise: true,
        expression: `(async () => {
          document.documentElement.style.scrollBehavior = "auto";
          document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = "eager"; });
          await document.fonts.ready;
          const until = Date.now() + 15000;
          while (Date.now() < until && [...document.images].some((i) => !i.complete)) await new Promise((r) => setTimeout(r, 150));
          window.scrollTo(0, 0);
        })()`,
      });
      await sleep(600);
      const { result } = await cdp.send("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true });
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 88,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: WIDTH, height: result.value, scale: 1 },
      });
      const file = `${nameOf(path)}.jpg`;
      await writeFile(join(OUT, file), Buffer.from(data, "base64"));
      console.log(`✓ ${file}  (${WIDTH}×${result.value})`);
    }
    cdp.close();
  } finally {
    chrome.kill();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
  console.log(`\n${paths.length} screenshots → screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
