import { html, attrs, raw } from "../lib/html.mjs";
import { icon } from "./icons.mjs";
import { img, imgUrl, lines, btnPrimary, btnSecondary, btnOutline, arrowLink, miniLabel, microLabel, sectionHead, splitHead, heading, contactHref, pad2, formatDate } from "./ui.mjs";
import { num } from "./layout.mjs";
import { mCta } from "./blocks.mjs";
import { markets, marketsBase, packageBySlug, opportunities, products, engagements, t } from "../content/index.mjs";

// Latin slug for ids; titles without Latin letters (Arabic, Cyrillic) get a short stable hash instead.
const hash = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.codePointAt(0)) >>> 0, 7).toString(36);
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `x${hash(s)}`;

/* ------------------------------------------------------------------ page hero */

/** Inner-page hero — the Mollie hero layout (eyebrow + display title | lead + actions, rounded photo). */
export const pageHero = ({ label, title, lead, actions = [], image, imageAlt, crumbs = [], aside, notice }) => html`
<section class="m-hero m-hero--page" aria-labelledby="page-title">
  <div class="m-wrap">
    ${crumbs.length ? html`<nav class="m-crumbs" aria-label="${t("aria.breadcrumbs")}">${crumbs.map((c) => c.href ? html`<a href="${c.href}">${c.label}</a>` : html`<span aria-current="page">${c.label}</span>`)}</nav>` : ""}
    <div class="m-hero__head">
      <div class="m-hero__title-wrap">
        <p class="m-eyebrow">${label}</p>
        <h1 class="m-display m-display--page" id="page-title" data-anim="intro-title">${lines(title)}</h1>
      </div>
      <div class="m-hero__aside" data-anim="intro-text">
        ${lead ? html`<p class="m-hero__text">${lead}</p>` : ""}
        ${actions.length ? html`<div class="m-btns">${actions}</div>` : ""}
        ${aside ?? ""}
      </div>
    </div>
    ${notice ? html`<p class="m-note m-note--left">${icon("lock", "m-note__icon")}<span>${notice}</span></p>` : ""}
  </div>
  ${image ? html`<div class="m-hero__media m-hero__media--page" data-anim="intro-media">${img(image, { alt: imageAlt, className: "m-hero__img", eager: true, sizes: "(max-width: 809px) 100vw, 1400px" })}</div>` : ""}
</section>`;

/* ---------------------------------------------------------- capability visuals
 * Small line-art "product demos" for each capability (Mollie-style visual blocks).
 * currentColor = theme ink; .v-accent = brand orange. */
