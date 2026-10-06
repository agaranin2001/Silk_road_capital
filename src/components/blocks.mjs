import { html, attrs, raw } from "../lib/html.mjs";
import { icon } from "./icons.mjs";
import { img, lines, contactHref, pad2, flag } from "./ui.mjs";
import { packageBySlug, opportunities, markets, images, t } from "../content/index.mjs";

/*
 * Page blocks modelled on the mollie.com component set (layout, spacing, radii,
 * type scale and interaction patterns); fonts and colours are Silk Road's own.
 *
 *   mHero          eyebrow + display title | lead + pill buttons, rounded photo with floating status chips
 *   mMarquee       scrolling strip (Mollie's logo bar)
 *   mLinkGrid      bordered 5×2 grid of icon links (Mollie's product index)
 *   mPair          two beige feature cards with eyebrow, title, orange link and a visual
 *   mWide          full-width beige card: centred title, fanned cards, hairline list, link
 *   mTabsSplit     left: title + auto-advancing accordion, right: dark panel with UI card
 *   mStories       centred title + snap carousel of photo cards with caption (customer stories)
 *   mGlow          dark panel with radial glow, centred title and a glass card
 *   mSupport       round photo stack, centred title, three bordered columns
 *   mCta           beige CTA card with a bordered side column
 *   mTiles         three photo tiles with caption and round arrow
 */

export const btn = ({ label, href, variant = "dark", className = "" }) =>
  html`<a class="m-btn m-btn--${variant} ${className}" href="${href}">${label}</a>`;

export const mLink = ({ label, href }) =>
  html`<a class="m-link" href="${href}">${label}${icon("chevronRight", "m-link__icon")}</a>`;

export const eyebrow = (text, className = "") => html`<p class="m-eyebrow ${className}">${text}</p>`;

/** Number that counts up when its mock-up comes into view ("4 min" → 4 + " min"). */
const count = (value) => {
  const m = /^([\d.]+)(.*)$/.exec(String(value));
  return m ? html`<b data-count="${m[1]}" data-suffix="${m[2]}">${value}</b>` : html`<b>${value}</b>`;
};

/* -------------------------------------------------------------------- hero */

export const mHero = ({ eyebrow: eb, title, text, primary, secondary, image, imageAlt, cases = [], tag = t("illustrative"), level = "h1", crumbs = [] }) => html`
<section class="m-hero" aria-labelledby="hero-title">
  <div class="m-wrap">
    ${crumbs.length ? html`<nav class="m-crumbs" aria-label="${t("aria.breadcrumbs")}">${crumbs.map((c) => c.href ? html`<a href="${c.href}">${c.label}</a>` : html`<span aria-current="page">${c.label}</span>`)}</nav>` : ""}
    <div class="m-hero__head">
      <div class="m-hero__title-wrap">
        ${eyebrow(eb)}
        <${raw(level)} class="m-display" id="hero-title" data-anim="intro-title">${Array.isArray(title) ? title.map((t) => html`<span class="m-display__line">${t}</span>`) : lines(title)}</${raw(level)}>
      </div>
      <div class="m-hero__aside" data-anim="intro-text">
        ${text ? (Array.isArray(text) ? text : [text]).map((t) => html`<p class="m-hero__text">${t}</p>`) : ""}
        ${primary || secondary ? html`<div class="m-btns">${primary ? btn({ ...primary, variant: "dark" }) : ""}${secondary ? btn({ ...secondary, variant: "light" }) : ""}</div>` : ""}
      </div>
    </div>
  </div>
  ${cases.length ? html`<div class="m-hero__media" data-anim="intro-media" data-hero-cases>
    ${cases.map((c, n) => html`<div ${attrs({ class: `m-case ${n === 0 ? "is-active" : ""}`, "aria-hidden": n === 0 ? undefined : "true", "data-case": "" })}>
      ${img(c.image, { alt: c.imageAlt, className: "m-hero__img", eager: n === 0, sizes: "(max-width: 809px) 100vw, 1440px" })}
      <ul class="m-chips" role="list" data-chips>${c.chips.map((t, i) => html`<li class="m-chip" style="--i:${i}">${icon("checkCircle", "m-chip__icon")}<span>${t}</span></li>`)}</ul>
      <div class="m-hero__card">
        <div class="m-ui__top"><span class="m-ui__title"><span class="m-ui__icon">${icon(c.icon)}</span>${c.service}</span><span class="m-ui__tag">${tag}</span></div>
        <ol class="m-steps" role="list">${c.steps.map((st, j) => html`<li class="m-steps__item is-${st.state}" style="--i:${j}"><span class="m-steps__dot">${st.state === "done" ? icon("check") : ""}</span>${st.name}<span class="m-steps__state">${t(`state.${st.state}`)}</span></li>`)}</ol>
        <a class="m-hero__card-link" href="${c.href}" ${n === 0 ? "" : raw('tabindex="-1"')}>${t("explore", { name: c.service })}${icon("chevronRight")}</a>
      </div>
    </div>`)}
    ${cases.length > 1 ? html`<div class="m-case-dots" aria-hidden="true">${cases.map((c, n) => html`<span class="m-case-dot ${n === 0 ? "is-active" : ""}" title="${c.service}">${icon(c.icon)}</span>`)}</div>` : ""}
  </div>` : image ? html`<div class="m-hero__media" data-anim="intro-media">
    ${img(image, { alt: imageAlt, className: "m-hero__img", eager: true, sizes: "(max-width: 809px) 100vw, 1440px" })}
  </div>` : ""}
</section>`;

