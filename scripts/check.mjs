#!/usr/bin/env node
// Static QA over dist/: internal links + anchors resolve, local assets exist,
// exactly one <h1> per page, no skipped heading levels, every <img> has alt,
// no duplicate ids. Run after `npm run build`:  npm run check
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const exists = async (p) => stat(p).then(() => true, () => false);
const urlToFile = (path) => {
  const clean = decodeURIComponent(path.split("?")[0]);
  return clean.endsWith("/") ? join(dist, clean, "index.html") : join(dist, clean);
};

const files = await walk(dist);
const idsByFile = new Map();
const docs = new Map();
for (const f of files) {
  const htmlText = await readFile(f, "utf8");
  docs.set(f, htmlText);
  idsByFile.set(f, [...htmlText.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

const problems = [];
for (const [file, doc] of docs) {
  const rel = relative(dist, file);
  const body = doc.replace(/<script[\s\S]*?<\/script>/g, "");

  const ids = idsByFile.get(file);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`${rel}: duplicate ids ${[...new Set(dupes)].join(", ")}`);

  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${rel}: ${h1} <h1> elements`);
  const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  levels.forEach((lvl, i) => {
    if (i && lvl > levels[i - 1] + 1) problems.push(`${rel}: heading jumps h${levels[i - 1]} → h${lvl}`);
  });

  for (const m of body.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) problems.push(`${rel}: <img> without alt: ${m[0].slice(0, 80)}`);
  }

  const refs = [...body.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  const srcsets = [...body.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(" ")[0]));
  for (const ref of [...refs, ...srcsets]) {
    if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const [path, hash] = ref.split("#");
    const target = path ? urlToFile(path) : file;
    if (path && !(await exists(target))) {
      problems.push(`${rel}: broken link ${ref}`);
      continue;
    }
    if (hash && docs.has(target) && !idsByFile.get(target).includes(hash)) {
      problems.push(`${rel}: missing anchor #${hash} in ${relative(dist, target)}`);
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n` + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`✓ ${files.length} pages checked: links, anchors, assets, headings, alt text, ids`);
