import { Fragment, useEffect, useRef, useState } from "react";
import { useContent } from "../i18n/context.jsx";
import { Icon } from "./icons.jsx";
import { L, Img, imgUrl, Lines, BtnPrimary, BtnSecondary, BtnOutline, ArrowLink, MiniLabel, MicroLabel, SectionHead, SplitHead, Heading, FitLabel, contactHref, pad2, formatDate } from "./ui.jsx";
import { MCta } from "./blocks.jsx";

// Latin slug for ids; titles without Latin letters (Arabic, Cyrillic) get a short stable hash instead.
const hash = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.codePointAt(0)) >>> 0, 7).toString(36);
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `x${hash(s)}`;

/** Zero-padded 1-based index (was re-exported from layout.mjs). */
const num = (i) => pad2(i + 1);

// Text interpolated into the static SVG strings below (rendered with dangerouslySetInnerHTML).
const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/* ------------------------------------------------------------------ page hero */

/** Inner-page hero — the Mollie hero layout (eyebrow + display title | lead + actions, rounded photo). */
export function PageHero({ label, title, lead, actions = [], image, imageAlt, crumbs = [], aside, notice }) {
  const { t } = useContent();
  return (
    <section className="m-hero m-hero--page" aria-labelledby="page-title">
      <div className="m-wrap">
        {crumbs.length ? (
          <nav className="m-crumbs" aria-label={t("aria.breadcrumbs")}>
            {crumbs.map((c, i) => (c.href ? <L key={i} href={c.href}>{c.label}</L> : <span key={i} aria-current="page">{c.label}</span>))}
          </nav>
        ) : null}
        <div className="m-hero__head">
          <div className="m-hero__title-wrap">
            <FitLabel as="p" className="m-eyebrow">{label}</FitLabel>
            <h1 className="m-display m-display--page" id="page-title" data-anim="intro-title"><Lines text={title} /></h1>
          </div>
          <div className="m-hero__aside" data-anim="intro-text">
            {lead ? <p className="m-hero__text">{lead}</p> : null}
            {actions.length ? <div className="m-btns">{actions.map((a, i) => <Fragment key={i}>{a}</Fragment>)}</div> : null}
            {aside ?? null}
          </div>
        </div>
        {notice ? <p className="m-note m-note--left"><Icon name="lock" className="m-note__icon" /><span>{notice}</span></p> : null}
      </div>
      {image ? (
        <div className="m-hero__media m-hero__media--page" data-anim="intro-media">
          <Img file={image} alt={imageAlt} className="m-hero__img" eager sizes="(max-width: 809px) 100vw, 1400px" />
        </div>
      ) : null}
    </section>
  );
}

/* ---------------------------------------------------------- capability visuals
 * Small line-art "product demos" for each capability (Mollie-style visual blocks).
 * currentColor = theme ink; .v-accent = brand orange.
 * Each entry returns the inner markup of the <svg class="cap-visual"> as a string. */
