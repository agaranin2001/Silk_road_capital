#!/usr/bin/env node
// Prerender: after `vite build` (client → dist/) and `vite build --ssr` (→ .ssr/), render every
// page of every language to static HTML in dist/, so the site works as plain static files
// (SEO, no JavaScript needed to read it) and React hydrates it in the browser.
// English lives at /, the other languages under their prefix (/ar/, /ru/, /uz/).
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const ssrDir = join(root, ".ssr");

const started = Date.now();
const { LOCALES, prepare, render, head } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);
const template = await readFile(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-->") || !template.includes("<!--head-->")) throw new Error("dist/index.html is missing the <!--head--> / <!--app--> placeholders");

const urls = [];
let count = 0;
for (const locale of LOCALES) {
  const { content, pages } = await prepare(locale.code);
  for (const page of pages) {
    const is404 = page.file === "404.html";
    const url = locale.prefix + (is404 ? "/404.html" : page.path);
    // React emits <link rel="preload"> hints for eager images before the app markup; they belong in <head>.
    const app = render(url, content, pages);
    const preloads = (app.match(/^(?:<link [^>]*\/>)+/) || [""])[0];
    const htmlDoc = template
      .replace('<html lang="en" dir="ltr">', `<html lang="${locale.code}" dir="${locale.dir}">`)
      .replace("<!--head-->", `${head(content, page)}\n${preloads}`)
      .replace("<!--app-->", app.slice(preloads.length));
    const file = join(dist, locale.prefix.replace(/^\//, ""), is404 ? "404.html" : join(page.path.replace(/^\//, ""), "index.html"));
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, htmlDoc);
    count += 1;
    if (!is404) urls.push(`${content.site.origin}${url}`);
  }
  if (locale.code === "en") {
    const { site } = content;
    await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
  }
}

await writeFile(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`,
);
await rm(ssrDir, { recursive: true, force: true });
console.log(`Prerendered ${count} pages in ${LOCALES.length} languages into dist/ in ${Date.now() - started}ms`);
