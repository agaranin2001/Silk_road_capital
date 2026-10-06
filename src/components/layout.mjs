import { html, attrs } from "../lib/html.mjs";
import { icon } from "./icons.mjs";
import { img, imgUrl, pad2 } from "./ui.mjs";
import { site, services, markets, home, t, LOCALES, locale } from "../content/index.mjs";
import { mMarquee } from "./blocks.mjs";

// Hash links ("/about/#network") point into a section, not a page — never "current".
const isCurrent = (href, path) => {
  if (href.includes("#")) return false;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href);
};

const logo = (cls) => html`
  <span class="${cls}">
    <img class="logo-mark" src="/assets/img/silk-road-mark-96.webp" srcset="/assets/img/silk-road-mark-96.webp 1x, /assets/img/silk-road-mark-192.webp 2x" width="101" height="96" alt="" decoding="async">
    <span class="logo-word">Silk Road <span class="logo-capital">Capital</span></span>
  </span>`;

// Header — same structure and behaviour as the Silk Road Travel header
// (logo cell | nav with mega dropdowns | accent cell | burger cell, dark full-screen menu).
const navItem = (item, path, index) => {
  const current = (item.match ?? [item.href]).some((h) => isCurrent(h, path));
  if (!item.children) {
    return html`<li class="header-nav__item"><a ${attrs({ class: "button-sm header-nav__link", href: item.href, "aria-current": current ? "page" : undefined })}>${item.label}</a></li>`;
  }
  const id = `dropdown-${index}`;
  const m = item.mega;
  return html`<li class="header-nav__item header-nav__item--mega ${current ? "is-current" : ""}" data-dropdown>
    <button ${attrs({ type: "button", class: "button-sm header-nav__link", "aria-expanded": "false", "aria-controls": id })}>${item.label}${icon("caret", "header-nav__caret")}</button>
    <div class="dropdown mega" id="${id}">
      <div class="mega__in">
        <a class="mega__card" href="${m.cta.href}">
          <span class="mega__photo">${img(m.image, { alt: "", className: "mega__img", sizes: "352px" })}</span>
          <span class="mega__kicker micro">${m.kicker}</span>
          <span class="mega__title">${m.title}</span>
          <span class="mega__text">${m.text}</span>
          <span class="mega__cta button-sm">${m.cta.label}${icon("arrowUpRight", "mega__cta-icon")}</span>
        </a>
        <div class="mega__links">
          <p class="mega__heading">${item.label}</p>
          <ul class="mega__list" role="list">
            ${item.children.map((c) => html`<li><a ${attrs({ class: "mega__link", href: c.href, "aria-current": isCurrent(c.href, path) ? "page" : undefined })}>
              <span class="mega__link-body"><span class="mega__link-label">${c.label}</span><span class="mega__link-text">${c.text}</span></span>
              ${icon("arrowUpRight", "mega__link-icon")}
            </a></li>`)}
          </ul>
        </div>
      </div>
    </div>
  </li>`;
};

// Language switcher: header cell (globe + short code) that opens the language dialog below.
const currentLang = site.languages.find((l) => l.code === site.lang) || site.languages[0];
const langButton = (cls) => html`<button type="button" class="${cls}" data-lang-open aria-haspopup="dialog" aria-controls="lang-dialog" aria-label="${t("lang.button", { name: currentLang.name })}">${icon("globe", "header__lang-icon")}<span class="button-sm">${currentLang.code.toUpperCase()}</span></button>`;

const langDialog = (path) => html`
<dialog class="lang-dialog" id="lang-dialog" aria-labelledby="lang-dialog-title" data-lang-dialog>
  <div class="lang-dialog__in">
    <div class="lang-dialog__head">
      <p class="m-eyebrow">${t("lang.eyebrow")}</p>
      <button type="button" class="lang-dialog__close" data-lang-close aria-label="${t("aria.close")}">${icon("close")}</button>
    </div>
    <h2 class="lang-dialog__title" id="lang-dialog-title">${t("lang.title")}</h2>
    <ul class="lang-dialog__list" role="list">
      ${site.languages.map((l) => html`<li>
        <a ${attrs({ class: `lang-option ${l.code === currentLang.code ? "is-current" : ""}`, href: `/~${(LOCALES.find((x) => x.code === l.code) || {}).prefix || ""}${path === "/404.html" ? "/" : path}`, hreflang: l.code, lang: l.code, "data-lang": l.code, "aria-current": l.code === currentLang.code ? "true" : undefined })}>
          <span class="lang-option__code">${l.code.toUpperCase()}</span>
          <span class="lang-option__body"><span ${attrs({ class: "lang-option__native", lang: l.code })}>${l.native}</span><span class="lang-option__name">${l.name}</span></span>
          ${l.code === currentLang.code ? html`<span class="lang-option__state">${icon("check")}</span>` : ""}
        </a>
      </li>`)}
    </ul>
  </div>
</dialog>`;

