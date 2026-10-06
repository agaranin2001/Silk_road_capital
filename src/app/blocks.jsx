import { useContent } from "../i18n/context.jsx";
import { Icon } from "./icons.jsx";
import { L, Img, Flag, Lines, FitLabel, contactHref, pad2 } from "./ui.jsx";

/*
 * Page blocks modelled on the mollie.com component set (layout, spacing, radii,
 * type scale and interaction patterns); fonts and colours are Silk Road's own.
 *
 *   MHero          eyebrow + display title | lead + pill buttons, rounded photo with floating status chips
 *   MMarquee       scrolling strip (Mollie's logo bar)
 *   MLinkGrid      bordered 5×2 grid of icon links (Mollie's product index)
 *   MPair          two beige feature cards with eyebrow, title, orange link and a visual
 *   MWide          full-width beige card: centred title, fanned cards, hairline list, link
 *   MTabsSplit     left: title + auto-advancing accordion, right: dark panel with UI card
 *   MStories       centred title + snap carousel of photo cards with caption (customer stories)
 *   MGlow          dark panel with radial glow, centred title and a glass card
 *   MSupport       round photo stack, centred title, three bordered columns
 *   MCta           beige CTA card with a bordered side column
 *   MTiles         three photo tiles with caption and round arrow
 */

export const Btn = ({ label, href, variant = "dark", className = "" }) => (
  <L className={`m-btn m-btn--${variant} ${className}`} href={href}>{label}</L>
);

export const MLink = ({ label, href }) => (
  <L className="m-link" href={href}>{label}<Icon name="chevronRight" className="m-link__icon" /></L>
);

export const Eyebrow = ({ text, className = "" }) => (
  <FitLabel as="p" className={`m-eyebrow ${className}`.trim()}>{text}</FitLabel>
);

/** Number that counts up when its mock-up comes into view ("4 min" → 4 + " min"). */
const Count = ({ value }) => {
  const m = /^([\d.]+)(.*)$/.exec(String(value));
  return m ? <b data-count={m[1]} data-suffix={m[2]}>{value}</b> : <b>{value}</b>;
};

/* -------------------------------------------------------------------- hero */

