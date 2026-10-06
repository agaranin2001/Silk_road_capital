#!/usr/bin/env node
// Server: serves dist/ and hosts the /api/contact endpoint.
//   npm run dev  → builds, then rebuilds on changes to src/ or assets/ (--watch)
//   npm start    → production: builds only if dist/ is missing, no file watching
// Hosting: listens on process.env.PORT, which may be a port number or a socket path.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { handleContact } from "../server/contact.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const PORT = process.env.PORT || 4330;
const WATCH = process.argv.includes("--watch");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let file = join(dist, clean);
  if (!file.startsWith(dist)) return null;
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, "index.html");
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

// Each build runs in a fresh process so edited components/content are re-imported.
const build = () => {
  const r = spawnSync(process.execPath, [join(root, "scripts/build.mjs")], { stdio: "inherit" });
  if (r.status !== 0) console.error("Build failed — serving the previous dist/.");
};

if (WATCH || !existsSync(join(dist, "index.html"))) build();

const server = createServer(async (req, res) => {
  if (req.url.startsWith("/api/contact")) return handleContact(req, res);
  const file = await resolveFile(req.url);
  if (!file) {
    // Directory without trailing slash → redirect, otherwise 404 page.
    const withSlash = await resolveFile(req.url.split("?")[0] + "/");
    if (withSlash && !req.url.endsWith("/")) {
      res.writeHead(301, { Location: req.url.split("?")[0] + "/" });
      return res.end();
    }
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return res.end(await readFile(join(dist, "404.html")));
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
  res.end(await readFile(file));
});

server.listen(PORT, () => console.log(`Silk Road Capital → ${/^\d+$/.test(String(PORT)) ? `http://localhost:${PORT}` : PORT}`));

if (WATCH) {
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  };
  for (const dir of ["src", "assets"]) watch(join(root, dir), { recursive: true }, rebuild);
}
