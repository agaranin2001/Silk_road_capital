import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { html, attrs, raw, escape } from "../lib/html.mjs";
import { icon } from "./icons.mjs";
import { contact, images, locale } from "../content/index.mjs";

/**
 * Shared brand assets live in the Silk Road Travel site (../assets): design tokens,
 * the logo mark and the photography. Override with BRAND_ASSETS=/path/to/assets.
 * Outside the Travel project (e.g. a standalone clone) the copies in ./brand are used.
 * The build copies BRAND_FILES plus every image a page references (usedBrandFiles).
 */
const TRAVEL_ASSETS = fileURLToPath(new URL("../../../assets", import.meta.url));
export const BRAND_DIR = process.env.BRAND_ASSETS
  || (existsSync(`${TRAVEL_ASSETS}/css/tokens.css`) ? TRAVEL_ASSETS : fileURLToPath(new URL("../../brand", import.meta.url)));
export const BRAND_FILES = ["css/tokens.css", "img/silk-road-mark-96.webp", "img/silk-road-mark-192.webp", "img/favicon-silkroad.png", "img/preloader_bg.webp"];
export const usedBrandFiles = new Set();

const manifestPath = `${BRAND_DIR}/img/opt/manifest.json`;
const MANIFEST = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const stem = (file) => file.replace(/\.[a-z0-9]+$/i, "");

/** Unsplash CDN URL for a photo key from images.json at a given width. */
const unsplash = (p, w) => `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=72`;

/**
 * Responsive <img>. `file` is either a photo key from images.json (web photography,
 * served from the Unsplash CDN) or a brand image from the Silk Road Travel assets,
 * using its optimised 800/1600 derivatives.
 */
export function img(file, { alt, className = "", sizes = "100vw", eager = false } = {}) {
  const p = images.items[file];
  if (p) {
    return html`<img ${attrs({
      class: className,
      src: unsplash(p, 1600),
      srcset: [640, 1024, 1600, 2400].map((w) => `${unsplash(p, w)} ${w}w`).join(", "),
      sizes,
      alt: alt ?? p.alt,
      loading: eager ? "eager" : "lazy",
      fetchpriority: eager ? "high" : undefined,
      decoding: "async",
    })}>`;
  }
  alt = alt ?? "";
  const base = stem(file.split("/").pop());
  const available = [`${base}-800.webp`, `${base}-1600.webp`].filter((name) => MANIFEST[name]);
  if (!available.length) {
    usedBrandFiles.add(`img/${file}`);
    return html`<img ${attrs({ class: className, src: `/assets/img/${file}`, alt, loading: eager ? "eager" : "lazy", decoding: "async" })}>`;
  }
  available.forEach((name) => usedBrandFiles.add(`img/opt/${name}`));
  const [w, h] = MANIFEST[available[0]];
  const srcset = available.map((name) => `/assets/img/opt/${name} ${MANIFEST[name][0]}w`).join(", ");
  return html`<img ${attrs({
    class: className,
    src: `/assets/img/opt/${available[available.length - 1]}`,
    srcset: available.length > 1 ? srcset : undefined,
    sizes: available.length > 1 ? sizes : undefined,
    width: w,
    height: h,
    alt,
    loading: eager ? "eager" : "lazy",
    fetchpriority: eager ? "high" : undefined,
    decoding: "async",
  })}>`;
}

/** Brand image URL (largest derivative) for CSS backgrounds / og:image. */
export function imgUrl(file) {
  if (images.items[file]) return unsplash(images.items[file], 1600);
  const name = `${stem(file.split("/").pop())}-1600.webp`;
  if (MANIFEST[name]) {
    usedBrandFiles.add(`img/opt/${name}`);
    return `/assets/img/opt/${name}`;
  }
  usedBrandFiles.add(`img/${file}`);
  return `/assets/img/${file}`;
}

/** Round country flag (circle-flags by HatScripts, MIT licence, via jsDelivr). Decorative. */
const FLAG_CDN = "https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags";
export const flag = (code, className = "m-flag") =>
  html`<img ${attrs({ class: className, src: `${FLAG_CDN}/${code}.svg`, alt: "", width: 24, height: 24, loading: "lazy", decoding: "async" })}>`;