const VISUALS = {
  invest: () => {
    const left = [30, 50, 70, 90, 110, 130, 150];
    const mid = [70, 90, 110];
    return raw(`<svg viewBox="0 0 320 180" class="cap-visual" aria-hidden="true" focusable="false">
      ${left.map((y, i) => `<path class="v-line" d="M44 ${y} C100 ${y} 110 ${mid[Math.min(2, Math.floor(i / 2.5))]} 156 ${mid[Math.min(2, Math.floor(i / 2.5))]}"/>`).join("")}
      ${mid.map((y) => `<path class="v-line" d="M164 ${y} C220 ${y} 230 90 272 90"/>`).join("")}
      ${left.map((y) => `<circle class="v-dot" cx="40" cy="${y}" r="4"/>`).join("")}
      ${mid.map((y) => `<circle class="v-dot v-dot--mid" cx="160" cy="${y}" r="5"/>`).join("")}
      <circle class="v-accent v-pulse" cx="280" cy="90" r="14"/><circle class="v-accent-fill" cx="280" cy="90" r="7"/>
      <text class="v-text" x="40" y="174" text-anchor="middle">${t("cap.sourced")}</text><text class="v-text" x="160" y="174" text-anchor="middle">${t("cap.screened")}</text><text class="v-text" x="280" y="174" text-anchor="middle">${t("cap.selected")}</text>
    </svg>`);
  },
  advise: () => raw(`<svg viewBox="0 0 320 180" class="cap-visual" aria-hidden="true" focusable="false">
      <path class="v-line" d="M60 20V156H300"/><path class="v-line v-dash" d="M180 20V156M60 88H300"/>
      <circle class="v-dot v-dot--soft" cx="102" cy="122" r="9"/><circle class="v-dot v-dot--soft" cx="140" cy="60" r="6"/><circle class="v-dot v-dot--soft" cx="220" cy="128" r="11"/>
      <circle class="v-dot v-dot--soft" cx="122" cy="140" r="5"/><circle class="v-dot v-dot--soft" cx="268" cy="112" r="6"/>
      <circle class="v-accent v-pulse" cx="248" cy="50" r="20"/><circle class="v-accent-fill" cx="248" cy="50" r="9"/>
      <text class="v-text" x="300" y="174" text-anchor="end">${t("cap.abilityToWin")}</text><text class="v-text" x="52" y="24" text-anchor="end" transform="rotate(-90 52 24)">${t("cap.attractiveness")}</text>
    </svg>`),
  partner: (id) => raw(`<svg viewBox="0 0 320 180" class="cap-visual" aria-hidden="true" focusable="false">
      <defs><clipPath id="jv-${id}"><circle cx="128" cy="88" r="62"/></clipPath></defs>
      <circle class="v-line" cx="128" cy="88" r="62"/><circle class="v-line" cx="192" cy="88" r="62"/>
      <circle class="v-accent-area" cx="192" cy="88" r="62" clip-path="url(#jv-${id})"/>
      <text class="v-text" x="96" y="92" text-anchor="middle">${t("cap.capital")}</text><text class="v-text" x="226" y="92" text-anchor="middle">${t("cap.capability")}</text>
      <text class="v-text v-text--accent" x="160" y="92" text-anchor="middle">${t("cap.venture")}</text>
    </svg>`),
  transform: () => raw(`<svg viewBox="0 0 320 180" class="cap-visual" aria-hidden="true" focusable="false">
      <rect class="v-box v-dash" x="16" y="24" width="44" height="28"/><rect class="v-box v-dash" x="70" y="62" width="44" height="28"/><rect class="v-box v-dash" x="24" y="100" width="44" height="28"/><rect class="v-box v-dash" x="78" y="132" width="44" height="28"/>
      <path class="v-line v-dash" d="M60 38h12M92 90v10M68 114h10"/>
      <path class="v-line" d="M136 90h22M150 84l8 6-8 6"/>
      <circle class="v-accent-fill" cx="246" cy="90" r="9"/><circle class="v-accent v-pulse" cx="246" cy="90" r="17"/>
      <rect class="v-box" x="176" y="22" width="44" height="28"/><rect class="v-box" x="272" y="22" width="40" height="28"/><rect class="v-box" x="176" y="130" width="44" height="28"/><rect class="v-box" x="272" y="130" width="40" height="28"/>
      <path class="v-line v-flow" d="M206 50L236 80M286 50L256 80M206 130L236 100M286 130L256 100"/>
    </svg>`),
  ai: () => raw(`<svg viewBox="0 0 320 180" class="cap-visual" aria-hidden="true" focusable="false">
      <path class="v-grid" d="M20 40H300M20 80H300M20 120H300M20 160H300"/>
      <path class="v-area" d="M20 150L60 140L100 146L140 118L180 112L220 80L260 66L300 34V160H20Z"/>
      <path class="v-line v-line--strong v-draw" d="M20 150L60 140L100 146L140 118L180 112L220 80L260 66L300 34"/>
      <circle class="v-accent v-pulse" cx="300" cy="34" r="12"/><circle class="v-accent-fill" cx="300" cy="34" r="5"/>
      <rect class="v-box v-box--fill" x="180" y="12" width="96" height="26" rx="2"/><text class="v-text" x="190" y="29">${t("cap.costToServe")}</text>
    </svg>`),
  build: () => raw(`<svg viewBox="0 0 320 180" class="cap-visual" aria-hidden="true" focusable="false">
      <rect class="v-box" x="30" y="14" width="260" height="152" rx="3"/><path class="v-line" d="M30 34H290"/>
      <circle class="v-dot v-dot--soft" cx="42" cy="24" r="3"/><circle class="v-dot v-dot--soft" cx="52" cy="24" r="3"/><circle class="v-dot v-dot--soft" cx="62" cy="24" r="3"/>
      <path class="v-line" d="M92 34V166"/><path class="v-grid" d="M44 52H78M44 66H74M44 80H70M44 94H76"/>
      <rect class="v-box v-box--fill" x="106" y="48" width="84" height="48"/><rect class="v-box v-box--fill" x="198" y="48" width="78" height="48"/>
      <path class="v-grid" d="M106 112H276M106 126H240M106 140H256"/>
      <rect class="v-accent-fill" x="214" y="146" width="62" height="12" rx="6"/>
    </svg>`),
};
export const capabilityVisual = (name, id = name) => VISUALS[name](id);

/* -------------------------------------------------------------- capability grid */

export const capabilityCard = (s, { level = "h3" } = {}) => html`
<article class="cap-card" data-anim="fade-up">
  <div class="cap-card__top">
    ${microLabel(`${s.index} — ${s.key}`, "color-white-50")}
    <a class="cap-card__corner" href="/${s.slug}/" tabindex="-1" aria-hidden="true">${icon("arrowUpRight")}</a>
  </div>
  <div class="cap-card__visual">${capabilityVisual(s.visual, `card-${s.slug}`)}</div>
  <div class="cap-card__body">
    ${heading(level, "h4", html`<a class="cap-card__link" href="/${s.slug}/">${s.name}</a>`)}
    <p class="body-md color-white-60">${s.summary}</p>
    <details class="disclosure">
      <summary class="button-sm"><span>${t("whatsIncluded")}</span><span class="disclosure__count color-white-40">${s.includes.length}</span>${icon("plus", "disclosure__icon")}</summary>
      <ul class="dot-list body-sm" role="list">${s.includes.map((x) => html`<li>${x}</li>`)}</ul>
    </details>
    ${arrowLink({ label: s.cardCta, href: `/${s.slug}/` })}
  </div>
</article>`;

export const capabilityGrid = (items) => html`<div class="cap-grid">${items.map((s) => capabilityCard(s))}</div>`;

/* -------------------------------------------------------------- tabs (generic) */

/**
 * Accessible tablist. Every panel is rendered server-side; without JS all panels
 * stay visible (CSS hides inactive ones only under html.js).
 */