const VISUALS = {
  invest: (t) => {
    const left = [30, 50, 70, 90, 110, 130, 150];
    const mid = [70, 90, 110];
    return `
      ${left.map((y, i) => `<path class="v-line" d="M44 ${y} C100 ${y} 110 ${mid[Math.min(2, Math.floor(i / 2.5))]} 156 ${mid[Math.min(2, Math.floor(i / 2.5))]}"/>`).join("")}
      ${mid.map((y) => `<path class="v-line" d="M164 ${y} C220 ${y} 230 90 272 90"/>`).join("")}
      ${left.map((y) => `<circle class="v-dot" cx="40" cy="${y}" r="4"/>`).join("")}
      ${mid.map((y) => `<circle class="v-dot v-dot--mid" cx="160" cy="${y}" r="5"/>`).join("")}
      <circle class="v-accent v-pulse" cx="280" cy="90" r="14"/><circle class="v-accent-fill" cx="280" cy="90" r="7"/>
      <text class="v-text" x="40" y="174" text-anchor="middle">${esc(t("cap.sourced"))}</text><text class="v-text" x="160" y="174" text-anchor="middle">${esc(t("cap.screened"))}</text><text class="v-text" x="280" y="174" text-anchor="middle">${esc(t("cap.selected"))}</text>
    `;
  },
  advise: (t) => `
      <path class="v-line" d="M60 20V156H300"/><path class="v-line v-dash" d="M180 20V156M60 88H300"/>
      <circle class="v-dot v-dot--soft" cx="102" cy="122" r="9"/><circle class="v-dot v-dot--soft" cx="140" cy="60" r="6"/><circle class="v-dot v-dot--soft" cx="220" cy="128" r="11"/>
      <circle class="v-dot v-dot--soft" cx="122" cy="140" r="5"/><circle class="v-dot v-dot--soft" cx="268" cy="112" r="6"/>
      <circle class="v-accent v-pulse" cx="248" cy="50" r="20"/><circle class="v-accent-fill" cx="248" cy="50" r="9"/>
      <text class="v-text" x="300" y="174" text-anchor="end">${esc(t("cap.abilityToWin"))}</text><text class="v-text" x="52" y="24" text-anchor="end" transform="rotate(-90 52 24)">${esc(t("cap.attractiveness"))}</text>
    `,
  partner: (t, id) => `
      <defs><clipPath id="jv-${esc(id)}"><circle cx="128" cy="88" r="62"/></clipPath></defs>
      <circle class="v-line" cx="128" cy="88" r="62"/><circle class="v-line" cx="192" cy="88" r="62"/>
      <circle class="v-accent-area" cx="192" cy="88" r="62" clip-path="url(#jv-${esc(id)})"/>
      <text class="v-text" x="96" y="92" text-anchor="middle">${esc(t("cap.capital"))}</text><text class="v-text" x="226" y="92" text-anchor="middle">${esc(t("cap.capability"))}</text>
      <text class="v-text v-text--accent" x="160" y="92" text-anchor="middle">${esc(t("cap.venture"))}</text>
    `,
  transform: () => `
      <rect class="v-box v-dash" x="16" y="24" width="44" height="28"/><rect class="v-box v-dash" x="70" y="62" width="44" height="28"/><rect class="v-box v-dash" x="24" y="100" width="44" height="28"/><rect class="v-box v-dash" x="78" y="132" width="44" height="28"/>
      <path class="v-line v-dash" d="M60 38h12M92 90v10M68 114h10"/>
      <path class="v-line" d="M136 90h22M150 84l8 6-8 6"/>
      <circle class="v-accent-fill" cx="246" cy="90" r="9"/><circle class="v-accent v-pulse" cx="246" cy="90" r="17"/>
      <rect class="v-box" x="176" y="22" width="44" height="28"/><rect class="v-box" x="272" y="22" width="40" height="28"/><rect class="v-box" x="176" y="130" width="44" height="28"/><rect class="v-box" x="272" y="130" width="40" height="28"/>
      <path class="v-line v-flow" d="M206 50L236 80M286 50L256 80M206 130L236 100M286 130L256 100"/>
    `,
  ai: (t) => `
      <path class="v-grid" d="M20 40H300M20 80H300M20 120H300M20 160H300"/>
      <path class="v-area" d="M20 150L60 140L100 146L140 118L180 112L220 80L260 66L300 34V160H20Z"/>
      <path class="v-line v-line--strong v-draw" d="M20 150L60 140L100 146L140 118L180 112L220 80L260 66L300 34"/>
      <circle class="v-accent v-pulse" cx="300" cy="34" r="12"/><circle class="v-accent-fill" cx="300" cy="34" r="5"/>
      <rect class="v-box v-box--fill" x="180" y="12" width="96" height="26" rx="2"/><text class="v-text" x="190" y="29">${esc(t("cap.costToServe"))}</text>
    `,
  build: () => `
      <rect class="v-box" x="30" y="14" width="260" height="152" rx="3"/><path class="v-line" d="M30 34H290"/>
      <circle class="v-dot v-dot--soft" cx="42" cy="24" r="3"/><circle class="v-dot v-dot--soft" cx="52" cy="24" r="3"/><circle class="v-dot v-dot--soft" cx="62" cy="24" r="3"/>
      <path class="v-line" d="M92 34V166"/><path class="v-grid" d="M44 52H78M44 66H74M44 80H70M44 94H76"/>
      <rect class="v-box v-box--fill" x="106" y="48" width="84" height="48"/><rect class="v-box v-box--fill" x="198" y="48" width="78" height="48"/>
      <path class="v-grid" d="M106 112H276M106 126H240M106 140H256"/>
      <rect class="v-accent-fill" x="214" y="146" width="62" height="12" rx="6"/>
    `,
};

export function CapabilityVisual({ name, id = name }) {
  const { t } = useContent();
  return <svg viewBox="0 0 320 180" className="cap-visual" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: VISUALS[name](t, id) }} />;
}

/* -------------------------------------------------------------- capability grid */

export function CapabilityCard({ s, level = "h3" }) {
  const { t } = useContent();
  return (
    <article className="cap-card" data-anim="fade-up">
      <div className="cap-card__top">
        <MicroLabel text={`${s.index} — ${s.key}`} className="color-white-50" />
        <L className="cap-card__corner" href={`/${s.slug}/`} tabIndex={-1} aria-hidden="true"><Icon name="arrowUpRight" /></L>
      </div>
      <div className="cap-card__visual"><CapabilityVisual name={s.visual} id={`card-${s.slug}`} /></div>
      <div className="cap-card__body">
        <Heading level={level} className="h4"><L className="cap-card__link" href={`/${s.slug}/`}>{s.name}</L></Heading>
        <p className="body-md color-white-60">{s.summary}</p>
        <details className="disclosure">
          <summary className="button-sm"><span>{t("whatsIncluded")}</span><span className="disclosure__count color-white-40">{s.includes.length}</span><Icon name="plus" className="disclosure__icon" /></summary>
          <ul className="dot-list body-sm" role="list">{s.includes.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </details>
        <ArrowLink label={s.cardCta} href={`/${s.slug}/`} />
      </div>
    </article>
  );
}

export const CapabilityGrid = ({ items }) => <div className="cap-grid">{items.map((s) => <CapabilityCard key={s.slug} s={s} />)}</div>;

/* -------------------------------------------------------------- tabs (generic) */

/**
 * Accessible tablist. Every panel is rendered server-side; without JS all panels
 * stay visible (CSS hides inactive ones only under html.js). Switching stays DOM-driven
 * ([data-tabs] in behaviours.js).
 */
export const Tabs = ({ id, label, items, tabClass = "", listClass = "", panelClass = "", renderTab, renderPanel, className = "" }) => (
  <div className={`tabs ${className}`} data-tabs="">
    <div className={`tabs__list ${listClass}`} role="tablist" aria-label={label}>
      {items.map((it, i) => (
        <button key={i} type="button" role="tab" className={`tabs__tab ${tabClass}`} id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={i === 0 ? "true" : "false"} tabIndex={i === 0 ? 0 : -1}>
          {renderTab(it, i)}
        </button>
      ))}
    </div>
    <div className="tabs__panels">
      {items.map((it, i) => (
        <div key={i} role="tabpanel" className={`tabs__panel ${panelClass} ${i === 0 ? "is-active" : ""}`} id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} tabIndex={0}>
          {renderPanel(it, i)}
        </div>
      ))}
    </div>
  </div>
);