/* -------------------------------------------------------------------- marquee */

export const mMarquee = (items, { label = t("aria.markets") } = {}) => html`
<nav class="m-marquee" aria-label="${label}">
  <div class="m-marquee__track">
    ${[0, 1].map((copy) => items.map((t) => html`<a ${attrs({ class: "m-marquee__item", href: t.href, "aria-hidden": copy ? "true" : undefined, tabindex: copy ? "-1" : undefined })}>${flag(t.flag, "m-marquee__flag")}${t.name}</a>`))}
  </div>
</nav>`;

/* -------------------------------------------------------------------- link grid */

export const mLinkGrid = (links, { label = t("aria.capabilities") } = {}) => html`
<nav class="m-wrap m-section m-section--tight" aria-label="${label}" id="capabilities">
  <ul class="m-linkgrid" role="list">${links.map((l) => html`<li><a class="m-linkgrid__item" href="${l.href}">${icon(l.icon, "m-linkgrid__icon")}<span>${l.label}</span></a></li>`)}</ul>
</nav>`;

/* -------------------------------------------------------------------- feature visuals (HTML UI mock-ups) */

const VIS = {
  deals: () => html`<div class="m-vis m-vis--deals" aria-hidden="true">
    ${opportunities.items.slice(0, 4).map((o, i) => html`<div class="m-ui m-deal" style="--i:${i}">
      <span class="m-deal__thumb">${img(o.image, { alt: "", sizes: "80px" })}</span>
      <span class="m-deal__body"><b>${o.sector}</b><small>${o.country} · ${o.type}</small></span>
      <span class="m-ui__pill">${o.status}</span>
    </div>`)}
  </div>`,
  market: () => html`<div class="m-vis m-vis--market" aria-hidden="true">
    <div class="m-ui m-ui--panel">
      <div class="m-ui__top"><span class="m-ui__title">${t("vis.market.title")}</span><span class="m-ui__tag">${t("illustrative")}</span></div>
      ${[[t("vis.market.attractiveness"), 86], [t("vis.market.partners"), 72], [t("vis.market.regulatory"), 64], [t("vis.market.competition"), 48]].map(([k, v], i) => html`<div class="m-bar" style="--i:${i}"><span>${k}</span><span class="m-bar__track"><span class="m-bar__fill" style="--v:${v}%"></span></span>${count(v)}</div>`)}
      <div class="m-ui__foot"><span>${t("vis.market.recommendation")}</span><b>${t("vis.market.result")}</b></div>
    </div>
  </div>`,
  systems: () => html`<div class="m-vis m-vis--systems" aria-hidden="true">
    <div class="m-ui m-ui--panel">
      <div class="m-ui__top"><span class="m-ui__title">${t("vis.systems.title")}</span><span class="m-ui__tag">${t("illustrative")}</span></div>
      <div class="m-flow">${["CRM", "ERP", t("vis.systems.portal"), t("vis.systems.finance"), t("vis.systems.data")].map((n, i) => html`<span class="m-flow__node" style="--i:${i}">${n}</span>`)}<span class="m-flow__hub">${icon("spark")}</span></div>
      <div class="m-ui__foot"><span>${t("vis.systems.removed")}</span><b>${t("vis.systems.result")}</b></div>
    </div>
  </div>`,
  product: () => html`<div class="m-vis m-vis--product" aria-hidden="true">
    <div class="m-ui m-app">
      <div class="m-app__bar"><span></span><span></span><span></span></div>
      <div class="m-app__body">
        <div class="m-app__side">${[t("vis.app.overview"), t("vis.app.partners"), t("vis.app.orders"), t("vis.app.reports")].map((n, i) => html`<span class="${i === 0 ? "is-on" : ""}">${n}</span>`)}</div>
        <div class="m-app__main">
          <div class="m-app__kpis"><span><small>${t("vis.app.activePartners")}</small>${count(24)}</span><span><small>${t("vis.app.ordersWeek")}</small>${count(318)}</span></div>
          <div class="m-app__chart">${[30, 52, 41, 66, 58, 74, 88].map((h, i) => html`<i style="--h:${h}%;--i:${i}"></i>`)}</div>
          <span class="m-app__cta">${t("vis.app.launch")}</span>
        </div>
      </div>
    </div>
  </div>`,
};