export const tabs = ({ id, label, items, tabClass = "", listClass = "", panelClass = "", renderTab, renderPanel, className = "" }) => html`
<div class="tabs ${className}" data-tabs>
  <div class="tabs__list ${listClass}" role="tablist" aria-label="${label}">
    ${items.map((it, i) => html`<button ${attrs({ type: "button", role: "tab", class: `tabs__tab ${tabClass}`, id: `${id}-tab-${i}`, "aria-controls": `${id}-panel-${i}`, "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1" })}>${renderTab(it, i)}</button>`)}
  </div>
  <div class="tabs__panels">
    ${items.map((it, i) => html`<div ${attrs({ role: "tabpanel", class: `tabs__panel ${panelClass} ${i === 0 ? "is-active" : ""}`, id: `${id}-panel-${i}`, "aria-labelledby": `${id}-tab-${i}`, tabindex: "0" })}>${renderPanel(it, i)}</div>`)}
  </div>
</div>`;

/* ---------------------------------------------------- "What are you trying to achieve?" */

export const chain = (items, className = "") => html`<ol class="chain ${className}" role="list">${items.map((x, i) => html`<li class="chain__item"><span class="chain__pill body-sm">${x}</span>${i < items.length - 1 ? html`<span class="chain__plus" aria-hidden="true">+</span>` : ""}</li>`)}</ol>`;

export const needsSelector = (needs) => html`
<section class="section section--raised theme-light" data-theme="light" aria-labelledby="needs-title">
  <div class="container">
    ${sectionHead({ label: needs.label, title: needs.title, id: "needs-title" })}
    ${tabs({
      id: "need",
      label: needs.title,
      className: "needs",
      listClass: "needs__list",
      tabClass: "needs__tab",
      panelClass: "needs__panel",
      items: needs.items,
      renderTab: (n, i) => html`<span class="needs__num micro">${pad2(i + 1)}</span><span class="needs__label body-xl">${n.label}</span><span class="needs__text body-sm color-white-50">${n.text}</span>${icon("arrow", "needs__arrow")}`,
      renderPanel: (n) => html`
        <p class="micro color-white-50">${t("need.title")}</p>
        <p class="h4 needs__headline">${n.text}</p>
        ${chain(n.pathway)}
        <div class="needs__engagements">
          <p class="micro color-white-50">${t("need.engagement")}</p>
          <ul role="list">${n.engagements.map((slug) => {
            const p = packageBySlug(slug);
            return html`<li><a class="needs__engagement" href="/engagements/${p.slug}/"><span class="body-lg">${p.name}</span><span class="body-sm color-white-60">${p.short}</span>${icon("arrowUpRight", "needs__engagement-icon")}</a></li>`;
          })}</ul>
        </div>
        ${btnSecondary({ label: n.cta.label, href: contactHref(n.cta) })}`,
    })}
  </div>
</section>`;

/* ------------------------------------------------------------------ journey */

export const journey = (j, { theme = "dark" } = {}) => html`
<section class="section journey theme-${theme}" data-theme="${theme}" aria-labelledby="journey-title">
  <div class="container">
    ${splitHead({ label: j.label, title: j.title, text: j.text, id: "journey-title" })}
    <ol class="journey__track" role="list" data-journey>
      ${j.stages.map((s, i) => html`<li class="journey__stage" style="--i:${i}"><span class="journey__dot"></span><span class="micro color-white-40">${pad2(i + 1)}</span><span class="body-lg journey__name">${s}</span></li>`)}
    </ol>
    <p class="body-sm color-white-50 journey__note">${icon("checkCircle", "journey__note-icon")}${j.note}</p>
  </div>
</section>`;

/* -------------------------------------------------------------- engagements */

export const packageCard = (p, { level = "h3" } = {}) => html`
<article class="pkg-card" data-anim="fade-up">
  <p class="micro pkg-card__mode">${p.mode}</p>
  ${heading(level, "h4", html`<a class="pkg-card__link" href="/engagements/${p.slug}/">${p.name}</a>`)}
  <p class="body-md color-white-60 pkg-card__text">${p.short}</p>
  <p class="body-sm pkg-card__client"><span class="color-white-50">${t("idealClient")}</span>${p.idealClient}</p>
  <details class="disclosure">
    <summary class="button-sm"><span>${t("typicalDeliverables")}</span>${icon("plus", "disclosure__icon")}</summary>
    <p class="body-sm color-white-50 disclosure__note">${t("deliverablesNote")}</p>
    <ul class="dot-list body-sm" role="list">${p.deliverables.map((d) => html`<li>${d}</li>`)}</ul>
  </details>
  ${arrowLink({ label: p.cta.label, href: `/engagements/${p.slug}/` })}
</article>`;

export const packageGrid = (items) => html`<div class="pkg-grid">${items.map((p) => packageCard(p))}</div>`;