/* ---------------------------------------------------- "What are you trying to achieve?" */

export const Chain = ({ items, className = "" }) => (
  <ol className={`chain ${className}`} role="list">
    {items.map((x, i) => (
      <li key={i} className="chain__item"><span className="chain__pill body-sm">{x}</span>{i < items.length - 1 ? <span className="chain__plus" aria-hidden="true">+</span> : null}</li>
    ))}
  </ol>
);

export function NeedsSelector({ needs }) {
  const { t, contact, packageBySlug } = useContent();
  return (
    <section className="section section--raised theme-light" data-theme="light" aria-labelledby="needs-title">
      <div className="container">
        <SectionHead label={needs.label} title={needs.title} id="needs-title" />
        <Tabs
          id="need"
          label={needs.title}
          className="needs"
          listClass="needs__list"
          tabClass="needs__tab"
          panelClass="needs__panel"
          items={needs.items}
          renderTab={(n, i) => (
            <>
              <span className="needs__num micro">{pad2(i + 1)}</span><span className="needs__label body-xl">{n.label}</span><span className="needs__text body-sm color-white-50">{n.text}</span><Icon name="arrow" className="needs__arrow" />
            </>
          )}
          renderPanel={(n) => (
            <>
              <p className="micro color-white-50">{t("need.title")}</p>
              <p className="h4 needs__headline">{n.text}</p>
              <Chain items={n.pathway} />
              <div className="needs__engagements">
                <p className="micro color-white-50">{t("need.engagement")}</p>
                <ul role="list">
                  {n.engagements.map((slug) => {
                    const p = packageBySlug(slug);
                    return (
                      <li key={slug}><L className="needs__engagement" href={`/engagements/${p.slug}/`}><span className="body-lg">{p.name}</span><span className="body-sm color-white-60">{p.short}</span><Icon name="arrowUpRight" className="needs__engagement-icon" /></L></li>
                    );
                  })}
                </ul>
              </div>
              <BtnSecondary label={n.cta.label} href={contactHref(contact, n.cta)} />
            </>
          )}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ journey */

export const Journey = ({ j, theme = "dark" }) => (
  <section className={`section journey theme-${theme}`} data-theme={theme} aria-labelledby="journey-title">
    <div className="container">
      <SplitHead label={j.label} title={j.title} text={j.text} id="journey-title" />
      <ol className="journey__track" role="list" data-journey="">
        {j.stages.map((s, i) => (
          <li key={i} className="journey__stage" style={{ "--i": i }}><span className="journey__dot"></span><span className="micro color-white-40">{pad2(i + 1)}</span><span className="body-lg journey__name">{s}</span></li>
        ))}
      </ol>
      <p className="body-sm color-white-50 journey__note"><Icon name="checkCircle" className="journey__note-icon" />{j.note}</p>
    </div>
  </section>
);

/* -------------------------------------------------------------- engagements */

export function PackageCard({ p, level = "h3" }) {
  const { t } = useContent();
  return (
    <article className="pkg-card" data-anim="fade-up">
      <p className="micro pkg-card__mode">{p.mode}</p>
      <Heading level={level} className="h4"><L className="pkg-card__link" href={`/engagements/${p.slug}/`}>{p.name}</L></Heading>
      <p className="body-md color-white-60 pkg-card__text">{p.short}</p>
      <p className="body-sm pkg-card__client"><span className="color-white-50">{t("idealClient")}</span>{p.idealClient}</p>
      <details className="disclosure">
        <summary className="button-sm"><span>{t("typicalDeliverables")}</span><Icon name="plus" className="disclosure__icon" /></summary>
        <p className="body-sm color-white-50 disclosure__note">{t("deliverablesNote")}</p>
        <ul className="dot-list body-sm" role="list">{p.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
      </details>
      <ArrowLink label={p.cta.label} href={`/engagements/${p.slug}/`} />
    </article>
  );
}

export const PackageGrid = ({ items }) => <div className="pkg-grid">{items.map((p) => <PackageCard key={p.slug} p={p} />)}</div>;

export function Flagship({ p, theme = "dark", level = "h2", label, link = true }) {
  const { t, contact } = useContent();
  if (label === undefined) label = t("flagship.label");
  return (
    <section className={`section flagship theme-${theme}`} data-theme={theme} aria-labelledby="flagship-title">
      <div className="container">
        <div className="flagship__head">
          <MiniLabel label={label} />
          <Heading level={level} className="h2" id="flagship-title" anim="chars"><Lines text={p.headline} /></Heading>
          <p className="body-lg color-white-60 flagship__lead" data-anim="fade-up">{p.lead}</p>
        </div>
        <ol className="flagship__chain" role="list">
          {p.chain.map((c, i) => (
            <li key={i} className="flagship__stage" data-anim="fade-up">
              <span className="micro color-white-40">{pad2(i + 1)}</span>
              <p className="h4">{c.name}</p>
              <ul className="body-sm color-white-60" role="list">{c.items.map((x, k) => <li key={k}>{x}</li>)}</ul>
            </li>
          ))}
        </ol>
        <div className="actions">
          <BtnPrimary label={p.cta.label} href={contactHref(contact, { ...p.cta, topic: p.name })} />
          {link ? <BtnOutline label={t("flagship.seeEngagement")} href={`/engagements/${p.slug}/`} /> : null}
        </div>
      </div>
    </section>
  );
}

export function RelatedEngagements({ slugs, title, theme = "light" }) {
  const { t, packageBySlug } = useContent();
  if (title === undefined) title = t("related.title");
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby="related-title">
      <div className="container">
        <SplitHead label={t("related.label")} title={title} text={t("related.text")} action={<BtnOutline label={t("menu.allEngagements")} href="/engagements/" />} id="related-title" />
        <div className="pkg-grid pkg-grid--3">{slugs.map((s) => <PackageCard key={s} p={packageBySlug(s)} />)}</div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- markets */

// `m` = markets.map (projection bounds and canvas size).
const project = (m, lon, lat) => [((lon - m.lon0) / (m.lon1 - m.lon0)) * m.width, ((m.lat1 - lat) / (m.lat1 - m.lat0)) * m.height];

export function MarketMap() {
  const { markets, marketsBase } = useContent();
  const m = markets.map;
  // routes name English cities; points keep their order across translations, so resolve by index
  const byName = Object.fromEntries(marketsBase.points.map((p, i) => [p.name, markets.points[i]]));
  const routes = markets.routes.map(([a, b], i) => {
    const [x1, y1] = project(m, byName[a].lon, byName[a].lat);
    const [x2, y2] = project(m, byName[b].lon, byName[b].lat);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const bend = Math.min(140, len * 0.22);
    // control point perpendicular to the chord, always bowing "upwards"
    let nx = -dy / len, ny = dx / len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return (
      <path key={i} className="map__route" style={{ "--d": `${(i * 0.35).toFixed(2)}s` }} d={`M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + nx * bend).toFixed(1)} ${(my + ny * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`} />
    );
  });
  return (
    <div className="map" data-map="">
      <div className="map__canvas" style={{ aspectRatio: `${m.width} / ${m.height}` }}>
        <img className="map__land" src="/assets/img/map.svg" alt="" width={m.width} height={m.height} loading="lazy" decoding="async" />
        <svg className="map__routes" viewBox={`0 0 ${m.width} ${m.height}`} aria-hidden="true" focusable="false">{routes}</svg>
        {markets.points.map((p, i) => {
          const [x, y] = project(m, p.lon, p.lat);
          return (
            <span key={i} className={`map__point ${p.hub ? "map__point--hub" : ""} ${p.minor ? "map__point--minor" : ""}`} style={{ left: `${((x / m.width) * 100).toFixed(2)}%`, top: `${((y / m.height) * 100).toFixed(2)}%` }}>
              <span className="map__dot"></span><span className="map__label title-xs">{p.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function MarketAccess({ level = "h2" }) {
  const { markets } = useContent();
  const a = markets.access;
  return (
    <section className="section market-access theme-dark" data-theme="dark" aria-labelledby="access-title" id="gcc-map">
      <div className="container">
        <div className="market-access__head">
          <MiniLabel label={a.label} />
          <Heading level={level} className="h2" id="access-title" anim="chars"><Lines text={a.title} /></Heading>
          <p className="body-lg color-white-60" data-anim="fade-up">{a.text}</p>
        </div>
      </div>
      <MarketMap />
      <div className="container">
        <ul className="region-list" role="list">{a.regions.map((r, i) => <li key={i} className="button-sm">{r}</li>)}</ul>
      </div>
    </section>
  );
}

export function SaudiBlock({ level = "h2", id = "saudi-arabia" }) {
  const { markets } = useContent();
  const s = markets.saudi;
  return (
    <section className="section market-focus theme-light" data-theme="light" id={id} aria-labelledby={`${id}-title`}>
      <div className="container market-focus__in">
        <figure className="market-focus__media" data-anim="fade-up"><Img file={s.image} alt={s.imageAlt} className="market-focus__img" sizes="(max-width: 991px) 100vw, 45vw" /></figure>
        <div className="market-focus__body">
          <MiniLabel label={s.label} />
          <Heading level={level} className="h1-alt" id={`${id}-title`} anim="chars">{s.title}</Heading>
          <p className="body-xl color-white-60">{s.subtitle}</p>
          <div className="market-cols">
            {s.columns.map((c, i) => (
              <div key={i} className="market-cols__col" data-anim="fade-up">
                <p className="micro">{c.name}</p>
                <ul className="body-md color-white-60" role="list">{c.items.map((x, k) => <li key={k}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
          <BtnSecondary label={s.cta.label} href={s.cta.href} />
        </div>
      </div>
    </section>
  );
}

export function UzbekistanBlock({ level = "h2", id = "uzbekistan" }) {
  const { markets, contact } = useContent();
  const u = markets.uzbekistan;
  return (
    <section className="section uzb theme-dark" data-theme="dark" id={id} aria-labelledby={`${id}-title`}>
      <div className="uzb__bg" aria-hidden="true"><Img file={u.image} alt="" className="uzb__bg-img" sizes="60vw" /></div>
      <div className="container uzb__in">
        <div className="uzb__body">
          <MiniLabel label={u.label} />
          <Heading level={level} className="h1-alt" id={`${id}-title`} anim="chars">{u.title}</Heading>
          <p className="body-xl">{u.subtitle}</p>
          <p className="body-md color-white-60">{u.text}</p>
          <ul className="chips" role="list">{u.sectors.map((x, i) => <li key={i} className="chip body-sm">{x}</li>)}</ul>
          <BtnPrimary label={u.cta.label} href={contactHref(contact, u.cta)} />
        </div>
        <div className="bridge" aria-label={u.bridge.join(" ↔ ")} role="img">
          {u.bridge.map((b, i) => (
            <Fragment key={i}>
              <span className={`bridge__node ${i === 1 ? "bridge__node--center" : ""}`}><span className="bridge__dot"></span><span className="h4">{b}</span></span>
              {i < u.bridge.length - 1 ? <span className="bridge__link" aria-hidden="true"><span></span></span> : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- opportunities */

export function OpportunityCard({ o, level = "h3" }) {
  const { t, opportunities } = useContent();
  return (
    <article className="opp-card" data-anim="fade-up">
      <div className="opp-card__top">
        <span className="tag">{t("illustrative")}</span>
        <span className="opp-card__status body-sm"><span className="status-dot"></span>{o.status}</span>
      </div>
      <p className="micro color-white-50">{o.country}</p>
      <Heading level={level} className="h4"><L className="opp-card__link" href={`/opportunities/${o.slug}/`}>{o.sector}</L></Heading>
      <p className="body-sm color-white-60 opp-card__summary">{o.summary}</p>
      <dl className="meta-list">
        {opportunities.fields.filter((f) => f.key !== "status" && f.key !== "country").map((f) => (
          <div key={f.key} className="meta-list__row"><dt className="body-sm color-white-50">{f.label}</dt><dd className="body-sm">{o[f.key]}</dd></div>
        ))}
      </dl>
      <ArrowLink label={t("viewOpportunity")} href={`/opportunities/${o.slug}/`} />
    </article>
  );
}

export function OpportunityRail({ title, level = "h2", theme = "dark" }) {
  const { t, opportunities } = useContent();
  if (title === undefined) title = opportunities.intro.title;
  return (
    <section className={`section opps theme-${theme}`} data-theme={theme} aria-labelledby="opps-title">
      <div className="container">
        <SplitHead label={t("opps.label")} title={title} text={opportunities.intro.lead} action={<BtnOutline label={t("menu.allOpportunities")} href="/opportunities/" />} level={level} id="opps-title" />
      </div>
      <div className="rail" data-rail="">
        <div className="rail__track">{opportunities.items.map((o) => <OpportunityCard key={o.slug} o={o} />)}</div>
      </div>
      <div className="container"><p className="notice body-sm"><Icon name="lock" className="notice__icon" /><span>{opportunities.intro.notice}</span></p></div>
    </section>
  );
}

/* ---------------------------------------------------------------- steps / timeline */

export const Steps = ({ label, title, items, theme = "light", interactive = false, id = slugify(title).slice(0, 24), text }) => (
  <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby={`${id}-title`}>
    <div className="container">
      <SplitHead label={label} title={title} text={text} id={`${id}-title`} />
      <ol className={`timeline ${items.length > 6 ? "timeline--many" : ""}`} role="list" data-timeline={interactive ? "" : undefined} style={{ "--n": items.length }}>
        {items.map((s, i) => (
          <li key={i} className={`timeline__step ${interactive && i === 0 ? "is-active" : ""}`} data-anim="fade-up" tabIndex={interactive ? 0 : undefined}>
            <span className="timeline__marker"><span className="timeline__dot"></span></span>
            <span className="micro color-white-40">{pad2(i + 1)}</span>
            <h3 className="h4 timeline__name">{s.name}</h3>
            <p className="body-sm color-white-60">{s.text}</p>
            {s.detail ? <p className="body-sm timeline__detail">{s.detail}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ---------------------------------------------------------------- mandates */

export const Mandates = ({ m }) => (
  <section className="section theme-light" data-theme="light" aria-labelledby="mandates-title">
    <div className="container">
      <SectionHead label={m.label} title={m.title} text={m.text} id="mandates-title" />
      <ol className="mandates" role="list">
        {m.items.map((x, i) => <li key={i} className="mandates__item" data-anim="fade-up"><span className="micro color-white-40">{pad2(i + 1)}</span><p className="body-xl">{x}</p></li>)}
      </ol>
    </div>
  </section>
);

/* ---------------------------------------------------------------- AI showcase */

export function AiShowcase({ ai, theme = "dark", level = "h2" }) {
  const { t } = useContent();
  const d = ai.dashboard;
  const max = Math.max(...d.bars);
  return (
    <section className={`section ai theme-${theme}`} data-theme={theme} aria-labelledby="ai-title">
      <div className="container">
        <div className="ai__grid">
          <div className="ai__intro">
            <MiniLabel label={ai.label} />
            <Heading level={level} className="h2" id="ai-title" anim="chars"><Lines text={ai.title} /></Heading>
            <p className="body-lg color-white-60" data-anim="fade-up">{ai.text}</p>
            <ol className="ladder" role="list">
              {ai.ladder.map((s, i) => (
                <li key={i} className={`ladder__step ${i === ai.ladder.length - 1 ? "ladder__step--top" : ""}`} data-anim="fade-up">
                  <span className="micro color-white-40">{pad2(i + 1)}</span>
                  <span className="ladder__body"><span className="body-xl">{s.name}</span><span className="body-sm color-white-60">{s.text}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <figure className="dash" data-anim="fade-up" aria-label={`${d.title} — ${d.tag}`}>
            <div className="dash__bar"><span></span><span></span><span></span><p className="title-xs color-white-50">{d.tag}</p></div>
            <div className="dash__head"><p className="body-lg">{d.title}</p><p className="body-sm color-white-50">{d.subtitle}</p></div>
            <div className="dash__kpis">{d.kpis.map((k, i) => <div key={i} className="dash__kpi"><p className="body-sm color-white-50">{k.label}</p><p className="h3">{k.value}</p><p className="body-sm dash__delta">{k.delta}</p></div>)}</div>
            <div className="dash__chart" aria-hidden="true">{d.bars.map((b, i) => <span key={i} className={`dash__col ${i === d.bars.length - 1 ? "is-accent" : ""}`} style={{ "--h": `${Math.round((b / max) * 100)}%` }}></span>)}</div>
            <ul className="dash__agents" role="list">{d.agents.map((a, i) => <li key={i}><span className="dash__agent-name body-sm">{a.name}</span><span className="body-sm color-white-60">{a.task}</span><span className={`dash__status dash__status--${slugify(a.status)} title-xs`}>{a.status}</span></li>)}</ul>
            <figcaption className="sr-only">{t("dash.caption")}</figcaption>
          </figure>
        </div>
        <Tabs
          id="usecase"
          label={t("usecases.label")}
          className="usecases"
          listClass="usecases__list"
          tabClass="chip chip--button body-sm"
          panelClass="usecases__panel"
          items={ai.useCases}
          renderTab={(u) => u.name}
          renderPanel={(u) => <><p className="micro color-white-50">{u.name}</p><p className="h4">{u.text}</p></>}
        />
        {ai.cta ? <div className="actions"><BtnPrimary label={ai.cta.label} href={ai.cta.href} /></div> : null}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- before / after */

export function BeforeAfter({ b, theme = "light" }) {
  const { t, contact } = useContent();
  const id = `ba-${slugify(b.title).slice(0, 16)}`;
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby={id}>
      <div className="container">
        <SplitHead label={b.label} title={b.title} id={id} />
        <div className="ba" data-ba="">
          <div className="ba__toggle" role="group" aria-label={t("ba.compare")}>
            <button type="button" className="ba__btn button-sm" aria-pressed="false" data-ba-show="before">{t("ba.before")}</button>
            <button type="button" className="ba__btn button-sm" aria-pressed="true" data-ba-show="after">{t("ba.after")}</button>
          </div>
          <div className="ba__cols">
            <div className="ba__col ba__col--before">
              <p className="micro">{t("ba.before")}</p>
              <ul role="list">{b.before.map((x, i) => <li key={i} className="body-xl"><Icon name="minus" className="ba__icon" />{x}</li>)}</ul>
            </div>
            <div className="ba__arrow" aria-hidden="true"><Icon name="arrow" /></div>
            <div className="ba__col ba__col--after">
              <p className="micro">{t("ba.after")}</p>
              <ul role="list">{b.after.map((x, i) => <li key={i} className="body-xl"><Icon name="check" className="ba__icon" />{x}</li>)}</ul>
            </div>
          </div>
          {b.cta ? <div className="actions"><BtnSecondary label={b.cta.label} href={contactHref(contact, b.cta)} /></div> : null}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- audience / pillars */

export const CellGrid = ({ items, cols = 4, level = "h3", numbered = false }) => (
  <div className={`cells cells--${cols}`}>
    {items.map((it, i) => (
      <div key={i} className="cell" data-anim="fade-up">
        {numbered ? <span className="micro color-white-40">{pad2(i + 1)}</span> : null}
        <Heading level={level} className="h4 cell__title">{it.title ?? it.name}</Heading>
        <p className="body-md color-white-60">{it.text}</p>
      </div>
    ))}
  </div>
);

export function Audience({ a, theme = "light" }) {
  const { t } = useContent();
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby="audience-title">
      <div className="container">
        <SectionHead label={a.label} title={a.title ?? t("audience.title")} id="audience-title" />
        <CellGrid items={a.items} cols={4} />
      </div>
    </section>
  );
}

export function Pillars({ b, theme = "light" }) {
  const id = `p-${slugify(b.title).slice(0, 20)}`;
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby={id}>
      <div className="container">
        <SectionHead label={b.label} title={b.title} id={id} />
        <CellGrid items={b.items} cols={4} numbered />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- orbit diagram (network / ecosystem) */

export function Orbit({ center, nodes, className = "" }) {
  const { t } = useContent();
  const pts = nodes.map((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { n, x: 50 + 40 * Math.cos(a), y: 50 + 38 * Math.sin(a), i };
  });
  return (
    <div className={`orbit ${className}`} role="img" aria-label={t("orbit.connected", { center, nodes: nodes.join(", ") })}>
      <svg className="orbit__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <ellipse className="orbit__ring" cx="50" cy="50" rx="40" ry="38" />
        <ellipse className="orbit__ring orbit__ring--inner" cx="50" cy="50" rx="22" ry="21" />
        {pts.map((p) => <line key={p.i} className="orbit__spoke" style={{ "--d": `${(p.i * 0.4).toFixed(1)}s` }} x1="50" y1="50" x2={p.x.toFixed(2)} y2={p.y.toFixed(2)} />)}
      </svg>
      <span className="orbit__center"><img src="/assets/img/silk-road-mark-96.webp" alt="" width="101" height="96" /><span className="button-sm">{center}</span></span>
      {pts.map((p) => <span key={p.i} className="orbit__node button-sm" style={{ left: `${p.x.toFixed(2)}%`, top: `${p.y.toFixed(2)}%`, "--d": `${(p.i * 0.4).toFixed(1)}s` }}>{p.n}</span>)}
    </div>
  );
}

export const Network = ({ n, theme = "dark", id = "network" }) => (
  <section className={`section network theme-${theme}`} data-theme={theme} id={id} aria-labelledby={`${id}-title`}>
    <div className="container network__in">
      <div className="network__text">
        <MiniLabel label={n.label} />
        <Heading level="h2" className="h2" id={`${id}-title`} anim="chars"><Lines text={n.title} /></Heading>
        <p className="body-lg color-white-60" data-anim="fade-up">{n.text}</p>
      </div>
      <Orbit center={n.center ?? "Silk Road Capital"} nodes={n.nodes ?? n.categories} />
    </div>
  </section>
);

/* ---------------------------------------------------------------- statement / discretion */

export const Statement = ({ text, theme = "light" }) => (
  <section className={`section section--tight theme-${theme}`} data-theme={theme}>
    <div className="container statement">
      <Icon name="star8" className="statement__mark" />
      <p className="statement__text" data-anim="lines">{text}</p>
    </div>
  </section>
);

export function Discretion({ d, theme = "light" }) {
  const { images } = useContent();
  return (
    <section className={`section discretion theme-${theme}`} data-theme={theme} aria-labelledby="discretion-title">
      <div className="discretion__pattern" aria-hidden="true" style={{ backgroundImage: `url('${imgUrl(images, "preloader_bg.webp")}')` }}></div>
      <div className="container discretion__in">
        <Icon name="lock" className="discretion__icon" />
        <MiniLabel label={d.label} />
        <Heading level="h2" className="h2" id="discretion-title" anim="chars">{d.title}</Heading>
        <p className="body-xl color-white-60" data-anim="fade-up">{d.text}</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- insights */

export const readingTime = (a) => Math.max(2, Math.round(a.body.join(" ").split(/\s+/).length / 200));

export function InsightCard({ a, level = "h3" }) {
  const { t, locale } = useContent();
  return (
    <article className="insight-card" data-anim="fade-up" data-category={a.tags.join("|")}>
      <p className="insight-card__meta micro"><span>{a.category}</span><span className="color-white-40">{t("ins.minRead", { n: readingTime(a) })}</span></p>
      <Heading level={level} className="h4"><L className="insight-card__link" href={`/insights/${a.slug}/`}>{a.title}</L></Heading>
      <p className="body-sm color-white-60">{a.summary}</p>
      <p className="insight-card__foot body-sm color-white-50"><time dateTime={a.date}>{formatDate(a.date, locale.intl)}</time><Icon name="arrowUpRight" className="insight-card__icon" /></p>
    </article>
  );
}

export const InsightsGrid = ({ items }) => <div className="insight-grid">{items.map((a) => <InsightCard key={a.slug} a={a} />)}</div>;

/* ---------------------------------------------------------------- final CTA */

export const CtaSection = ({ f }) => (
  <MCta
    title={f.title}
    text={f.text}
    primary={f.primary}
    secondary={f.secondary ? { label: f.secondary.label, href: f.secondary.href } : null}
  />
);

/* ---------------------------------------------------------------- products catalogue */

export function ProductCatalogue({ theme = "light" }) {
  const { t, products, contact } = useContent();
  return (
    <section className={`section theme-${theme}`} data-theme={theme} id="catalogue" aria-labelledby="catalogue-title">
      <div className="container">
        <SplitHead label={products.label} title={products.title} text={products.lead} id="catalogue-title" />
        <Tabs
          id="catalogue"
          label={t("catalogue.label")}
          className="catalogue"
          listClass="catalogue__list"
          tabClass="pill-tab button-sm"
          panelClass="catalogue__panel"
          items={products.categories}
          renderTab={(c) => <>{c.name}<span className="pill-tab__count">{c.products.length}</span></>}
          renderPanel={(c) => (
            <div className="product-grid">
              {c.products.map((p, i) => (
                <article key={i} className="product-card">
                  <h3 className="h4">{p.name}</h3>
                  <p className="body-md color-white-60">{p.text}</p>
                  <dl className="product-card__meta">
                    <div><dt className="micro color-white-50">{t("catalogue.for")}</dt><dd className="body-sm">{p.for}</dd></div>
                    <div><dt className="micro color-white-50">{t("catalogue.capabilities")}</dt><dd><ul className="dot-list body-sm" role="list">{p.capabilities.map((x, k) => <li key={k}>{x}</li>)}</ul></dd></div>
                    <div><dt className="micro color-white-50">{t("catalogue.deployment")}</dt><dd className="body-sm">{p.deployment}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        />
        <p className="body-sm color-white-50 catalogue__note">{products.deploymentNote}</p>
        <div className="actions"><BtnSecondary label={products.cta.label} href={contactHref(contact, products.cta)} /></div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- JV models */

export const JvModels = ({ b, theme = "dark" }) => (
  <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby="models-title">
    <div className="container">
      <SectionHead label={b.label} title={b.title} id="models-title" />
      <ul className="models" role="list">
        {b.items.map((m, i) => (
          <li key={i} className="models__item" data-anim="fade-up">
            <p className="models__pair h4"><span>{m.a}</span><span className="models__plus" aria-hidden="true">+</span><span>{m.b}</span></p>
            <p className="body-md color-white-60">{m.text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

/* ---------------------------------------------------------------- engagement levels / commercial / solutions */

export function Levels({ ph, theme = "light" }) {
  const { t } = useContent();
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby="levels-title">
      <div className="container">
        <SectionHead label={ph.label} title={ph.title} id="levels-title" />
        <ol className="levels" role="list">
          {ph.levels.map((l, i) => <li key={i} className="levels__item" data-anim="fade-up"><span className="micro color-white-40">{pad2(i + 1)}</span><h3 className="h3">{l.name}</h3><p className="body-md color-white-60">{`“${l.quote}”`}</p></li>)}
        </ol>
        <ol className="progression" role="list" aria-label={t("progression")}>
          {ph.progression.map((p, i) => <li key={i} className="progression__item button-sm">{p}{i < ph.progression.length - 1 ? <Icon name="arrow" className="progression__arrow" /> : null}</li>)}
        </ol>
      </div>
    </section>
  );
}

export function CommercialModels({ c, theme = "dark", id = "commercial" }) {
  const { contact } = useContent();
  return (
    <section className={`section theme-${theme}`} data-theme={theme} id={id} aria-labelledby={`${id}-title`}>
      <div className="container">
        <SplitHead label={c.label} title={c.title} text={c.lead} action={<BtnPrimary label={c.cta.label} href={contactHref(contact, c.cta)} />} id={`${id}-title`} />
        <CellGrid items={c.models} cols={4} numbered />
      </div>
    </section>
  );
}

export function Solutions({ s, theme = "light" }) {
  const { t } = useContent();
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby="solutions-title">
      <div className="container">
        <SectionHead label={s.label} title={s.title} id="solutions-title" />
        <div className="solutions">
          {s.items.map((it, i) => (
            <article key={i} className="solutions__row" data-anim="fade-up">
              <div className="solutions__says"><p className="micro color-white-50">{t("solutions.says")}</p><h3 className="h4">{`“${it.says}”`}</h3></div>
              <div className="solutions__chain"><p className="micro color-white-50">{t("solutions.assemble")}</p><Chain items={it.chain} /><ArrowLink label={it.cta.label} href={it.cta.href} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Engagement selector — port of the old main.js behaviour (lines 372–409) as React state.
 * The recommendation (title, package list, CTA) is computed from the checked radios; the CTA
 * stays disabled (.is-disabled + aria-disabled, CSS sets pointer-events:none) until all three
 * questions ("need", "start", "where") are answered. Until the first answer that maps to a
 * package, the result keeps its server-rendered placeholder.
 */
export function PackageSelector({ sel, theme = "dark" }) {
  const { t, engagements } = useContent();
  const formRef = useRef(null);
  const [picked, setPicked] = useState({}); // { [question key]: option value }
  const pk = Object.fromEntries(engagements.packages.map((p) => [p.slug, { name: p.name, short: p.short, interest: p.cta.interest }]));

  // The browser may restore checked radios (back/forward, form restore) before hydration: sync once after mount.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const restored = {};
    form.querySelectorAll("input[type=radio]:checked").forEach((el) => { restored[el.name] = el.value; });
    if (Object.keys(restored).length) setPicked(restored);
  }, []);

  const option = (name) => {
    const q = sel.questions.find((x) => x.key === name);
    return q && picked[name] !== undefined ? q.options.find((o) => o.value === picked[name]) : undefined;
  };
  const need = option("need"), start = option("start"), where = option("where");
  const slugs = [];
  [need && need.adds, need && need.also, start && start.adds].forEach((s) => { if (s && !slugs.includes(s) && slugs.length < 2) slugs.push(s); });
  const hasResult = slugs.length > 0;
  const ready = Boolean(need && start && where);

  let title = t("selector.answer");
  let ctaHref = "/contact/";
  if (hasResult) {
    title = slugs.map((s) => pk[s].name).join(" + ") + (where ? ` — ${where.label}` : "");
    const params = new URLSearchParams({ topic: `${title}${start ? ` (${t("selector.startingPoint", { value: start.label })})` : ""}` });
    const interest = pk[slugs[0]].interest;
    if (interest) params.set("interest", interest);
    ctaHref = `/contact/?${params}`;
  }
  // Before any answer the CTA is disabled exactly as rendered on the server.
  const disabled = !hasResult || !ready;

  return (
    <section className={`section selector theme-${theme}`} data-theme={theme} id="selector" aria-labelledby="selector-title">
      <div className="container">
        <SectionHead label={sel.label} title={sel.title} id="selector-title" />
        <form className="selector__form" noValidate ref={formRef} onSubmit={(e) => e.preventDefault()}>
          {sel.questions.map((q, qi) => (
            <fieldset key={q.key} className="selector__q">
              <legend className="selector__legend"><span className="micro color-white-40">{pad2(qi + 1)}</span><span className="h4">{q.title}</span></legend>
              <div className="selector__opts">
                {q.options.map((o) => (
                  <label key={o.value} className="opt">
                    <input type="radio" name={q.key} value={o.value} data-adds={o.adds || undefined} data-also={o.also || undefined} data-label={o.label} onChange={() => setPicked((p) => ({ ...p, [q.key]: o.value }))} />
                    <span className="opt__pill body-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className={`selector__result${hasResult && ready ? " is-ready" : ""}`} aria-live="polite">
            <p className="micro color-white-50">{t("selector.recommended")}</p>
            <p className="h3 selector__title">{title}</p>
            <ul className="selector__packages" role="list">
              {hasResult ? slugs.map((s) => <li key={s}><L href={`/engagements/${s}/`}><span className="body-lg">{pk[s].name}</span><span className="body-sm color-white-60">{pk[s].short}</span></L></li>) : null}
            </ul>
            <p className="body-sm color-white-60">{sel.scopeNote}</p>
            <L className={`btn-primary${disabled ? " is-disabled" : ""}`} href={ctaHref} aria-disabled={disabled ? "true" : "false"}><span className="button-sm">{sel.cta}</span><span className="btn-icon"><Icon name="spark" /></span></L>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- service groups (engagement detail) */

export function Groups({ gs, label, title, theme = "light" }) {
  const { t } = useContent();
  if (label === undefined) label = t("groups.label");
  if (title === undefined) title = t("groups.title");
  return (
    <section className={`section theme-${theme}`} data-theme={theme} aria-labelledby="scope-title">
      <div className="container">
        <SectionHead label={label} title={title} id="scope-title" />
        <div className={`groups groups--${Math.min(gs.length, 4)}`}>
          {gs.map((g, i) => (
            <div key={i} className="groups__col" data-anim="fade-up">
              <span className="micro color-white-40">{pad2(i + 1)}</span>
              <h3 className="h4">{g.title}</h3>
              <ul className="dot-list body-md color-white-60" role="list">{g.items.map((x, k) => <li key={k}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { num, slugify };