export const header = (path) => html`
<header class="header" data-header>
  <div class="header__in">
    <a class="header__l" href="/" aria-label="${t("aria.home")}">${logo("header-logo")}</a>
    <nav class="header__r" aria-label="${t("aria.mainNav")}">
      <ul class="header-nav" role="list">${site.nav.map((item, i) => navItem(item, path, i))}</ul>
      ${langButton("header__lang")}
      <a class="header__accent" href="${site.cta.href}"><span class="button-sm">${site.cta.label}</span>${icon("arrowUpRight", "header__accent-icon")}</a>
    </nav>
    ${langButton("header__lang header__lang--compact")}
    <div class="header__burger">
      <button class="btn-burger" type="button" aria-label="${t("aria.openMenu")}" aria-expanded="false" aria-controls="mobile-menu" data-burger>
        <span class="btn-burger__in"><span class="btn-burger__line btn-burger__line--1"></span><span class="btn-burger__line btn-burger__line--2"></span></span>
      </button>
    </div>
  </div>
  <div class="fullmenu" id="mobile-menu" data-mobile-menu aria-hidden="true" data-lenis-prevent>
    <div class="fullmenu__in">
      <div class="fullmenu__main">
        <section class="fullmenu__section" aria-labelledby="fm-services">
          <div class="fullmenu__head"><p class="fullmenu__title" id="fm-services">${t("menu.services")}</p><span class="fullmenu__rule"></span><a class="fullmenu__all button-sm" href="/engagements/">${t("menu.allEngagements")}${icon("arrowUpRight", "fullmenu__arrow")}</a></div>
          <div class="fullmenu__cols">
            ${site.nav.filter((n) => n.children && n.href !== "/markets/").map((n) => html`<div class="fullmenu__col">
              <a class="fullmenu__label" href="${n.href}">${n.label}</a>
              <ul role="list">${n.children.map((c) => html`<li><a ${attrs({ class: "fullmenu__link", href: c.href, "aria-current": isCurrent(c.href, path) ? "page" : undefined })}>${c.label}</a></li>`)}</ul>
            </div>`)}
          </div>
        </section>
        <section class="fullmenu__section" aria-labelledby="fm-markets">
          <div class="fullmenu__head"><p class="fullmenu__title" id="fm-markets">${t("menu.markets")}</p><span class="fullmenu__rule"></span><a class="fullmenu__all button-sm" href="/markets/">${t("menu.allMarkets")}${icon("arrowUpRight", "fullmenu__arrow")}</a></div>
          <div class="fullmenu__cards">
            ${markets.tiles.map((t) => html`<a class="fullmenu__card" href="${t.href}"><span class="fullmenu__photo">${img(t.image, { alt: "", sizes: "(max-width: 1199px) 200px, 22vw" })}</span><span class="fullmenu__caption">${t.name}</span></a>`)}
          </div>
        </section>
      </div>
      <nav class="fullmenu__more" aria-label="${t("aria.siteSections")}">
        ${[
          { title: t("menu.opportunities"), links: [{ label: t("menu.allOpportunities"), href: "/opportunities/" }, { label: t("menu.requestAccess"), href: "/contact/?interest=investment" }] },
          { title: t("menu.insights"), links: [{ label: t("menu.perspectives"), href: "/insights/" }] },
          { title: t("menu.company"), links: [...site.navSecondary, { label: t("privacy"), href: "/privacy/" }] },
        ].map((g) => html`<div class="fullmenu__group">
          <p class="fullmenu__label">${g.title}</p>
          <ul role="list">${g.links.map((l) => html`<li><a ${attrs({ class: "fullmenu__link fullmenu__link--sm", href: l.href, "aria-current": isCurrent(l.href, path) ? "page" : undefined })}>${l.label}</a></li>`)}</ul>
        </div>`)}
      </nav>
      <div class="fullmenu__foot">
        <div class="fullmenu__contacts">
          <p class="fullmenu__statement">${site.statement}</p>
          <p class="fullmenu__geo">${site.geography.join(" · ")}</p>
        </div>
        <a class="fullmenu__btn" href="${site.cta.href}"><span class="button-sm">${site.cta.label}</span>${icon("spark", "fullmenu__btn-icon")}</a>
      </div>
    </div>
  </div>
</header>`;