export const flagship = (p, { theme = "dark", level = "h2", label = t("flagship.label"), link = true } = {}) => html`
<section class="section flagship theme-${theme}" data-theme="${theme}" aria-labelledby="flagship-title">
  <div class="container">
    <div class="flagship__head">
      ${miniLabel(label)}
      ${heading(level, "h2", lines(p.headline), { id: "flagship-title", anim: "chars" })}
      <p class="body-lg color-white-60 flagship__lead" data-anim="fade-up">${p.lead}</p>
    </div>
    <ol class="flagship__chain" role="list">
      ${p.chain.map((c, i) => html`<li class="flagship__stage" data-anim="fade-up">
        <span class="micro color-white-40">${pad2(i + 1)}</span>
        <p class="h4">${c.name}</p>
        <ul class="body-sm color-white-60" role="list">${c.items.map((x) => html`<li>${x}</li>`)}</ul>
      </li>`)}
    </ol>
    <div class="actions">${btnPrimary({ label: p.cta.label, href: contactHref({ ...p.cta, topic: p.name }) })}${link ? btnOutline({ label: t("flagship.seeEngagement"), href: `/engagements/${p.slug}/` }) : ""}</div>
  </div>
</section>`;

export const relatedEngagements = (slugs, { title = t("related.title"), theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="related-title">
  <div class="container">
    ${splitHead({ label: t("related.label"), title, text: t("related.text"), action: btnOutline({ label: t("menu.allEngagements"), href: "/engagements/" }), id: "related-title" })}
    <div class="pkg-grid pkg-grid--3">${slugs.map((s) => packageCard(packageBySlug(s)))}</div>
  </div>
</section>`;

/* ----------------------------------------------------------------- markets */

const project = (lon, lat) => {
  const m = markets.map;
  return [((lon - m.lon0) / (m.lon1 - m.lon0)) * m.width, ((m.lat1 - lat) / (m.lat1 - m.lat0)) * m.height];
};

export const marketMap = () => {
  const m = markets.map;
  // routes name English cities; points keep their order across translations, so resolve by index
  const byName = Object.fromEntries(marketsBase.points.map((p, i) => [p.name, markets.points[i]]));
  const routes = markets.routes.map(([a, b], i) => {
    const [x1, y1] = project(byName[a].lon, byName[a].lat);
    const [x2, y2] = project(byName[b].lon, byName[b].lat);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const bend = Math.min(140, len * 0.22);
    // control point perpendicular to the chord, always bowing "upwards"
    let nx = -dy / len, ny = dx / len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return `<path class="map__route" style="--d:${(i * 0.35).toFixed(2)}s" d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + nx * bend).toFixed(1)} ${(my + ny * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
  });
  return html`
  <div class="map" data-map>
    <div class="map__canvas" style="aspect-ratio:${m.width} / ${m.height}">
      <img class="map__land" src="/assets/img/map.svg" alt="" width="${m.width}" height="${m.height}" loading="lazy" decoding="async">
      <svg class="map__routes" viewBox="0 0 ${m.width} ${m.height}" aria-hidden="true" focusable="false">${raw(routes.join(""))}</svg>
      ${markets.points.map((p) => {
        const [x, y] = project(p.lon, p.lat);
        return html`<span class="map__point ${p.hub ? "map__point--hub" : ""} ${p.minor ? "map__point--minor" : ""}" style="left:${((x / m.width) * 100).toFixed(2)}%;top:${((y / m.height) * 100).toFixed(2)}%">
          <span class="map__dot"></span><span class="map__label title-xs">${p.name}</span>
        </span>`;
      })}
    </div>
  </div>`;
};

export const marketAccess = ({ level = "h2" } = {}) => {
  const a = markets.access;
  return html`
<section class="section market-access theme-dark" data-theme="dark" aria-labelledby="access-title" id="gcc-map">
  <div class="container">
    <div class="market-access__head">
      ${miniLabel(a.label)}
      ${heading(level, "h2", lines(a.title), { id: "access-title", anim: "chars" })}
      <p class="body-lg color-white-60" data-anim="fade-up">${a.text}</p>
    </div>
  </div>
  ${marketMap()}
  <div class="container">
    <ul class="region-list" role="list">${a.regions.map((r) => html`<li class="button-sm">${r}</li>`)}</ul>
  </div>
</section>`;
};

export const saudiBlock = ({ level = "h2", id = "saudi-arabia" } = {}) => {
  const s = markets.saudi;
  return html`
<section class="section market-focus theme-light" data-theme="light" id="${id}" aria-labelledby="${id}-title">
  <div class="container market-focus__in">
    <figure class="market-focus__media" data-anim="fade-up">${img(s.image, { alt: s.imageAlt, className: "market-focus__img", sizes: "(max-width: 991px) 100vw, 45vw" })}</figure>
    <div class="market-focus__body">
      ${miniLabel(s.label)}
      ${heading(level, "h1-alt", s.title, { id: `${id}-title`, anim: "chars" })}
      <p class="body-xl color-white-60">${s.subtitle}</p>
      <div class="market-cols">
        ${s.columns.map((c) => html`<div class="market-cols__col" data-anim="fade-up">
          <p class="micro">${c.name}</p>
          <ul class="body-md color-white-60" role="list">${c.items.map((x) => html`<li>${x}</li>`)}</ul>
        </div>`)}
      </div>
      ${btnSecondary({ label: s.cta.label, href: s.cta.href })}
    </div>
  </div>
</section>`;
};