export function MHero(props) {
  const { t } = useContent();
  const { eyebrow: eb, title, text, primary, secondary, image, imageAlt, cases = [], tag = t("illustrative"), level = "h1", crumbs = [] } = props;
  const Level = level;
  return (
    <section className="m-hero" aria-labelledby="hero-title">
      <div className="m-wrap">
        {crumbs.length ? (
          <nav className="m-crumbs" aria-label={t("aria.breadcrumbs")}>
            {crumbs.map((c, i) => (c.href ? <L key={i} href={c.href}>{c.label}</L> : <span key={i} aria-current="page">{c.label}</span>))}
          </nav>
        ) : null}
        <div className="m-hero__head">
          <div className="m-hero__title-wrap">
            <Eyebrow text={eb} />
            <Level className="m-display" id="hero-title" data-anim="intro-title">
              {Array.isArray(title) ? title.map((line, i) => <span key={i} className="m-display__line">{line}</span>) : <Lines text={title} />}
            </Level>
          </div>
          <div className="m-hero__aside" data-anim="intro-text">
            {text ? (Array.isArray(text) ? text : [text]).map((p, i) => <p key={i} className="m-hero__text">{p}</p>) : null}
            {primary || secondary ? (
              <div className="m-btns">
                {primary ? <Btn {...primary} variant="dark" /> : null}
                {secondary ? <Btn {...secondary} variant="light" /> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {cases.length ? (
        <div className="m-hero__media" data-anim="intro-media" data-hero-cases="">
          {cases.map((c, n) => (
            <div key={n} className={`m-case ${n === 0 ? "is-active" : ""}`} aria-hidden={n === 0 ? undefined : "true"} data-case="">
              <Img file={c.image} alt={c.imageAlt} className="m-hero__img" eager={n === 0} sizes="(max-width: 809px) 100vw, 1440px" />
              <ul className="m-chips" role="list" data-chips="">
                {c.chips.map((chip, i) => (
                  <li key={i} className="m-chip" style={{ "--i": i }}><Icon name="checkCircle" className="m-chip__icon" /><span>{chip}</span></li>
                ))}
              </ul>
              <div className="m-hero__card">
                <div className="m-ui__top"><span className="m-ui__title"><span className="m-ui__icon"><Icon name={c.icon} /></span>{c.service}</span><span className="m-ui__tag">{tag}</span></div>
                <ol className="m-steps" role="list">
                  {c.steps.map((st, j) => (
                    <li key={j} className={`m-steps__item is-${st.state}`} style={{ "--i": j }}>
                      <span className="m-steps__dot">{st.state === "done" ? <Icon name="check" /> : null}</span>
                      {st.name}
                      <span className="m-steps__state">{t(`state.${st.state}`)}</span>
                    </li>
                  ))}
                </ol>
                <L className="m-hero__card-link" href={c.href} tabIndex={n === 0 ? undefined : "-1"}>{t("explore", { name: c.service })}<Icon name="chevronRight" /></L>
              </div>
            </div>
          ))}
          {cases.length > 1 ? (
            <div className="m-case-dots" aria-hidden="true">
              {cases.map((c, n) => <span key={n} className={`m-case-dot ${n === 0 ? "is-active" : ""}`} title={c.service}><Icon name={c.icon} /></span>)}
            </div>
          ) : null}
        </div>
      ) : image ? (
        <div className="m-hero__media" data-anim="intro-media">
          <Img file={image} alt={imageAlt} className="m-hero__img" eager sizes="(max-width: 809px) 100vw, 1440px" />
        </div>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------- marquee */

export function MMarquee(props) {
  const { t } = useContent();
  const { items, label = t("aria.markets") } = props;
  return (
    <nav className="m-marquee" aria-label={label}>
      <div className="m-marquee__track">
        {[0, 1].flatMap((copy) => items.map((m, i) => (
          <L key={`${copy}-${i}`} className="m-marquee__item" href={m.href} aria-hidden={copy ? "true" : undefined} tabIndex={copy ? "-1" : undefined}>
            <Flag code={m.flag} className="m-marquee__flag" />{m.name}
          </L>
        )))}
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------- link grid */

export function MLinkGrid(props) {
  const { t } = useContent();
  const { links, label = t("aria.capabilities") } = props;
  return (
    <nav className="m-wrap m-section m-section--tight" aria-label={label} id="capabilities">
      <ul className="m-linkgrid" role="list">
        {links.map((l, i) => (
          <li key={i}><L className="m-linkgrid__item" href={l.href}><Icon name={l.icon} className="m-linkgrid__icon" /><span>{l.label}</span></L></li>
        ))}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------- feature visuals (HTML UI mock-ups) */

const VisDeals = () => {
  const { opportunities } = useContent();
  return (
    <div className="m-vis m-vis--deals" aria-hidden="true">
      {opportunities.items.slice(0, 4).map((o, i) => (
        <div key={i} className="m-ui m-deal" style={{ "--i": i }}>
          <span className="m-deal__thumb"><Img file={o.image} alt="" sizes="80px" /></span>
          <span className="m-deal__body"><b>{o.sector}</b><small>{`${o.country} · ${o.type}`}</small></span>
          <span className="m-ui__pill">{o.status}</span>
        </div>
      ))}
    </div>
  );
};

const VisMarket = () => {
  const { t } = useContent();
  const bars = [[t("vis.market.attractiveness"), 86], [t("vis.market.partners"), 72], [t("vis.market.regulatory"), 64], [t("vis.market.competition"), 48]];
  return (
    <div className="m-vis m-vis--market" aria-hidden="true">
      <div className="m-ui m-ui--panel">
        <div className="m-ui__top"><span className="m-ui__title">{t("vis.market.title")}</span><span className="m-ui__tag">{t("illustrative")}</span></div>
        {bars.map(([k, v], i) => (
          <div key={i} className="m-bar" style={{ "--i": i }}><span>{k}</span><span className="m-bar__track"><span className="m-bar__fill" style={{ "--v": `${v}%` }}></span></span><Count value={v} /></div>
        ))}
        <div className="m-ui__foot"><span>{t("vis.market.recommendation")}</span><b>{t("vis.market.result")}</b></div>
      </div>
    </div>
  );
};

const VisSystems = () => {
  const { t } = useContent();
  return (
    <div className="m-vis m-vis--systems" aria-hidden="true">
      <div className="m-ui m-ui--panel">
        <div className="m-ui__top"><span className="m-ui__title">{t("vis.systems.title")}</span><span className="m-ui__tag">{t("illustrative")}</span></div>
        <div className="m-flow">
          {["CRM", "ERP", t("vis.systems.portal"), t("vis.systems.finance"), t("vis.systems.data")].map((n, i) => <span key={i} className="m-flow__node" style={{ "--i": i }}>{n}</span>)}
          <span className="m-flow__hub"><Icon name="spark" /></span>
        </div>
        <div className="m-ui__foot"><span>{t("vis.systems.removed")}</span><b>{t("vis.systems.result")}</b></div>
      </div>
    </div>
  );
};

const VisProduct = () => {
  const { t } = useContent();
  return (
    <div className="m-vis m-vis--product" aria-hidden="true">
      <div className="m-ui m-app">
        <div className="m-app__bar"><span></span><span></span><span></span></div>
        <div className="m-app__body">
          <div className="m-app__side">
            {[t("vis.app.overview"), t("vis.app.partners"), t("vis.app.orders"), t("vis.app.reports")].map((n, i) => <span key={i} className={i === 0 ? "is-on" : ""}>{n}</span>)}
          </div>
          <div className="m-app__main">
            <div className="m-app__kpis"><span><small>{t("vis.app.activePartners")}</small><Count value={24} /></span><span><small>{t("vis.app.ordersWeek")}</small><Count value={318} /></span></div>
            <div className="m-app__chart">{[30, 52, 41, 66, 58, 74, 88].map((h, i) => <i key={i} style={{ "--h": `${h}%`, "--i": i }}></i>)}</div>
            <span className="m-app__cta">{t("vis.app.launch")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VIS = { deals: VisDeals, market: VisMarket, systems: VisSystems, product: VisProduct };

export const MPair = ({ cards }) => (
  <div className="m-wrap m-pair">
    {cards.map((c, i) => {
      const Vis = VIS[c.visual];
      return (
        <article key={i} className="m-card m-feature" data-anim="fade-up">
          <div className="m-feature__text">
            <Eyebrow text={c.eyebrow} />
            <h2 className="m-h3"><Lines text={c.title} /></h2>
            <MLink {...c.link} />
          </div>
          <Vis />
        </article>
      );
    })}
  </div>
);

/* -------------------------------------------------------------------- wide card */

// <MWide w={home.wide} id="jv" /> (the old positional `w`); the card's keys may also be passed flat.
export const MWide = ({ w, id = "wide", ...flat }) => {
  const { eyebrow: eb, title, fan, lines: items, link } = w ?? flat;
  return (
    <section className="m-wrap m-section--flush" aria-labelledby={`${id}-title`}>
      <div className="m-card m-wide">
        <Eyebrow text={eb} />
        <h2 className="m-h2" id={`${id}-title`} data-anim="chars"><Lines text={title} /></h2>
        <div className="m-fan" aria-hidden="true">
          {fan.map((f, i) => (
            <span key={i} className={`m-fan__card m-fan__card--${i}`} style={{ "--i": i - (fan.length - 1) / 2, "--n": i }}>
              <span className="m-fan__mark"><Icon name="star8" /></span><span className="m-fan__label">{f}</span><span className="m-fan__brand">Silk Road Capital</span>
            </span>
          ))}
        </div>
        <ul className="m-hairlist" role="list">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
        <MLink {...link} />
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- tabs split */

/** Auto-advancing accordion (left) driving a dark panel with UI cards (right). */
export const MTabsSplit = ({ id, eyebrow: eb, title, text, link, items, renderPanel }) => (
  <section className="m-wrap m-section m-split" aria-labelledby={`${id}-title`} data-autotabs="">
    <div className="m-split__left">
      <Eyebrow text={eb} />
      <h2 className="m-h2s" id={`${id}-title`} data-anim="chars"><Lines text={title} /></h2>
      {text ? <p className="m-lead">{text}</p> : null}
      <div className="m-acc" role="tablist" aria-label={title.replace(/\n/g, " ")} aria-orientation="vertical">
        {items.map((it, i) => (
          <button key={i} type="button" role="tab" className="m-acc__item" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={i === 0 ? "true" : "false"} tabIndex={i === 0 ? "0" : "-1"}>
            <span className="m-acc__title">{it.title}{it.badge ? <span className="m-badge">{it.badge}</span> : null}</span>
            <span className="m-acc__text">{it.text}</span>
            <span className="m-acc__bar"><span></span></span>
          </button>
        ))}
      </div>
      {link ? <MLink {...link} /> : null}
    </div>
    <div className="m-split__panel">
      {items.map((it, i) => (
        <div key={i} role="tabpanel" className={`m-split__view ${i === 0 ? "is-active" : ""}`} id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} tabIndex="0">{renderPanel(it, i)}</div>
      ))}
    </div>
  </section>
);

// Pathway card with an illustrative photo beside it (decorative, hidden on phones).
export const NeedsPanel = ({ n }) => {
  const { t } = useContent();
  return (
    <div className="m-need-stage">
      <NeedsCard n={n} />
      {n.image ? (
        <figure className="m-need__photo" aria-hidden="true"><Img file={n.image} alt="" sizes="(max-width: 1199px) 40vw, 360px" /><figcaption className="m-ui__tag">{t("illustrative")}</figcaption></figure>
      ) : null}
    </div>
  );
};

const NeedsCard = ({ n }) => {
  const { t, contact, packageBySlug } = useContent();
  return (
    <div className="m-ui m-ui--panel m-need">
      <div className="m-ui__top"><span className="m-ui__title">{t("need.title")}</span><span className="m-ui__tag">{t(`need.${n.key}`)}</span></div>
      <ol className="m-chain" role="list">{n.pathway.map((p, i) => <li key={i} style={{ "--i": i }}><span className="m-chain__n">{pad2(i + 1)}</span>{p}</li>)}</ol>
      <div className="m-need__eng">
        {/* inside the .m-ui mock-up: a plain label, not FitLabel */}
        <p className="m-eyebrow">{t("need.engagement")}</p>
        {n.engagements.map((s, i) => {
          const p = packageBySlug(s);
          return (
            <L key={i} className="m-need__pkg" style={{ "--i": i + n.pathway.length }} href={`/engagements/${p.slug}/`}>
              <b>{p.name}</b><small>{p.short}</small><Icon name="chevronRight" className="m-need__chev" />
            </L>
          );
        })}
      </div>
      <Btn label={n.cta.label} href={contactHref(contact, n.cta)} className="m-btn--block" />
    </div>
  );
};

export const AiPanel = ({ stage, i, ai }) => {
  const { t } = useContent();
  const d = ai.dashboard;
  const max = Math.max(...d.bars);
  return (
    <div className="m-ui m-ui--panel m-dash">
      <div className="m-ui__top"><span className="m-ui__title">{d.title}</span><span className="m-ui__tag">{d.tag}</span></div>
      <p className="m-dash__stage"><span>{t("ai.stage", { n: pad2(i + 1) })}</span>{stage.title}</p>
      <div className="m-dash__kpis">{d.kpis.map((k, j) => <div key={j} style={{ "--i": j }}><small>{k.label}</small><Count value={k.value} /><em>{k.delta}</em></div>)}</div>
      <div className="m-dash__chart">{d.bars.map((b, j) => <i key={j} className={j <= i + 3 ? "is-on" : ""} style={{ "--h": `${Math.round((b / max) * 100)}%`, "--i": j }}></i>)}</div>
      <ul className="m-dash__agents" role="list">
        {d.agents.map((a, j) => (
          <li key={j} style={{ "--i": j + 3 }}><b>{a.name}</b><span>{a.task}</span><em className={j <= i ? "is-live" : ""}>{j <= i ? a.status : t("ai.planned")}</em></li>
        ))}
      </ul>
    </div>
  );
};

/* -------------------------------------------------------------------- stories carousel */

// Cards: { title, text, meta, image, href }. Defaults to the illustrative opportunities.
const opportunityStory = (o) => ({ title: o.sector, text: o.summary, meta: `${o.country} · ${o.type} · ${o.status}`, image: o.image, href: `/opportunities/${o.slug}/`, quote: true });

export const MStories = ({ eyebrow: eb, title, note, items }) => {
  const { t, opportunities } = useContent();
  return (
    <section className="m-section m-stories" aria-labelledby="stories-title">
      <div className="m-wrap m-center">
        <FitLabel as="p" className="m-pill-eyebrow">{eb}</FitLabel>
        <h2 className="m-h2" id="stories-title" data-anim="chars"><Lines text={title} /></h2>
      </div>
      <div className="m-carousel" data-carousel="">
        <div className="m-carousel__track" data-lenis-prevent-horizontal="">
          {(items ?? opportunities.items.map(opportunityStory)).map((o, i) => (
            <article key={i} className="m-story">
              <L className="m-story__media" href={o.href} tabIndex="-1" aria-hidden="true">
                <Img file={o.image} alt="" sizes="(max-width: 809px) 85vw, 650px" />
                {o.quote ? <span className="m-story__tag">{t("illustrative")}</span> : null}
              </L>
              <p className="m-story__brand"><L href={o.href}>{o.title}</L></p>
              <p className={o.quote ? "m-story__quote" : "m-story__quote m-story__quote--plain"}>{o.text}</p>
              <p className="m-story__meta">{o.meta}</p>
            </article>
          ))}
        </div>
        <div className="m-carousel__nav">
          <button type="button" className="m-round" data-carousel-prev="" aria-label={t("aria.previous")}><Icon name="chevronLeft" /></button>
          <button type="button" className="m-round" data-carousel-next="" aria-label={t("aria.next")}><Icon name="chevronRight" /></button>
        </div>
      </div>
      {note ? <div className="m-wrap"><p className="m-note"><Icon name="lock" className="m-note__icon" /><span>{note}</span></p></div> : null}
    </section>
  );
};

/* -------------------------------------------------------------------- glow panel */

export const MGlow = ({ title, text, card, id = "glow" }) => (
  <section className="m-wrap m-section" aria-labelledby={`${id}-title`}>
    <div className="m-glow">
      <div className="m-glow__orb" aria-hidden="true"></div>
      <div className="m-glow__in">
        <h2 className="m-h2" id={`${id}-title`} data-anim="chars"><Lines text={title} /></h2>
        <p className="m-glow__text">{text}</p>
        {card ? (
          <L className="m-glass" href={card.link.href}>
            <span className="m-glass__body"><b>{card.title}</b><span>{card.text}</span></span>
            <span className="m-glass__icon"><Icon name="lock" /></span>
          </L>
        ) : null}
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------- support */

/* How-to-start pipeline illustrations (240×180 SVG, animated in main.css under .m-pipe).
 * Static markup strings, rendered into the <svg class="m-art"> with dangerouslySetInnerHTML. */
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

export const MSupport = ({ places = [], title, text, steps = [], cta, id = "support" }) => {
  const { t } = useContent();
  return (
    <section className="m-wrap m-section m-support" aria-labelledby={`${id}-title`}>
      {places.length ? <div className="m-faces" aria-hidden="true">{places.map((p, i) => <span key={i} className="m-faces__item"><Img file={p} alt="" sizes="64px" /></span>)}</div> : null}
      <FitLabel as="p" className="m-pill-eyebrow">{t("support.eyebrow")}</FitLabel>
      <h2 className="m-h2" id={`${id}-title`} data-anim="chars"><Lines text={title} /></h2>
      <p className="m-lead m-support__text">{text}</p>
      <ol className="m-pipe" role="list">
        {steps.map((st, i) => (
          <li key={i} className="m-pipe__step" style={{ "--i": i }}>
            <div className="m-pipe__media">
              <div className={`m-pipe__tile m-pipe__tile--${st.tone}`}><svg className="m-art" viewBox="0 0 240 180" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: PIPE_ART[st.art] ?? "" }} /></div>
              {i < steps.length - 1 ? <span className="m-pipe__link" aria-hidden="true"></span> : null}
            </div>
            <p className="m-pipe__title"><span className="m-pipe__num">{pad2(i + 1)}</span>{st.name}</p>
            <p className="m-pipe__text">{st.text}</p>
          </li>
        ))}
      </ol>
      {cta ? <div className="m-btns m-support__cta"><Btn {...cta} variant="dark" /></div> : null}
    </section>
  );
};

/* -------------------------------------------------------------------- CTA card */

/** Portrait shown on the right of every CTA card (assets/img/adham-*.webp, made from Adham.png). */
const CTA_PHOTO = (t) => ({ alt: t("cta.photoAlt") });

export function MCta(props) {
  const { t } = useContent();
  const { title, text, primary, secondary, side, photo = CTA_PHOTO(t), id = "cta" } = props;
  return (
    <section className="m-wrap m-section" aria-labelledby={`${id}-title`}>
      <div className="m-card m-cta">
        <div className="m-cta__main">
          <h2 className="m-h2" id={`${id}-title`} data-anim="chars"><Lines text={title} /></h2>
          {text ? <p className="m-lead">{text}</p> : null}
          <div className="m-btns"><Btn {...primary} variant="dark" />{secondary ? <MLink {...secondary} /> : null}</div>
        </div>
        {photo ? (
          <figure className="m-cta__photo"><img src="/assets/img/adham-1200.webp" srcSet="/assets/img/adham-600.webp 600w, /assets/img/adham-1200.webp 1200w" sizes="(max-width: 1199px) 100vw, 460px" width="1200" height="1200" alt={photo.alt} loading="lazy" decoding="async" /></figure>
        ) : side ? (
          <div className="m-cta__side"><b>{side.title}</b><span>{side.text}</span><MLink {...side.link} /></div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- tiles */

export function MTiles(props) {
  const { t, markets } = useContent();
  const { tiles = markets.tiles, head = markets.tilesHead } = props;
  return (
    <section className="m-wrap m-section m-countries" aria-labelledby="countries-title" data-countries="">
      <div className="m-countries__head">
        <div><Eyebrow text={head.eyebrow} /><h2 className="m-h2s" id="countries-title" data-anim="chars">{head.title}</h2></div>
        <div className="m-carousel__nav m-countries__nav">
          <button type="button" className="m-round" data-countries-prev="" aria-label={t("aria.prevCountries")}><Icon name="chevronLeft" /></button>
          <button type="button" className="m-round" data-countries-next="" aria-label={t("aria.nextCountries")}><Icon name="chevronRight" /></button>
        </div>
      </div>
      <ul className="m-countries__track" role="list" data-countries-track="" data-lenis-prevent-horizontal="">
        {tiles.map((tile, i) => (
          <li key={i}>
            <L className="m-tile" href={tile.href}>
              <Img file={tile.image} alt="" sizes="(max-width: 809px) 80vw, 30vw" />
              <span className="m-tile__label"><Flag code={tile.flag} className="m-tile__flag" />{tile.name}</span>
              <span className="m-tile__arrow"><Icon name="arrow" /></span>
            </L>
          </li>
        ))}
      </ul>
    </section>
  );
}