export const footer = () => html`
<footer class="m-footer">
  <div class="m-wrap">
    <div class="m-footer__top">
      ${site.footer.map(
        (col) => html`<div class="m-footer__col">
          <p class="m-eyebrow">${col.title}</p>
          <ul role="list">${col.links.map((l) => html`<li><a href="${l.href}">${l.label}</a></li>`)}</ul>
        </div>`,
      )}
      <div class="m-footer__col m-footer__col--brand">
        <p class="m-eyebrow">Silk Road Capital</p>
        <p class="m-footer__statement">${site.statement}</p>
      </div>
    </div>
  </div>
  ${mMarquee(home.marquee, { label: t("aria.marketsFooter") })}
  <div class="m-wrap">
    <div class="m-footer__bottom">
      <a class="m-footer__logo" href="/" aria-label="${t("aria.home")}">${logo("m-logo")}</a>
      <p>${site.copyright}, <span data-year>2026</span></p>
      <a href="/privacy/">${t("privacy")}</a>
    </div>
  </div>
</footer>`;

/** Section index helper for numbered lists ("01", "02"…). */
export const num = (i) => pad2(i + 1);

export function page({ path, title, description, ogImage, body, jsonLd, scripts = [] }) {
  const fullTitle = title ? `${title} | ${site.name}` : site.defaultTitle;
  const desc = (description || site.defaultDescription).slice(0, 300);
  const canonical = site.origin + locale.prefix + (path === "/404.html" ? "/404.html" : path);
  const alternates = path === "/404.html" ? "" : [...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${site.origin}${l.prefix}${path}">`), `<link rel="alternate" hreflang="x-default" href="${site.origin}${path}">`].join("\n");
  const jsStrings = { base: locale.prefix, openMenu: t("aria.openMenu"), closeMenu: t("aria.closeMenu"), startingPoint: t("selector.startingPoint"), errName: t("form.errName"), errEmail: t("form.errEmail"), errMessage: t("form.errMessage"), regarding: t("form.regarding") };
  const ogUrl = imgUrl(ogImage || "hero");
  const image = /^https?:/.test(ogUrl) ? ogUrl : site.origin + ogUrl;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: site.name,
      url: site.origin,
      description: site.defaultDescription,
      areaServed: ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman", "Uzbekistan", "Kazakhstan", "Europe"],
      knowsAbout: ["Investment advisory", "Strategic advisory", "Joint ventures", "Market entry", "Digital transformation", "AI transformation", "Product development"],
    },
    ...(jsonLd ? [jsonLd] : []),
  ];
  return `<!DOCTYPE html>
<html lang="${site.lang}" dir="${locale.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${html`${fullTitle}`}</title>
<meta name="description" content="${html`${desc}`}">
<link rel="canonical" href="${canonical}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="${locale.og}">
<meta property="og:title" content="${html`${title || site.defaultTitle}`}">
<meta property="og:description" content="${html`${desc}`}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${html`${image}`}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f3ede4">
<link rel="icon" type="image/png" href="/assets/img/favicon-silkroad.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap">
${locale.dir === "rtl" ? '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap">' : ""}
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/sections.css">
<script>(function(d){d.classList.add("js","anim-pending");if(/[?&]noanim\\b/.test(location.search)||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("no-preloader");setTimeout(function(){d.classList.remove("anim-pending")},3000)})(document.documentElement)</script>
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<div class="preloader" data-preloader aria-hidden="true">
  <div class="preloader__pattern"></div>
  <div class="preloader__shine"></div>
  <div class="preloader__stage">
    <span class="preloader__mark"></span>
    <span class="preloader__title">Silk Road <span class="logo-capital">Capital</span></span>
  </div>
</div>
<a class="skip-link" href="#main">${t("skip")}</a>
${header(path)}
${langDialog(path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
<script>window.SRC_I18N=${JSON.stringify(jsStrings).replace(/</g, "\\u003c")}</script>
<script src="/assets/js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/SplitText.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" defer></script>
<script src="/assets/js/main.js" defer></script>
${scripts.map((src) => `<script src="${src}" defer></script>`).join("\n")}
</body>
</html>
`;
}