export const uzbekistanBlock = ({ level = "h2", id = "uzbekistan" } = {}) => {
  const u = markets.uzbekistan;
  return html`
<section class="section uzb theme-dark" data-theme="dark" id="${id}" aria-labelledby="${id}-title">
  <div class="uzb__bg" aria-hidden="true">${img(u.image, { alt: "", className: "uzb__bg-img", sizes: "60vw" })}</div>
  <div class="container uzb__in">
    <div class="uzb__body">
      ${miniLabel(u.label)}
      ${heading(level, "h1-alt", u.title, { id: `${id}-title`, anim: "chars" })}
      <p class="body-xl">${u.subtitle}</p>
      <p class="body-md color-white-60">${u.text}</p>
      <ul class="chips" role="list">${u.sectors.map((x) => html`<li class="chip body-sm">${x}</li>`)}</ul>
      ${btnPrimary({ label: u.cta.label, href: contactHref(u.cta) })}
    </div>
    <div class="bridge" aria-label="${u.bridge.join(" ↔ ")}" role="img">
      ${u.bridge.map((b, i) => html`<span class="bridge__node ${i === 1 ? "bridge__node--center" : ""}"><span class="bridge__dot"></span><span class="h4">${b}</span></span>${i < u.bridge.length - 1 ? html`<span class="bridge__link" aria-hidden="true"><span></span></span>` : ""}`)}
    </div>
  </div>
</section>`;
};

/* ---------------------------------------------------------------- opportunities */

export const opportunityCard = (o, { level = "h3" } = {}) => html`
<article class="opp-card" data-anim="fade-up">
  <div class="opp-card__top">
    <span class="tag">${t("illustrative")}</span>
    <span class="opp-card__status body-sm"><span class="status-dot"></span>${o.status}</span>
  </div>
  <p class="micro color-white-50">${o.country}</p>
  ${heading(level, "h4", html`<a class="opp-card__link" href="/opportunities/${o.slug}/">${o.sector}</a>`)}
  <p class="body-sm color-white-60 opp-card__summary">${o.summary}</p>
  <dl class="meta-list">
    ${opportunities.fields.filter((f) => f.key !== "status" && f.key !== "country").map((f) => html`<div class="meta-list__row"><dt class="body-sm color-white-50">${f.label}</dt><dd class="body-sm">${o[f.key]}</dd></div>`)}
  </dl>
  ${arrowLink({ label: t("viewOpportunity"), href: `/opportunities/${o.slug}/` })}
</article>`;

export const opportunityRail = ({ title = opportunities.intro.title, level = "h2", theme = "dark" } = {}) => html`
<section class="section opps theme-${theme}" data-theme="${theme}" aria-labelledby="opps-title">
  <div class="container">
    ${splitHead({ label: t("opps.label"), title, text: opportunities.intro.lead, action: btnOutline({ label: t("menu.allOpportunities"), href: "/opportunities/" }), level, id: "opps-title" })}
  </div>
  <div class="rail" data-rail>
    <div class="rail__track">${opportunities.items.map((o) => opportunityCard(o))}</div>
  </div>
  <div class="container"><p class="notice body-sm">${icon("lock", "notice__icon")}<span>${opportunities.intro.notice}</span></p></div>
</section>`;

/* ---------------------------------------------------------------- steps / timeline */

export const steps = ({ label, title, items, theme = "light", interactive = false, id = slugify(title).slice(0, 24), text }) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="${id}-title">
  <div class="container">
    ${splitHead({ label, title, text, id: `${id}-title` })}
    <ol class="timeline ${items.length > 6 ? "timeline--many" : ""}" role="list" ${interactive ? raw("data-timeline") : ""} style="--n:${items.length}">
      ${items.map((s, i) => html`<li class="timeline__step ${interactive && i === 0 ? "is-active" : ""}" data-anim="fade-up" ${interactive ? raw('tabindex="0"') : ""}>
        <span class="timeline__marker"><span class="timeline__dot"></span></span>
        <span class="micro color-white-40">${pad2(i + 1)}</span>
        <h3 class="h4 timeline__name">${s.name}</h3>
        <p class="body-sm color-white-60">${s.text}</p>
        ${s.detail ? html`<p class="body-sm timeline__detail">${s.detail}</p>` : ""}
      </li>`)}
    </ol>
  </div>
</section>`;

/* ---------------------------------------------------------------- mandates */

export const mandates = (m) => html`
<section class="section theme-light" data-theme="light" aria-labelledby="mandates-title">
  <div class="container">
    ${sectionHead({ label: m.label, title: m.title, text: m.text, id: "mandates-title" })}
    <ol class="mandates" role="list">
      ${m.items.map((x, i) => html`<li class="mandates__item" data-anim="fade-up"><span class="micro color-white-40">${pad2(i + 1)}</span><p class="body-xl">${x}</p></li>`)}
    </ol>
  </div>
</section>`;

/* ---------------------------------------------------------------- AI showcase */

export const aiShowcase = (ai, { theme = "dark", level = "h2" } = {}) => {
  const d = ai.dashboard;
  const max = Math.max(...d.bars);
  return html`
