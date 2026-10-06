# Silk Road Capital — website

A separate static website for Silk Road Capital (investment, strategy, joint ventures, digital & AI),
built in the same design language as the Silk Road Travel site in the parent folder.

- **Stack:** React 19 + React Router 7, built with Vite 6. Every page of every language is **prerendered to static
  HTML** at build time (SEO, readable without JavaScript) and React hydrates it in the browser; navigation inside a
  language is client-side. Plain CSS (unchanged design system), GSAP + Lenis (npm) for animation and smooth scrolling.
- **Design:** layout, spacing, radii, type scale and components follow the mollie.com component set
  (hero with status chips, icon link grid, feature cards, partner-card fan, auto-advancing tabbed split, story carousel,
  glow panel, support row, CTA card, image tiles). Fonts and colours are Silk Road's own.
- **Brand assets:** design tokens, logo mark, favicon and preloader image (from the Silk Road Travel site) live in
  `src/styles/tokens.css` and `public/assets/img/`. Photography is served from the Unsplash CDN (`src/content/images.json`).

```bash
npm install
npm run dev
```

Opens http://localhost:4330 with hot reload and the `/api/contact` endpoint.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload + `/api/contact` |
| `npm run build` | client build, then prerender all pages of all languages into `dist/` (+ `sitemap.xml`, `robots.txt`) |
| `npm run preview` | serve the built `dist/` locally (with `/api/contact`) |
| `npm start` | production Node server: `dist/` + `/api/contact` (`scripts/serve.mjs`) |
| `npm run check` | static QA of `dist/`: links, anchors, assets, headings, alt, ids |
| `npm run map` | regenerate `public/assets/img/map.svg` from the crop in `src/content/markets.json` |

## Structure

```
src/content/        all copy as JSON + ui.json (interface strings) and i18n/<lang>/ (translations)
src/i18n/           LOCALES, content loading/merging per language, useContent() hook (content, t(), href())
src/app/App.jsx     routes (built from the page modules), page wrapper, scroll handling
src/app/Layout.jsx  header with mega dropdowns, full-screen menu, language dialog, footer
src/app/blocks.jsx  home page blocks (Mollie component set)
src/app/sections.jsx  inner-page sections (incl. engagement selector, map, networks)
src/app/pages/      one module per page template: export default (content) => [{ path, title, description, element }]
src/app/ui.jsx      links (<L> adds the language prefix), images, buttons, labels, headings
src/app/behaviours.js  client-only behaviours: GSAP reveals, Lenis, carousels, auto-tabs, hero cases, counters
src/main.jsx        browser entry (hydrates the prerendered page)
src/entry-server.jsx + scripts/prerender.mjs   static rendering of every page and its <head>
src/styles/         tokens.css, main.css (base, chrome), sections.css (components)
public/assets/img/  logo, favicon, preloader, map.svg, portrait
server/contact.mjs  contact form endpoint (forwards to Telegram when configured)
```

## Pages

`/` · `/invest/` · `/advisory/` · `/joint-ventures/` · `/digital/` · `/ai/` · `/products/` ·
`/engagements/` + 9 engagement pages · `/markets/` · `/opportunities/` + 5 opportunity pages ·
`/insights/` + 6 articles · `/about/` · `/contact/` · `/privacy/` · `404.html`

## Languages (i18n)

English is the source language and lives at `/`. Arabic (`/ar/`, right-to-left), Russian (`/ru/`) and Uzbek in Latin
script (`/uz/`) are built from the same templates. Every page has a language switcher in the header.

- **Copy:** `src/content/i18n/<lang>/<file>.json` has the same structure as the English file and is deep-merged over it,
  so any missing string falls back to English. Keep keys, order and array lengths identical. Leave slugs, hrefs,
  image keys and `value`/`interest` codes in English.
- **Interface strings** (buttons, labels, aria labels, SEO titles, form messages): `src/content/ui.json`, read with
  `t("key", { vars })`. Add new keys there first, then to each `i18n/<lang>/ui.json`.
- **Build:** each language is rendered from the same React components with its own content (`buildContent`).
  Internal links are written in English form (`<L href="/contact/">`) and get the language prefix automatically.
  The language switcher links reload the page in the other language. Pages get `hreflang` alternates, and the
  sitemap lists every language. Only the visitor's language is downloaded (code-split per language).
- **Locales** are defined in `LOCALES` in `src/i18n/index.js` (prefix, direction, date locale, `og:locale`).
- **Arabic / RTL:** `<html dir="rtl">`, IBM Plex Sans Arabic, mirrored directional icons (`.icon-dir`) and logical CSS
  properties. Headline animations split Arabic by word, not by letter, so the letters stay joined.

## Deploying

**Static hosting (simplest, e.g. Hostinger with a Vite/React preset):** build command `npm run build`,
output directory `dist`, no entry file. All pages work; for the contact form set `VITE_CONTACT_ENDPOINT` at build time
to a JSON form endpoint (e.g. a form service), or use the Node option below.

**Node hosting (contact form via the bundled endpoint):** build command `npm run build`, Node 20+, output directory
empty, entry file `server.cjs` (a CommonJS wrapper for hosts that start apps with `require()`; it loads
`scripts/serve.mjs`, which serves `dist/` and `/api/contact`). The server listens on `PORT` (port number or socket path).
Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to deliver enquiries.

## Before launch — needs your input

- **Translations** were machine-assisted. Have native speakers review the Arabic, Russian and Uzbek copy before launch,
  especially legal text (privacy notice, disclaimer).

- **Domain:** `origin` in `src/content/site.json` is a placeholder (`https://silkroad.capital`); it drives canonical URLs and the sitemap.
- **Contact form:** set `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` for the bundled server, or point
  `VITE_CONTACT_ENDPOINT` (build time) at another JSON form endpoint. Without either, the form shows a
  "not connected" error and never pretends to have sent anything. Optionally set `contacts.email` in `site.json`.
- **Opportunities** are clearly labelled *illustrative examples*; replace them with real (non-confidential) teasers or keep the label.
- **Selected experience** is written as mandate *types* ("Supporting an international investor…"), not past claims. Switch to
  past tense only for work that has actually been done.
- **AI dashboard** figures are marked "Illustrative interface".
- **Insights** are starter articles — review before publishing.
- **Privacy notice and footer disclaimer** are generic; have counsel review them, especially regarding regulated investment activity in Saudi Arabia (CMA) and other markets.
- **Photography** comes from Unsplash (free Unsplash License, commercial use allowed) and is listed with photographer credits in
  `src/content/images.json`. Images are hot-linked from the Unsplash CDN with size parameters. To self-host, download the
  files into `assets/img/` and point the keys at them.
- **Country flags** are the open-source circle-flags set (HatScripts, MIT licence), loaded from jsDelivr (`flag()` in `src/components/ui.mjs`).
- **Hero cases** (country photo, status chips, engagement card) are listed in `src/content/home.json` → `hero.cases` and rotate automatically; all are marked *Illustrative*.
