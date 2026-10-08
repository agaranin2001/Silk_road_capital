import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useContent } from "../../i18n/context.jsx";
import { Icon } from "../icons.jsx";
import { BtnPrimary, BtnSecondary, contactHref, SplitHead, FitLabel, Lines, L, Img } from "../ui.jsx";
import { PageHero, OpportunityCard, CtaSection, PartnerBadge, MarketMap } from "../sections.jsx";
import { MGlow } from "../blocks.jsx";


/* ------------------------------------------------------------ section extras
 * Each detail section can carry a visual: product screens (overview), the regional map (market),
 * the business model with revenue streams and an investment calculator (business), the deal flow (structure) and the process (next steps). */

/** Product screens from Nordic AI: swipeable, one screen per swipe, with arrows. */
function OppGallery({ items }) {
  const { t } = useContent();
  const track = useRef(null);
  const go = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth;
    const rtl = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: rtl * dir * step, behavior: "smooth" });
  };
  return (
    <figure className="opp-gallery" aria-label={t("opp.galleryLabel")}>
      <ul className="opp-gallery__track" role="list" ref={track} data-lenis-prevent-horizontal="">
        {items.map((g, i) => (
          <li className="opp-gallery__item" key={i}>
            <span className="opp-gallery__img"><Img file={g.image} alt={g.caption} sizes="(max-width: 809px) 90vw, 760px" /></span>
            <span className="opp-gallery__caption body-sm"><span className="micro color-white-40">{String(i + 1).padStart(2, "0")}</span>{g.caption}</span>
          </li>
        ))}
      </ul>
      {items.length > 1 ? (
        <div className="opp-gallery__nav">
          <button type="button" className="m-round" aria-label={t("aria.previousScreen")} onClick={() => go(-1)}><Icon name="chevronLeft" /></button>
          <button type="button" className="m-round" aria-label={t("aria.nextScreen")} onClick={() => go(1)}><Icon name="chevronRight" /></button>
        </div>
      ) : null}
    </figure>
  );
}