<section class="section ai theme-${theme}" data-theme="${theme}" aria-labelledby="ai-title">
  <div class="container">
    <div class="ai__grid">
      <div class="ai__intro">
        ${miniLabel(ai.label)}
        ${heading(level, "h2", lines(ai.title), { id: "ai-title", anim: "chars" })}
        <p class="body-lg color-white-60" data-anim="fade-up">${ai.text}</p>
        <ol class="ladder" role="list">
          ${ai.ladder.map((s, i) => html`<li class="ladder__step ${i === ai.ladder.length - 1 ? "ladder__step--top" : ""}" data-anim="fade-up">
            <span class="micro color-white-40">${pad2(i + 1)}</span>
            <span class="ladder__body"><span class="body-xl">${s.name}</span><span class="body-sm color-white-60">${s.text}</span></span>
          </li>`)}
        </ol>
      </div>
      <figure class="dash" data-anim="fade-up" aria-label="${d.title} — ${d.tag}">
        <div class="dash__bar"><span></span><span></span><span></span><p class="title-xs color-white-50">${d.tag}</p></div>
        <div class="dash__head"><p class="body-lg">${d.title}</p><p class="body-sm color-white-50">${d.subtitle}</p></div>
        <div class="dash__kpis">${d.kpis.map((k) => html`<div class="dash__kpi"><p class="body-sm color-white-50">${k.label}</p><p class="h3">${k.value}</p><p class="body-sm dash__delta">${k.delta}</p></div>`)}</div>
        <div class="dash__chart" aria-hidden="true">${d.bars.map((b, i) => html`<span class="dash__col ${i === d.bars.length - 1 ? "is-accent" : ""}" style="--h:${Math.round((b / max) * 100)}%"></span>`)}</div>
        <ul class="dash__agents" role="list">${d.agents.map((a) => html`<li><span class="dash__agent-name body-sm">${a.name}</span><span class="body-sm color-white-60">${a.task}</span><span class="dash__status dash__status--${slugify(a.status)} title-xs">${a.status}</span></li>`)}</ul>
        <figcaption class="sr-only">${t("dash.caption")}</figcaption>
      </figure>
    </div>
    ${tabs({
      id: "usecase",
      label: t("usecases.label"),
      className: "usecases",
      listClass: "usecases__list",
      tabClass: "chip chip--button body-sm",
      panelClass: "usecases__panel",
      items: ai.useCases,
      renderTab: (u) => u.name,
      renderPanel: (u) => html`<p class="micro color-white-50">${u.name}</p><p class="h4">${u.text}</p>`,
    })}
    ${ai.cta ? html`<div class="actions">${btnPrimary({ label: ai.cta.label, href: ai.cta.href })}</div>` : ""}
  </div>
</section>`;
};

/* ---------------------------------------------------------------- before / after */

export const beforeAfter = (b, { theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="ba-${slugify(b.title).slice(0, 16)}">
  <div class="container">
    ${splitHead({ label: b.label, title: b.title, id: `ba-${slugify(b.title).slice(0, 16)}` })}
    <div class="ba" data-ba>
      <div class="ba__toggle" role="group" aria-label="${t("ba.compare")}">
        <button type="button" class="ba__btn button-sm" aria-pressed="false" data-ba-show="before">${t("ba.before")}</button>
        <button type="button" class="ba__btn button-sm" aria-pressed="true" data-ba-show="after">${t("ba.after")}</button>
      </div>
      <div class="ba__cols">
        <div class="ba__col ba__col--before">
          <p class="micro">${t("ba.before")}</p>
          <ul role="list">${b.before.map((x) => html`<li class="body-xl">${icon("minus", "ba__icon")}${x}</li>`)}</ul>
        </div>
        <div class="ba__arrow" aria-hidden="true">${icon("arrow")}</div>
        <div class="ba__col ba__col--after">
          <p class="micro">${t("ba.after")}</p>
          <ul role="list">${b.after.map((x) => html`<li class="body-xl">${icon("check", "ba__icon")}${x}</li>`)}</ul>
        </div>
      </div>
      ${b.cta ? html`<div class="actions">${btnSecondary({ label: b.cta.label, href: contactHref(b.cta) })}</div>` : ""}
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------- audience / pillars */

export const cellGrid = (items, { cols = 4, level = "h3", numbered = false } = {}) => html`
<div class="cells cells--${cols}">
  ${items.map((it, i) => html`<div class="cell" data-anim="fade-up">
    ${numbered ? html`<span class="micro color-white-40">${pad2(i + 1)}</span>` : ""}
    ${heading(level, "h4 cell__title", it.title ?? it.name)}
    <p class="body-md color-white-60">${it.text}</p>
  </div>`)}
</div>`;

export const audience = (a, { theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="audience-title">
  <div class="container">
    ${sectionHead({ label: a.label, title: a.title ?? t("audience.title"), id: "audience-title" })}
    ${cellGrid(a.items, { cols: 4 })}
  </div>
</section>`;

