// Prerendering entry (built with `vite build --ssr`, used by scripts/prerender.mjs):
// renders every page of every language to static HTML with its <head> tags.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { LOCALES, loadContent } from "./i18n/index.js";
import App, { buildPages, fullTitle } from "./app/App.jsx";
import { imgUrl } from "./app/ui.jsx";

export { LOCALES };

/** Content and page list for one language. */
export async function prepare(lang) {
  const content = await loadContent(lang);
  return { content, pages: buildPages(content) };
}

export const render = (url, content, pages) =>
  renderToString(
    <StaticRouter location={url}>
      <App content={content} pages={pages} />
    </StaticRouter>,
  );

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

/** <head> tags for one page (title, description, canonical, hreflang alternates, Open Graph, JSON-LD). */
export function head(content, page) {
  const { site, locale, images } = content;
  const is404 = page.file === "404.html";
  const path = is404 ? "/404.html" : page.path;
  const title = fullTitle(site, page.title);
  const desc = (page.description || site.defaultDescription).slice(0, 300);
  const canonical = site.origin + locale.prefix + path;
  const ogUrl = imgUrl(images, page.ogImage || "hero");
  const image = /^https?:/.test(ogUrl) ? ogUrl : site.origin + ogUrl;
  const alternates = is404
    ? []
    : [...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${site.origin}${l.prefix}${path}">`), `<link rel="alternate" hreflang="x-default" href="${site.origin}${path}">`];
  const org = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.origin,
    description: site.defaultDescription,
    areaServed: ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman", "Uzbekistan", "Kazakhstan", "Europe"],
    knowsAbout: ["Investment advisory", "Strategic advisory", "Joint ventures", "Market entry", "Digital transformation", "AI transformation", "Product development"],
  };
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${canonical}">`,
    ...alternates,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:locale" content="${locale.og}">`,
    `<meta property="og:title" content="${esc(page.title || site.defaultTitle)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    locale.dir === "rtl" ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" data-font-ar>` : "",
    ld(org),
    page.jsonLd ? ld(page.jsonLd) : "",
  ].filter(Boolean).join("\n");
}
