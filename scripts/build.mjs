#!/usr/bin/env node
// Static site build: renders every page module in src/pages into dist/ once per locale,
// copies this site's assets and the shared Silk Road brand assets (design tokens, logo
// mark, photography) from the Silk Road Travel site. Zero dependencies — `npm run build`.
//
// i18n: content modules read SITE_LANG at import time, so each locale renders in its own
// child process (this script with SITE_RENDER_TO set). English lives at /, the other
// locales under their prefix (/ar/, /ru/, /uz/).
import { mkdir, rm, writeFile, cp, rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const PAGE_MODULES = ["home", "services", "engagements", "markets", "opportunities", "insights", "about", "contact", "legal", "notfound"];
const load = (rel) => import(pathToFileURL(join(root, rel)).href);

/**
 * Root-relative links are written in English form ("/contact/"); in a localised build
 * they get the locale prefix. Assets and the API are shared, and "/~…" marks a link
 * that already names its locale (the language switcher) — the marker is stripped.
 */
const localiseLinks = (doc, prefix) =>
  doc.replace(/\b(href|action)="\/(?!\/)(~)?([^"]*)"/g, (m, attr, fixed, rest) => {
    if (fixed) return `${attr}="/${rest.replace(/^\//, "")}"`;
    if (!prefix || /^(assets|api)\//.test(rest)) return m;
    return `${attr}="${prefix}/${rest}"`;
  });

/** Child process: render one locale into `stage` and report what it used. */
async function renderLocale(stage) {
  const { locale } = await load("src/content/index.mjs");
  const { usedBrandFiles } = await load("src/components/ui.mjs");
  const rendered = [];
  for (const name of PAGE_MODULES) rendered.push(...(await load(`src/pages/${name}.mjs`)).default());
  for (const p of rendered) {
    const file = join(locale.prefix.replace(/^\//, ""), p.file ?? join(p.path.replace(/^\//, ""), "index.html"));
    const out = join(stage, file);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, localiseLinks(p.html, locale.prefix));
  }
  return { paths: rendered.filter((p) => !p.file).map((p) => locale.prefix + p.path), brand: [...usedBrandFiles] };
}

export async function build({ quiet = false } = {}) {
  const started = Date.now();
  // Built into a private folder and swapped in at the end, so a concurrent build (e.g. the
  // dev-server watcher) can never leave a half-written dist/ being served.
  const stage = join(root, `.dist-build-${process.pid}`);
  const { LOCALES, site } = await load("src/content/index.mjs");
  const { BRAND_DIR, BRAND_FILES } = await load("src/components/ui.mjs");

  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  await cp(join(root, "assets"), join(stage, "assets"), { recursive: true });

  const run = promisify(execFile);
  const results = await Promise.all(LOCALES.map(async (l) => {
    const { stdout } = await run(process.execPath, [fileURLToPath(import.meta.url)], {
      env: { ...process.env, SITE_LANG: l.code, SITE_RENDER_TO: stage },
      maxBuffer: 16 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  }));

  // Shared brand assets: only the files the pages actually reference are copied.
  for (const rel of new Set([...BRAND_FILES, ...results.flatMap((r) => r.brand)])) {
    const out = join(stage, "assets", rel);
    await mkdir(dirname(out), { recursive: true });
    await cp(join(BRAND_DIR, rel), out);
  }

  const urls = results.flatMap((r) => r.paths).map((p) => `  <url><loc>${site.origin}${p}</loc></url>`);
  await writeFile(join(stage, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
  await writeFile(join(stage, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

  const old = `${stage}-old`;
  await rename(dist, old).catch(() => {});
  await rename(stage, dist);
  await rm(old, { recursive: true, force: true });

  const count = urls.length;
  if (!quiet) console.log(`Built ${count} pages in ${LOCALES.length} languages into dist/ in ${Date.now() - started}ms`);
  return count;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const task = process.env.SITE_RENDER_TO
    ? renderLocale(process.env.SITE_RENDER_TO).then((r) => process.stdout.write(JSON.stringify(r)))
    : build();
  task.catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