export const pillars = (b, { theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="p-${slugify(b.title).slice(0, 20)}">
  <div class="container">
    ${sectionHead({ label: b.label, title: b.title, id: `p-${slugify(b.title).slice(0, 20)}` })}
    ${cellGrid(b.items, { cols: 4, numbered: true })}
  </div>
</section>`;

/* ---------------------------------------------------------------- orbit diagram (network / ecosystem) */

export const orbit = ({ center, nodes, className = "" }) => {
  const pts = nodes.map((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { n, x: 50 + 40 * Math.cos(a), y: 50 + 38 * Math.sin(a), i };
  });
  return html`
  <div class="orbit ${className}" role="img" aria-label="${t("orbit.connected", { center, nodes: nodes.join(", ") })}">
    <svg class="orbit__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <ellipse class="orbit__ring" cx="50" cy="50" rx="40" ry="38"/>
      <ellipse class="orbit__ring orbit__ring--inner" cx="50" cy="50" rx="22" ry="21"/>
      ${raw(pts.map((p) => `<line class="orbit__spoke" style="--d:${(p.i * 0.4).toFixed(1)}s" x1="50" y1="50" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}"/>`).join(""))}
    </svg>
    <span class="orbit__center"><img src="/assets/img/silk-road-mark-96.webp" alt="" width="101" height="96"><span class="button-sm">${center}</span></span>
    ${pts.map((p) => html`<span class="orbit__node button-sm" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%;--d:${(p.i * 0.4).toFixed(1)}s">${p.n}</span>`)}
  </div>`;
};

export const network = (n, { theme = "dark", id = "network" } = {}) => html`
<section class="section network theme-${theme}" data-theme="${theme}" id="${id}" aria-labelledby="${id}-title">
  <div class="container network__in">
    <div class="network__text">
      ${miniLabel(n.label)}
      ${heading("h2", "h2", lines(n.title), { id: `${id}-title`, anim: "chars" })}
      <p class="body-lg color-white-60" data-anim="fade-up">${n.text}</p>
    </div>
    ${orbit({ center: n.center ?? "Silk Road Capital", nodes: n.nodes ?? n.categories })}
  </div>
</section>`;

/* ---------------------------------------------------------------- statement / discretion */

export const statement = (text, { theme = "light" } = {}) => html`
<section class="section section--tight theme-${theme}" data-theme="${theme}">
  <div class="container statement">
    ${icon("star8", "statement__mark")}
    <p class="statement__text" data-anim="lines">${text}</p>
  </div>
</section>`;

export const discretion = (d, { theme = "light" } = {}) => html`
<section class="section discretion theme-${theme}" data-theme="${theme}" aria-labelledby="discretion-title">
  <div class="discretion__pattern" aria-hidden="true" style="background-image:url('${imgUrl("preloader_bg.webp")}')"></div>
  <div class="container discretion__in">
    ${icon("lock", "discretion__icon")}
    ${miniLabel(d.label)}
    ${heading("h2", "h2", d.title, { id: "discretion-title", anim: "chars" })}
    <p class="body-xl color-white-60" data-anim="fade-up">${d.text}</p>
  </div>
</section>`;

/* ---------------------------------------------------------------- insights */

export const readingTime = (a) => Math.max(2, Math.round(a.body.join(" ").split(/\s+/).length / 200));

export const insightCard = (a, { level = "h3" } = {}) => html`
<article class="insight-card" data-anim="fade-up" data-category="${a.tags.join("|")}">
  <p class="insight-card__meta micro"><span>${a.category}</span><span class="color-white-40">${t("ins.minRead", { n: readingTime(a) })}</span></p>
  ${heading(level, "h4", html`<a class="insight-card__link" href="/insights/${a.slug}/">${a.title}</a>`)}
  <p class="body-sm color-white-60">${a.summary}</p>
  <p class="insight-card__foot body-sm color-white-50"><time datetime="${a.date}">${formatDate(a.date)}</time>${icon("arrowUpRight", "insight-card__icon")}</p>
</article>`;

export const insightsGrid = (items) => html`<div class="insight-grid">${items.map((a) => insightCard(a))}</div>`;

/* ---------------------------------------------------------------- final CTA */

export const ctaSection = (f) => mCta({
  title: f.title,
  text: f.text,
  primary: f.primary,
  secondary: f.secondary ? { label: f.secondary.label, href: f.secondary.href } : null,
});

/* ---------------------------------------------------------------- products catalogue */

export const productCatalogue = ({ theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" id="catalogue" aria-labelledby="catalogue-title">
  <div class="container">
    ${splitHead({ label: products.label, title: products.title, text: products.lead, id: "catalogue-title" })}
    ${tabs({
      id: "catalogue",
      label: t("catalogue.label"),
      className: "catalogue",
      listClass: "catalogue__list",
      tabClass: "pill-tab button-sm",
      panelClass: "catalogue__panel",
      items: products.categories,
      renderTab: (c) => html`${c.name}<span class="pill-tab__count">${c.products.length}</span>`,
      renderPanel: (c) => html`<div class="product-grid">${c.products.map((p) => html`
        <article class="product-card">
          <h3 class="h4">${p.name}</h3>
          <p class="body-md color-white-60">${p.text}</p>
          <dl class="product-card__meta">
            <div><dt class="micro color-white-50">${t("catalogue.for")}</dt><dd class="body-sm">${p.for}</dd></div>
            <div><dt class="micro color-white-50">${t("catalogue.capabilities")}</dt><dd><ul class="dot-list body-sm" role="list">${p.capabilities.map((x) => html`<li>${x}</li>`)}</ul></dd></div>
            <div><dt class="micro color-white-50">${t("catalogue.deployment")}</dt><dd class="body-sm">${p.deployment}</dd></div>
          </dl>
        </article>`)}</div>`,
    })}
    <p class="body-sm color-white-50 catalogue__note">${products.deploymentNote}</p>
    <div class="actions">${btnSecondary({ label: products.cta.label, href: contactHref(products.cta) })}</div>
  </div>
</section>`;

/* ---------------------------------------------------------------- JV models */

export const jvModels = (b, { theme = "dark" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="models-title">
  <div class="container">
    ${sectionHead({ label: b.label, title: b.title, id: "models-title" })}
    <ul class="models" role="list">
      ${b.items.map((m) => html`<li class="models__item" data-anim="fade-up">
        <p class="models__pair h4"><span>${m.a}</span><span class="models__plus" aria-hidden="true">+</span><span>${m.b}</span></p>
        <p class="body-md color-white-60">${m.text}</p>
      </li>`)}
    </ul>
  </div>
</section>`;

/* ---------------------------------------------------------------- engagement levels / commercial / solutions */

export const levels = (ph, { theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="levels-title">
  <div class="container">
    ${sectionHead({ label: ph.label, title: ph.title, id: "levels-title" })}
    <ol class="levels" role="list">
      ${ph.levels.map((l, i) => html`<li class="levels__item" data-anim="fade-up"><span class="micro color-white-40">${pad2(i + 1)}</span><h3 class="h3">${l.name}</h3><p class="body-md color-white-60">“${l.quote}”</p></li>`)}
    </ol>
    <ol class="progression" role="list" aria-label="${t("progression")}">
      ${ph.progression.map((p, i) => html`<li class="progression__item button-sm">${p}${i < ph.progression.length - 1 ? icon("arrow", "progression__arrow") : ""}</li>`)}
    </ol>
  </div>
</section>`;

export const commercialModels = (c, { theme = "dark", id = "commercial" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" id="${id}" aria-labelledby="${id}-title">
  <div class="container">
    ${splitHead({ label: c.label, title: c.title, text: c.lead, action: btnPrimary({ label: c.cta.label, href: contactHref(c.cta) }), id: `${id}-title` })}
    ${cellGrid(c.models, { cols: 4, numbered: true })}
  </div>
</section>`;

export const solutions = (s, { theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="solutions-title">
  <div class="container">
    ${sectionHead({ label: s.label, title: s.title, id: "solutions-title" })}
    <div class="solutions">
      ${s.items.map((it) => html`<article class="solutions__row" data-anim="fade-up">
        <div class="solutions__says"><p class="micro color-white-50">${t("solutions.says")}</p><h3 class="h4">“${it.says}”</h3></div>
        <div class="solutions__chain"><p class="micro color-white-50">${t("solutions.assemble")}</p>${chain(it.chain)}${arrowLink({ label: it.cta.label, href: it.cta.href })}</div>
      </article>`)}
    </div>
  </div>
</section>`;

export const packageSelector = (sel, { theme = "dark" } = {}) => {
  const pk = Object.fromEntries(engagements.packages.map((p) => [p.slug, { name: p.name, short: p.short, interest: p.cta.interest }]));
  return html`
<section class="section selector theme-${theme}" data-theme="${theme}" id="selector" aria-labelledby="selector-title">
  <div class="container">
    ${sectionHead({ label: sel.label, title: sel.title, id: "selector-title" })}
    <form class="selector__form" data-selector novalidate>
      ${sel.questions.map((q, qi) => html`<fieldset class="selector__q">
        <legend class="selector__legend"><span class="micro color-white-40">${pad2(qi + 1)}</span><span class="h4">${q.title}</span></legend>
        <div class="selector__opts">
          ${q.options.map((o) => html`<label class="opt"><input type="radio" name="${q.key}" value="${o.value}" ${o.adds ? raw(`data-adds="${o.adds}"`) : ""} ${o.also ? raw(`data-also="${o.also}"`) : ""} data-label="${o.label}"><span class="opt__pill body-sm">${o.label}</span></label>`)}
        </div>
      </fieldset>`)}
      <div class="selector__result" aria-live="polite" data-selector-result>
        <p class="micro color-white-50">${t("selector.recommended")}</p>
        <p class="h3 selector__title" data-selector-title>${t("selector.answer")}</p>
        <ul class="selector__packages" role="list" data-selector-packages></ul>
        <p class="body-sm color-white-60">${sel.scopeNote}</p>
        <a class="btn-primary is-disabled" href="/contact/" data-selector-cta aria-disabled="true"><span class="button-sm">${sel.cta}</span><span class="btn-icon">${icon("spark")}</span></a>
      </div>
    </form>
    <script type="application/json" data-selector-packages-data>${raw(JSON.stringify(pk).replace(/</g, "\\u003c"))}</script>
  </div>
</section>`;
};

/* ---------------------------------------------------------------- service groups (engagement detail) */

export const groups = (gs, { label = t("groups.label"), title = t("groups.title"), theme = "light" } = {}) => html`
<section class="section theme-${theme}" data-theme="${theme}" aria-labelledby="scope-title">
  <div class="container">
    ${sectionHead({ label, title, id: "scope-title" })}
    <div class="groups groups--${Math.min(gs.length, 4)}">
      ${gs.map((g, i) => html`<div class="groups__col" data-anim="fade-up">
        <span class="micro color-white-40">${pad2(i + 1)}</span>
        <h3 class="h4">${g.title}</h3>
        <ul class="dot-list body-md color-white-60" role="list">${g.items.map((x) => html`<li>${x}</li>`)}</ul>
      </div>`)}
    </div>
  </div>
</section>`;

export { num, slugify };