export const mPair = (cards) => html`
<div class="m-wrap m-pair">
  ${cards.map((c) => html`<article class="m-card m-feature" data-anim="fade-up">
    <div class="m-feature__text">
      ${eyebrow(c.eyebrow)}
      <h2 class="m-h3">${lines(c.title)}</h2>
      ${mLink(c.link)}
    </div>
    ${VIS[c.visual]()}
  </article>`)}
</div>`;

/* -------------------------------------------------------------------- wide card */

export const mWide = ({ eyebrow: eb, title, fan, lines: items, link }, { id = "wide" } = {}) => html`
<section class="m-wrap m-section--flush" aria-labelledby="${id}-title">
  <div class="m-card m-wide">
    ${eyebrow(eb)}
    <h2 class="m-h2" id="${id}-title" data-anim="chars">${lines(title)}</h2>
    <div class="m-fan" aria-hidden="true">${fan.map((f, i) => html`<span class="m-fan__card m-fan__card--${i}" style="--i:${i - (fan.length - 1) / 2};--n:${i}"><span class="m-fan__mark">${icon("star8")}</span><span class="m-fan__label">${f}</span><span class="m-fan__brand">Silk Road Capital</span></span>`)}</div>
    <ul class="m-hairlist" role="list">${items.map((t) => html`<li>${t}</li>`)}</ul>
    ${mLink(link)}
  </div>
</section>`;

/* -------------------------------------------------------------------- tabs split */

