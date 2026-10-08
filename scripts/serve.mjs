#!/usr/bin/env node
// Production server for Node hosts: serves the prerendered site in dist/ and the
// /api/contact endpoint. `npm start` (after `npm run build`). Static hosting needs no server:
// upload dist/ — only the contact form then needs a JSON form endpoint (VITE_CONTACT_ENDPOINT).
// Listens on process.env.PORT, which may be a port number or a socket path.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleContact } from "../server/contact.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const PORT = process.env.PORT || 4330;
const LOCALE_PREFIXES = ["/ar", "/ru", "/uz"];

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

const notFoundPage = (urlPath) => {
  const prefix = LOCALE_PREFIXES.find((p) => urlPath === p || urlPath.startsWith(`${p}/`)) || "";
  return join(dist, prefix.replace(/^\//, ""), "404.html");
};

const server = createServer(async (req, res) => {
  if (req.url.startsWith("/api/contact")) return handleContact(req, res);
  const file = await resolveFile(req.url);
  if (!file) {
    // Directory without trailing slash → redirect, otherwise the language's 404 page.
    const path = req.url.split("?")[0];
    const withSlash = await resolveFile(`${path}/`);
    if (withSlash && !path.endsWith("/")) {
      res.writeHead(301, { Location: `${path}/` });
      return res.end();
    }
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return res.end(await readFile(notFoundPage(path)).catch(() => readFile(join(dist, "404.html"))));
  }
  const hashed = file.includes(`${join("assets", "build")}`);
  res.writeHead(200, {
    "Content-Type": TYPES[extname(file)] || "application/octet-stream",
    "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "no-cache",
  });
  res.end(await readFile(file));
});

server.listen(PORT, () => console.log(`Ibn Sina Ventures → ${/^\d+$/.test(String(PORT)) ? `http://localhost:${PORT}` : PORT}`));