/** Map focused on the opportunity's cities; one chip per country — hovering/focusing it pulses that country's cities. */
function OppMap({ geo }) {
  const { marketsBase, t } = useContent();
  const [active, setActive] = useState(null);
  const countryOf = (city) => marketsBase.points.find((p) => p.name === city)?.country;
  const countries = [...new Set(geo.map(countryOf).filter(Boolean))];
  const citiesOf = (c) => geo.filter((city) => countryOf(city) === c);
  return (
    <div className="opp-map">
      <MarketMap focus={geo} countries zoom active={active ? citiesOf(active) : null} />
      <ul className="opp-map__chips" role="list" aria-label={t("opp.mapLabel")}>
        {countries.map((c) => (
          <li key={c}>
            <button type="button" className={`chip chip--button body-sm${active === c ? " is-active" : ""}`} onMouseEnter={() => setActive(c)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(c)} onBlur={() => setActive(null)} onClick={() => setActive(active === c ? null : c)}>
              <span className="opp-map__dot" aria-hidden="true"></span>{t(`country.${c}`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Business model: revenue-stream mix plus a 3-year investment calculator for a chosen GCC market.
 * Illustrative model (opportunities.json "model"): revenue = base × market factor × growth[year] ×
 * scenario.revenue × (investment / refInvestment)^scaleExp; operating profit = revenue × margin[year].
 */
const STREAM_COLOURS = ["var(--accent)", "#f6be7e", "var(--ink)", "#8a9ea3"];
function BusinessModel({ model }) {
  const { opportunities, t, lang } = useContent();
  const cfg = opportunities.model;
  const [country, setCountry] = useState(cfg.countries[0].key);
  const [scenario, setScenario] = useState("base");
  const [investment, setInvestment] = useState(cfg.investment.default);
  const factor = cfg.countries.find((c) => c.key === country).factor;
  const sc = cfg.scenarios.find((x) => x.key === scenario);
  const scale = Math.pow(investment / cfg.refInvestment, cfg.scaleExp);
  const revenue = cfg.growth.map((g) => model.base * factor * g * sc.revenue * scale); // USD m
  const profit = revenue.map((r, i) => r * sc.margins[i]);
  const totalRevenue = revenue.reduce((a, b) => a + b, 0);
  const totalProfit = profit.reduce((a, b) => a + b, 0);
  const inv = investment / 1e6;
  const roi = Math.round((totalProfit / inv) * 100);
  let cum = 0;
  const paybackYear = profit.findIndex((p) => (cum += p) >= inv) + 1;
  // bars share one scale: the largest market, optimistic scenario, maximum investment
  const maxScale = Math.pow(cfg.investment.max / cfg.refInvestment, cfg.scaleExp);
  const max = model.base * Math.max(...cfg.countries.map((c) => c.factor)) * cfg.growth[cfg.growth.length - 1] * Math.max(...cfg.scenarios.map((x) => x.revenue)) * maxScale;
  const dec = (v) => ((lang === "ru" || lang === "uz") ? v.replace(".", ",") : v);
  const money = (v) => {
    const sign = v < 0 ? "−" : "";
    const a = Math.abs(v);
    return sign + (a < 1 ? t("opp.bm.moneyK", { value: Math.round(a * 1000) }) : t("opp.bm.money", { value: dec(a.toFixed(a < 10 ? 2 : 1)) }));
  };
  return (
    <figure className="bm" aria-label={t("opp.bm.label")}>
      <div className="bm__streams">
        <p className="micro color-white-50">{t("opp.bm.streams")}</p>
        <div className="bm__mix" aria-hidden="true">
          {model.streams.map((st, i) => <span key={st.key} style={{ flexGrow: st.share, background: STREAM_COLOURS[i % STREAM_COLOURS.length] }} />)}
        </div>
        <ul className="bm__legend" role="list">
          {model.streams.map((st, i) => (
            <li key={st.key}><span className="bm__swatch" style={{ background: STREAM_COLOURS[i % STREAM_COLOURS.length] }} /><span className="body-sm">{t(`opp.stream.${st.key}`)}</span><span className="bm__share body-sm">{st.share}%</span></li>
          ))}
        </ul>
      </div>
      <div className="bm__forecast calc">
        <p className="micro color-white-50">{t("opp.calc.title")}</p>
        <div className="calc__inputs">
          <div className="calc__field">
            <span className="body-sm color-white-50">{t("opp.bm.country")}</span>
            <div className="bm__countries" role="group" aria-label={t("opp.bm.country")}>
              {cfg.countries.map((c) => (
                <button type="button" key={c.key} className="pill-tab button-sm" aria-pressed={country === c.key ? "true" : "false"} onClick={() => setCountry(c.key)}>{t(`country.${c.key}`)}</button>
              ))}
            </div>
          </div>
          <div className="calc__field">
            <label className="calc__label body-sm color-white-50" htmlFor={`inv-${model.base}`}>
              <span>{t("opp.calc.investment")}</span>
              <output className="calc__amount" htmlFor={`inv-${model.base}`}>{money(inv)}</output>
            </label>
            <input
              id={`inv-${model.base}`}
              className="calc__range"
              type="range"
              min={cfg.investment.min}
              max={cfg.investment.max}
              step={cfg.investment.step}
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              style={{ "--p": `${(((investment - cfg.investment.min) / (cfg.investment.max - cfg.investment.min)) * 100).toFixed(1)}%` }}
            />
            <div className="calc__scale body-sm color-white-50"><span>{money(cfg.investment.min / 1e6)}</span><span>{money(cfg.investment.max / 1e6)}</span></div>
          </div>
          <div className="calc__field">
            <span className="body-sm color-white-50">{t("opp.calc.scenario")}</span>
            <div className="calc__seg" role="group" aria-label={t("opp.calc.scenario")}>
              {cfg.scenarios.map((x) => (
                <button type="button" key={x.key} className="calc__seg-btn button-sm" aria-pressed={scenario === x.key ? "true" : "false"} onClick={() => setScenario(x.key)}>{t(`scenario.${x.key}`)}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="bm__chart calc__chart">
          {revenue.map((v, i) => (
            <div className="bm__bar" key={i}>
              <span className="bm__value body-sm">{money(v)}</span>
              <span className={`bm__col${i === revenue.length - 1 ? " is-accent" : ""}`} style={{ height: `${Math.max(3, (v / max) * 100).toFixed(1)}%` }} />
              <span className="bm__year micro color-white-50">{t("opp.bm.year", { n: i + 1 })}</span>
              <span className={`calc__profit body-sm${profit[i] < 0 ? " is-negative" : ""}`}>{t("opp.calc.profitShort")}: {money(profit[i])}</span>
            </div>
          ))}
        </div>
        <dl className="bm__kpis calc__kpis">
          <div><dt className="body-sm color-white-50">{t("opp.calc.revenue")}</dt><dd className="h4">{money(totalRevenue)}</dd></div>
          <div><dt className="body-sm color-white-50">{t("opp.calc.profit")}</dt><dd className={`h4${totalProfit < 0 ? " is-negative" : ""}`}>{money(totalProfit)}</dd></div>
          <div><dt className="body-sm color-white-50">{t("opp.calc.roi")}</dt><dd className={`h4${roi < 0 ? " is-negative" : ""}`}>{roi}%</dd></div>
          <div><dt className="body-sm color-white-50">{t("opp.calc.payback")}</dt><dd className="h4">{paybackYear > 0 ? t("opp.calc.paybackYear", { n: paybackYear }) : t("opp.calc.paybackBeyond")}</dd></div>
        </dl>
        <p className="bm__note body-sm color-white-50">{t("opp.calc.note")}</p>
      </div>
    </figure>
  );
}

/** Block scheme of the deal: four parties/steps connected left to right (top to bottom on phones). */
function DealFlow({ partner }) {
  const { t } = useContent();
  const k = partner ? "p" : "i";
  return (
    <figure className="flow" aria-label={t("opp.flowLabel")}>
      <ol className="flow__list" role="list">
        {[1, 2, 3, 4].map((n) => (
          <li className={`flow__node${partner && n === 3 ? " flow__node--accent" : ""}`} key={n}>
            <span className="micro color-white-40">{String(n).padStart(2, "0")}</span>
            <span className="flow__title">{t(`opp.flow.${k}${n}`)}</span>
            <span className="body-sm color-white-60">{t(`opp.flow.${k}${n}t`)}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** Next steps as a numbered process. */
function NextSteps({ partner }) {
  const { t } = useContent();
  const k = partner ? "p" : "i";
  return (
    <ol className="process" role="list" aria-label={t("opp.stepsLabel")}>
      {[1, 2, 3, 4].map((n) => (
        <li className={`process__step${n === 1 ? " is-current" : ""}`} key={n}>
          <span className="process__num">{n}</span>
          <span className="body-sm">{t(`opp.step.${k}${n}`)}</span>
        </li>
      ))}
    </ol>
  );
}

// Marketplace: filter by investment area. The home page's area cards link here with ?category=…;
// the URL is read after mount (prerendered HTML shows all) and kept in sync when a filter is picked.
function OpportunitiesList() {
  const { opportunities: o, home, contact, t } = useContent();
  const [params, setParams] = useSearchParams();
  const [cat, setCat] = useState("");
  useEffect(() => {
    const c = params.get("category") || "";
    setCat(o.categories.some((x) => x.key === c) ? c : "");
  }, [params, o.categories]);
  const pick = (c) => {
    setCat(c);
    setParams(c ? { category: c } : {}, { replace: true, preventScrollReset: true });
  };
  const items = cat ? o.items.filter((it) => it.category === cat) : o.items;
  return (
    <>
      <PageHero
        label={o.intro.label}
        title={o.intro.title}
        lead={o.intro.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.opportunities") }]}
        stacked
        actions={[<BtnPrimary key="access" label={t("menu.requestAccess")} href={contactHref(contact, { interest: "investment", topic: t("opp.accessTopic") })} />]}
      />
      {/* marketplace sits on the page background (no dark panel) */}
      <section className="section section--flush-top theme-light" data-theme="light" aria-labelledby="opp-list-title">
        <div className="container">
          <h2 className="sr-only" id="opp-list-title">{t("opp.listTitle")}</h2>
          <div className="filter opp-filter" role="group" aria-label={t("opp.filter")}>
            <button type="button" className="pill-tab button-sm" aria-pressed={cat === "" ? "true" : "false"} onClick={() => pick("")}>{t("opp.all")}</button>
            {o.categories.map((c) => (
              <button type="button" key={c.key} className="pill-tab button-sm" aria-pressed={cat === c.key ? "true" : "false"} onClick={() => pick(c.key)}>
                {c.label}<span className="pill-tab__count">{o.items.filter((it) => it.category === c.key).length}</span>
              </button>
            ))}
          </div>
          <div className="opp-grid">{items.map((it) => <OpportunityCard o={it} key={it.slug} />)}</div>
        </div>
      </section>
      <MGlow {...home.glow} id="discretion" />
      <CtaSection f={{ ...home.final, title: t("opp.shareTitle"), text: t("opp.shareText"), primary: { label: t("opp.discuss"), href: contactHref(contact, { interest: "investment" }) }, secondary: null }} />
    </>
  );
}

function OpportunityPage({ it }) {
  const { opportunities: o, contact, partners, t } = useContent();
  // Partner products (Nordic AI) are real, ready-to-deploy products: no "illustrative" notice,
  // and a walkthrough request instead of a teaser.
  const partner = it.partner ? partners[it.partner] : null;
  const teaserHref = partner
    ? contactHref(contact, { interest: "digital", topic: t("opp.demoTopic", it) })
    : contactHref(contact, { interest: "investment", topic: t("opp.topic", it) });
  const ctaLabel = partner ? t("opp.demo") : t("opp.teaser");
  // Title, full-width product preview, then details on the left with the summary, actions and
  // key facts on the right, sticky through the whole page (stacked on small screens).
  return (
    <>
      <section className="m-hero m-hero--page opp-page" aria-labelledby="page-title">
        <div className="m-wrap">
          <nav className="m-crumbs" aria-label={t("aria.breadcrumbs")}>
            <L href="/">{t("crumb.home")}</L>
            <L href="/opportunities/">{t("crumb.opportunities")}</L>
            <span aria-current="page">{it.sector}</span>
          </nav>
          <div className="m-hero__title-wrap opp-page__title">
            <FitLabel as="p" className="m-eyebrow">{`${it.country} / ${it.type}`}</FitLabel>
            <h1 className="m-display m-display--page" id="page-title" data-anim="intro-title"><Lines text={it.sector} /></h1>
            {partner ? <PartnerBadge /> : null}
          </div>
        </div>
        {it.image ? (
          <div className="m-hero__media m-hero__media--page opp-page__media" data-anim="intro-media">
            <Img file={it.image} alt={it.sector} className="m-hero__img" eager sizes="(max-width: 809px) 100vw, 1440px" />
          </div>
        ) : null}
      </section>
      <section className="section section--tight theme-light opp-page" data-theme="light" aria-labelledby="opp-detail-title">
        <div className="container">
          <div className="opp-page__grid">
            <aside className="opp-page__aside" data-anim="intro-text">
              <p className="m-hero__text">{it.summary}</p>
              <div className="m-btns">
                <BtnPrimary label={ctaLabel} href={teaserHref} />
              </div>
              <dl className="meta-list meta-list--hero">{o.fields.map((f) => <div className="meta-list__row" key={f.key}><dt className="body-sm color-white-50">{f.label}</dt><dd className="body-sm">{it[f.key]}</dd></div>)}</dl>
            </aside>
            <div className="opp-detail__body opp-page__body">
              <h2 className="sr-only" id="opp-detail-title">{t("opp.details")}</h2>
              {o.sectionTitles.map((s, i) => (
                <section className="opp-detail__section" id={s.key} aria-labelledby={`${s.key}-h`} key={s.key}>
                  <span className="micro color-white-40">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h4" id={`${s.key}-h`}>{s.title}</h3>
                  <p className="body-lg color-white-60">{it.sections[s.key]}</p>
                  {s.key === "overview" && it.gallery ? <div className="opp-detail__extra"><OppGallery items={it.gallery} /></div> : null}
                  {s.key === "market" && it.geo ? <div className="opp-detail__extra"><OppMap geo={it.geo} /></div> : null}
                  {s.key === "business" && it.model ? <div className="opp-detail__extra"><BusinessModel model={it.model} /></div> : null}
                  {s.key === "structure" ? <div className="opp-detail__extra"><DealFlow partner={Boolean(partner)} /></div> : null}
                  {s.key === "next" ? <div className="opp-detail__extra"><NextSteps partner={Boolean(partner)} /></div> : null}
                </section>
              ))}
              <section className="opp-detail__section opp-detail__contact" id="contact-opp" aria-labelledby="contact-opp-h">
                <Icon name="lock" className="notice__icon" />
                <h3 className="h4" id="contact-opp-h">{t("opp.contact")}</h3>
                <p className="body-md color-white-60">{t("opp.contactText")}</p>
                <BtnSecondary label={ctaLabel} href={teaserHref} />
              </section>
            </div>
          </div>
        </div>
      </section>
      <section className="section theme-dark" data-theme="dark" aria-labelledby="more-opps">
        <div className="container">
          <SplitHead label={t("crumb.opportunities")} title={t("opp.other")} id="more-opps" />
          <div className="opp-grid">{[...o.items].filter((x) => x.slug !== it.slug).sort((a, b) => (b.category === it.category) - (a.category === it.category)).slice(0, 3).map((x) => <OpportunityCard o={x} key={x.slug} />)}</div>
        </div>
      </section>
    </>
  );
}

export default function pages(c) {
  const { opportunities, t } = c;
  return [
    { path: "/opportunities/", title: t("opp.seoTitle"), description: t("opp.seoDesc"), element: <OpportunitiesList /> },
    ...opportunities.items.map((it) => ({
      path: `/opportunities/${it.slug}/`,
      title: t(it.partner ? "opp.partnerTitle" : "opp.detailTitle", it),
      description: it.partner ? t("opp.partnerDesc", it) : t("opp.detailDesc", { ...it, type: it.type.toLowerCase() }),
      ogImage: it.image,
      element: <OpportunityPage it={it} />,
    })),
  ];
}