/** Auto-advancing accordion (left) driving a dark panel with UI cards (right). */
export const mTabsSplit = ({ id, eyebrow: eb, title, text, link, items, renderPanel }) => html`
<section class="m-wrap m-section m-split" aria-labelledby="${id}-title" data-autotabs>
  <div class="m-split__left">
    ${eyebrow(eb)}
    <h2 class="m-h2s" id="${id}-title" data-anim="chars">${lines(title)}</h2>
    ${text ? html`<p class="m-lead">${text}</p>` : ""}
    <div class="m-acc" role="tablist" aria-label="${title.replace(/\n/g, " ")}" aria-orientation="vertical">
      ${items.map((it, i) => html`<button ${attrs({ type: "button", role: "tab", class: "m-acc__item", id: `${id}-tab-${i}`, "aria-controls": `${id}-panel-${i}`, "aria-selected": i === 0 ? "true" : "false", tabindex: i === 0 ? "0" : "-1" })}>
        <span class="m-acc__title">${it.title}${it.badge ? html`<span class="m-badge">${it.badge}</span>` : ""}</span>
        <span class="m-acc__text">${it.text}</span>
        <span class="m-acc__bar"><span></span></span>
      </button>`)}
    </div>
    ${link ? mLink(link) : ""}
  </div>
  <div class="m-split__panel">
    ${items.map((it, i) => html`<div ${attrs({ role: "tabpanel", class: `m-split__view ${i === 0 ? "is-active" : ""}`, id: `${id}-panel-${i}`, "aria-labelledby": `${id}-tab-${i}`, tabindex: "0" })}>${renderPanel(it, i)}</div>`)}
  </div>
</section>`;

// Pathway card with an illustrative photo beside it (decorative, hidden on phones).
export const needsPanel = (n) => html`<div class="m-need-stage">
${needsCard(n)}
${n.image ? html`<figure class="m-need__photo" aria-hidden="true">${img(n.image, { alt: "", sizes: "(max-width: 1199px) 40vw, 360px" })}<figcaption class="m-ui__tag">${t("illustrative")}</figcaption></figure>` : ""}
</div>`;

const needsCard = (n) => html`<div class="m-ui m-ui--panel m-need">
  <div class="m-ui__top"><span class="m-ui__title">${t("need.title")}</span><span class="m-ui__tag">${t(`need.${n.key}`)}</span></div>
  <ol class="m-chain" role="list">${n.pathway.map((p, i) => html`<li style="--i:${i}"><span class="m-chain__n">${pad2(i + 1)}</span>${p}</li>`)}</ol>
  <div class="m-need__eng">
    <p class="m-eyebrow">${t("need.engagement")}</p>
    ${n.engagements.map((s, i) => { const p = packageBySlug(s); return html`<a class="m-need__pkg" style="--i:${i + n.pathway.length}" href="/engagements/${p.slug}/"><b>${p.name}</b><small>${p.short}</small>${icon("chevronRight", "m-need__chev")}</a>`; })}
  </div>
  ${btn({ label: n.cta.label, href: contactHref(n.cta), className: "m-btn--block" })}
</div>`;

export const aiPanel = (stage, i, ai) => {
  const d = ai.dashboard;
  const max = Math.max(...d.bars);
  return html`<div class="m-ui m-ui--panel m-dash">
    <div class="m-ui__top"><span class="m-ui__title">${d.title}</span><span class="m-ui__tag">${d.tag}</span></div>
    <p class="m-dash__stage"><span>${t("ai.stage", { n: pad2(i + 1) })}</span>${stage.title}</p>
    <div class="m-dash__kpis">${d.kpis.map((k, j) => html`<div style="--i:${j}"><small>${k.label}</small>${count(k.value)}<em>${k.delta}</em></div>`)}</div>
    <div class="m-dash__chart">${d.bars.map((b, j) => html`<i class="${j <= i + 3 ? "is-on" : ""}" style="--h:${Math.round((b / max) * 100)}%;--i:${j}"></i>`)}</div>
    <ul class="m-dash__agents" role="list">${d.agents.map((a, j) => html`<li style="--i:${j + 3}"><b>${a.name}</b><span>${a.task}</span><em class="${j <= i ? "is-live" : ""}">${j <= i ? a.status : t("ai.planned")}</em></li>`)}</ul>
  </div>`;
};

/* -------------------------------------------------------------------- stories carousel */

// Cards: { title, text, meta, image, href }. Defaults to the illustrative opportunities.
const opportunityStory = (o) => ({ title: o.sector, text: o.summary, meta: `${o.country} · ${o.type} · ${o.status}`, image: o.image, href: `/opportunities/${o.slug}/`, quote: true });