/** Text with "\n" line breaks → escaped text with <br>. */
export const lines = (text) => raw(String(text).split("\n").map(escape).join("<br>"));

/** Contact link that pre-selects an interest (aliases map engagement keys onto form options). */
export const contactHref = ({ interest, topic } = {}) => {
  const params = new URLSearchParams();
  const value = contact.aliases[interest] ?? interest;
  if (value) params.set("interest", value);
  if (topic) params.set("topic", topic);
  const q = params.toString();
  return `/contact/${q ? `?${q}` : ""}`;
};

export const btnPrimary = ({ label, href, className = "", attrs: extra = {}, iconName = "spark", type }) => {
  const inner = html`<span class="button-sm">${label}</span><span class="btn-icon">${icon(iconName)}</span>`;
  if (type) return html`<button ${attrs({ type, class: `btn-primary ${className}`.trim(), ...extra })}>${inner}</button>`;
  return html`<a ${attrs({ class: `btn-primary ${className}`.trim(), href, ...extra })}>${inner}</a>`;
};

export const btnSecondary = ({ label, href, className = "", attrs: extra = {}, iconName = "arrow", type }) => {
  const inner = html`<span class="button-sm">${label}</span><span class="btn-icon">${icon(iconName)}</span>`;
  if (type) return html`<button ${attrs({ type, class: `btn-secondary ${className}`.trim(), ...extra })}>${inner}</button>`;
  return html`<a ${attrs({ class: `btn-secondary ${className}`.trim(), href, ...extra })}>${inner}</a>`;
};

/** Outline pill — the quiet secondary action next to a primary button. */
export const btnOutline = ({ label, href, className = "", iconName = "arrow" }) =>
  html`<a class="btn-outline ${className}" href="${href}"><span class="button-sm">${label}</span><span class="btn-icon">${icon(iconName)}</span></a>`;

/** Text link with arrow (card CTAs). */
export const arrowLink = ({ label, href, className = "" }) =>
  html`<a class="arrow-link button-sm ${className}" href="${href}"><span>${label}</span>${icon("arrowUpRight", "arrow-link__icon")}</a>`;

export const miniLabel = (label, extraClass = "") =>
  html`<div class="head__title ${extraClass}">${icon("star8", "logo-mini")}<span class="body-md">${label}</span></div>`;

/** Uppercase micro-label: "01 / INVESTMENT ADVISORY". */
export const microLabel = (text, extraClass = "") => html`<p class="micro ${extraClass}">${text}</p>`;

export const heading = (level, className, text, { id, anim } = {}) =>
  html`<${raw(level)} ${attrs({ class: className, id, "data-anim": anim })}>${text}</${raw(level)}>`;

/**
 * Section head: "✦ Label" in the narrow column, statement in the wide column
 * (the Silk Road Travel `.head` block), optional muted copy and action below.
 */
export const sectionHead = ({ label, title, text, action, level = "h2", titleClass = "h2", id, className = "" }) => html`
  <div class="head ${className}">
    <div class="row mobile-column">
      <div class="column column-3">${miniLabel(label, "mobile-margin-bottom-24")}</div>
      <div class="column column-9">
        <div class="head__description">
          ${heading(level, titleClass, lines(title), { id, anim: "chars" })}
          ${text || action ? html`<div class="head__aside">
            ${text ? html`<p class="body-lg color-white-60 head__text" data-anim="fade-up">${text}</p>` : ""}
            ${action ?? ""}
          </div>` : ""}
        </div>
      </div>
    </div>
  </div>`;

/** Split head: big title on the left, muted copy (+ optional action) on the right. */
export const splitHead = ({ label, title, text, action, level = "h2", titleClass = "h2", id }) => html`
  <div class="head head--split">
    ${label ? miniLabel(label, "margin-bottom-24") : ""}
    <div class="row align-end mobile-column">
      <div class="column column-6">${heading(level, titleClass, lines(title), { id, anim: "chars" })}</div>
      <div class="column column-6">
        <div class="split-head">
          ${text ? html`<p class="body-md color-white-60" data-anim="fade-up">${text}</p>` : ""}
          ${action ?? ""}
        </div>
      </div>
    </div>
  </div>`;

export const pad2 = (n) => String(n).padStart(2, "0");

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale.intl, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