export const mStories = ({ eyebrow: eb, title, note, items }) => html`
<section class="m-section m-stories" aria-labelledby="stories-title">
  <div class="m-wrap m-center">
    <p class="m-pill-eyebrow">${eb}</p>
    <h2 class="m-h2" id="stories-title" data-anim="chars">${lines(title)}</h2>
  </div>
  <div class="m-carousel" data-carousel>
    <div class="m-carousel__track" data-lenis-prevent-horizontal>
      ${(items ?? opportunities.items.map(opportunityStory)).map((o) => html`<article class="m-story">
        <a class="m-story__media" href="${o.href}" tabindex="-1" aria-hidden="true">${img(o.image, { alt: "", sizes: "(max-width: 809px) 85vw, 650px" })}${o.quote ? html`<span class="m-story__tag">${t("illustrative")}</span>` : ""}</a>
        <p class="m-story__brand"><a href="${o.href}">${o.title}</a></p>
        <p class="${o.quote ? "m-story__quote" : "m-story__quote m-story__quote--plain"}">${o.text}</p>
        <p class="m-story__meta">${o.meta}</p>
      </article>`)}
    </div>
    <div class="m-carousel__nav">
      <button type="button" class="m-round" data-carousel-prev aria-label="${t("aria.previous")}">${icon("chevronLeft")}</button>
      <button type="button" class="m-round" data-carousel-next aria-label="${t("aria.next")}">${icon("chevronRight")}</button>
    </div>
  </div>
  ${note ? html`<div class="m-wrap"><p class="m-note">${icon("lock", "m-note__icon")}<span>${note}</span></p></div>` : ""}
</section>`;

/* -------------------------------------------------------------------- glow panel */

export const mGlow = ({ title, text, card }, { id = "glow" } = {}) => html`
<section class="m-wrap m-section" aria-labelledby="${id}-title">
  <div class="m-glow">
    <div class="m-glow__orb" aria-hidden="true"></div>
    <div class="m-glow__in">
      <h2 class="m-h2" id="${id}-title" data-anim="chars">${lines(title)}</h2>
      <p class="m-glow__text">${text}</p>
      ${card ? html`<a class="m-glass" href="${card.link.href}">
        <span class="m-glass__body"><b>${card.title}</b><span>${card.text}</span></span>
        <span class="m-glass__icon">${icon("lock")}</span>
      </a>` : ""}
    </div>
  </div>
</section>`;

/* -------------------------------------------------------------------- support */

/* How-to-start pipeline illustrations (240×180 SVG, animated in main.css under .m-pipe). */
const PIPE_ART = {
  outline: `<ellipse class="a-shadow" cx="120" cy="158" rx="66" ry="7"/>
    <rect class="a-paper" x="72" y="26" width="96" height="124" rx="8"/>
    <rect class="a-ink" x="84" y="40" width="42" height="8" rx="4"/>
    ${[72, 58, 66, 44].map((w, i) => `<rect class="a-soft a-type" style="--i:${i}" x="84" y="${62 + i * 14}" width="${w}" height="6" rx="3"/>`).join("")}
    <rect class="a-ink a-blink" x="84" y="122" width="2.5" height="14" rx="1"/>
    <circle class="s-ink a-ping" cx="164" cy="40" r="18"/>
    <circle class="a-ink" cx="164" cy="40" r="18"/>
    <rect class="a-accent" x="156" y="40" width="16" height="11" rx="2.5"/>
    <path class="s-accent" d="M159.5 40v-3.5a4.5 4.5 0 0 1 9 0V40"/>`,
  call: `<rect class="a-ink-soft" x="36" y="138" width="168" height="10" rx="5"/>
    <circle class="a-ink" cx="70" cy="80" r="15"/><rect class="a-ink" x="49" y="100" width="42" height="40" rx="20"/>
    <circle class="a-ink" cx="170" cy="80" r="15"/><rect class="a-ink" x="149" y="100" width="42" height="40" rx="20"/>
    <g class="a-bubble a-bubble--1"><rect class="a-paper" x="40" y="26" width="64" height="30" rx="12"/><circle class="a-ink" cx="60" cy="41" r="3"/><circle class="a-ink" cx="72" cy="41" r="3"/><circle class="a-ink" cx="84" cy="41" r="3"/></g>
    <g class="a-bubble a-bubble--2"><rect class="a-accent" x="136" y="30" width="64" height="30" rx="12"/><rect class="a-ink" x="148" y="40" width="40" height="4" rx="2"/><rect class="a-ink" x="148" y="48" width="26" height="4" rx="2"/></g>
    ${[0, 1, 2, 3, 4].map((i) => `<rect class="a-ink a-wave" style="--i:${i}" x="${108 + i * 6}" y="106" width="3.5" height="24" rx="1.75"/>`).join("")}`,
  scope: `<rect class="a-paper-dim" x="92" y="32" width="92" height="114" rx="8" transform="rotate(9 138 89)"/>
    <rect class="a-paper-mid" x="66" y="34" width="92" height="114" rx="8" transform="rotate(-7 112 91)"/>
    <rect class="a-paper" x="74" y="28" width="96" height="124" rx="8"/>
    <rect class="a-ink" x="86" y="42" width="48" height="8" rx="4"/>
    ${[0, 1, 2].map((i) => { const y = 64 + i * 24; return `<rect class="a-soft" x="86" y="${y}" width="15" height="15" rx="4"/><path class="s-accent a-check" style="--i:${i}" pathLength="1" d="M89.5 ${y + 7.5}l3.5 3.5 6.5-7"/><rect class="a-soft" x="108" y="${y + 4.5}" width="48" height="6" rx="3"/>`; }).join("")}
    <circle class="a-accent a-stamp" cx="160" cy="138" r="15"/><path class="s-ink" d="M153.5 138l4.5 4.5 8.5-9"/>`,
  kickoff: `<rect class="a-paper" x="28" y="24" width="56" height="48" rx="6"/><rect class="a-accent" x="28" y="24" width="56" height="12" rx="6"/><rect class="a-accent" x="28" y="30" width="56" height="6"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect class="a-soft" x="${36 + (i % 3) * 15}" y="${44 + Math.floor(i / 3) * 12}" width="10" height="7" rx="2"/>`).join("")}
    <path class="s-ink-soft" stroke-dasharray="4 6" d="M30 140C70 140 70 96 110 96S150 52 210 52"/>
    <path class="s-ink a-road" pathLength="1" d="M30 140C70 140 70 96 110 96S150 52 210 52"/>
    ${[[30, 140], [70, 118], [110, 96], [152.5, 74], [210, 52]].map(([x, y], i) => `<circle class="a-paper s-ink a-mile" style="--i:${i}" cx="${x}" cy="${y}" r="7"/>`).join("")}
    <path class="s-ink" d="M210 45V20"/><path class="a-accent a-flag" d="M210 20h22l-6 7 6 7h-22z"/>`,
  scale: `<path class="s-paper-soft" d="M38 146h170"/>
    ${[[52, 34], [82, 52], [112, 72], [142, 96]].map(([x, h], i) => `<rect class="${i === 3 ? "a-accent" : "a-paper"} a-bar" style="--i:${i}" x="${x}" y="${146 - h}" width="22" height="${h}" rx="3"/>`).join("")}
    <path class="s-accent a-trend" pathLength="1" d="M46 118L88 100L120 82L160 48L194 32"/>
    <path class="a-accent a-trend-head" d="M194 32l-14 1 9 10z"/>
    <path class="a-paper a-twinkle" d="M206 20l2.6 7.4L216 30l-7.4 2.6L206 40l-2.6-7.4L196 30l7.4-2.6z"/>`,
};

export const mSupport = ({ places = [], title, text, steps = [], cta }, { id = "support" } = {}) => html`
<section class="m-wrap m-section m-support" aria-labelledby="${id}-title">
  ${places.length ? html`<div class="m-faces" aria-hidden="true">${places.map((p) => html`<span class="m-faces__item">${img(p, { alt: "", sizes: "64px" })}</span>`)}</div>` : ""}
  <p class="m-pill-eyebrow">${t("support.eyebrow")}</p>
  <h2 class="m-h2" id="${id}-title" data-anim="chars">${lines(title)}</h2>
  <p class="m-lead m-support__text">${text}</p>
  <ol class="m-pipe" role="list">
    ${steps.map((st, i) => html`<li class="m-pipe__step" style="--i:${i}">
      <div class="m-pipe__media">
        <div class="m-pipe__tile m-pipe__tile--${st.tone}"><svg class="m-art" viewBox="0 0 240 180" aria-hidden="true" focusable="false">${raw(PIPE_ART[st.art])}</svg></div>
        ${i < steps.length - 1 ? html`<span class="m-pipe__link" aria-hidden="true"></span>` : ""}
      </div>
      <p class="m-pipe__title"><span class="m-pipe__num">${pad2(i + 1)}</span>${st.name}</p>
      <p class="m-pipe__text">${st.text}</p>
    </li>`)}
  </ol>
  ${cta ? html`<div class="m-btns m-support__cta">${btn({ ...cta, variant: "dark" })}</div>` : ""}
</section>`;

/* -------------------------------------------------------------------- CTA card */

/** Portrait shown on the right of every CTA card (assets/img/adham-*.webp, made from Adham.png). */
const CTA_PHOTO = { alt: t("cta.photoAlt") };

export const mCta = ({ title, text, primary, secondary, side, photo = CTA_PHOTO }, { id = "cta" } = {}) => html`
<section class="m-wrap m-section" aria-labelledby="${id}-title">
  <div class="m-card m-cta">
    <div class="m-cta__main">
      <h2 class="m-h2" id="${id}-title" data-anim="chars">${lines(title)}</h2>
      ${text ? html`<p class="m-lead">${text}</p>` : ""}
      <div class="m-btns">${btn({ ...primary, variant: "dark" })}${secondary ? mLink(secondary) : ""}</div>
    </div>
    ${photo
      ? html`<figure class="m-cta__photo"><img src="/assets/img/adham-1200.webp" srcset="/assets/img/adham-600.webp 600w, /assets/img/adham-1200.webp 1200w" sizes="(max-width: 1199px) 100vw, 460px" width="1200" height="1200" alt="${photo.alt}" loading="lazy" decoding="async"></figure>`
      : side ? html`<div class="m-cta__side"><b>${side.title}</b><span>${side.text}</span>${mLink(side.link)}</div>` : ""}
  </div>
</section>`;

/* -------------------------------------------------------------------- tiles */

export const mTiles = (tiles = markets.tiles, head = markets.tilesHead) => html`
<section class="m-wrap m-section m-countries" aria-labelledby="countries-title" data-countries>
  <div class="m-countries__head">
    <div>${eyebrow(head.eyebrow)}<h2 class="m-h2s" id="countries-title" data-anim="chars">${head.title}</h2></div>
    <div class="m-carousel__nav m-countries__nav">
      <button type="button" class="m-round" data-countries-prev aria-label="${t("aria.prevCountries")}">${icon("chevronLeft")}</button>
      <button type="button" class="m-round" data-countries-next aria-label="${t("aria.nextCountries")}">${icon("chevronRight")}</button>
    </div>
  </div>
  <ul class="m-countries__track" role="list" data-countries-track data-lenis-prevent-horizontal>
    ${tiles.map((t) => html`<li><a class="m-tile" href="${t.href}">
      ${img(t.image, { alt: "", sizes: "(max-width: 809px) 80vw, 30vw" })}
      <span class="m-tile__label">${flag(t.flag, "m-tile__flag")}${t.name}</span>
      <span class="m-tile__arrow">${icon("arrow")}</span>
    </a></li>`)}
  </ul>
</section>`

export { images };
