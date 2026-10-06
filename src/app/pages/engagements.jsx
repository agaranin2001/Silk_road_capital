import { useContent } from "../../i18n/context.jsx";
import { Icon } from "../icons.jsx";
import { BtnPrimary, BtnOutline, contactHref, SplitHead, pad2 } from "../ui.jsx";
import {
  PageHero, Levels, PackageGrid, PackageSelector, Flagship, Solutions, CommercialModels, CtaSection, Steps, Groups, RelatedEngagements,
} from "../sections.jsx";

function EngagementsHub() {
  const { engagements: e, home, t } = useContent();
  const featured = e.packages.filter((p) => !p.flagship);
  return (
    <>
      <PageHero
        label={e.intro.label}
        title={e.intro.title}
        lead={e.intro.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.engagements") }]}
        actions={[
          <BtnPrimary key="find" label={t("eng.find")} href="#selector" />,
          <BtnOutline key="commercial" label={t("eng.commercial")} href="#commercial" />,
        ]}
      />
      <Levels ph={e.philosophy} />
      <PackageSelector sel={e.selector} />
      <section className="section theme-light" data-theme="light" aria-labelledby="all-title">
        <div className="container">
          <SplitHead label={t("eng.modelsLabel")} title={t("eng.modelsTitle")} text={t("eng.modelsText")} id="all-title" />
          <PackageGrid items={featured} />
        </div>
      </section>
      <Flagship p={e.packages.find((p) => p.flagship)} />
      <Solutions s={e.solutions} />
      <CommercialModels c={e.commercial} />
      <CtaSection f={{ ...home.final, primary: { label: t("eng.discuss"), href: "/contact/" } }} />
    </>
  );
}

function EngagementPage({ p }) {
  const { home, contact, t } = useContent();
  const ctaHref = contactHref(contact, { ...p.cta, topic: p.name });
  return (
    <>
      <PageHero
        label={`${p.mode} / ${p.name}`}
        title={p.headline}
        lead={p.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.engagements"), href: "/engagements/" }, { label: p.name }]}
        actions={[<BtnPrimary key="cta" label={p.cta.label} href={ctaHref} />]}
        aside={<p className="body-sm page-hero__client"><span className="micro color-white-50">{t("idealClient")}</span>{p.idealClient}</p>}
      />
      {p.markets ? (
        <section className="section section--tight theme-light" data-theme="light" aria-labelledby="mk-title">
          <div className="container includes">
            <h2 className="micro color-white-50" id="mk-title">{t("eng.marketsFor")}</h2>
            <ul className="includes__list" role="list">{p.markets.map((m, i) => <li className="body-lg" key={i}>{m}</li>)}</ul>
          </div>
        </section>
      ) : null}
      {p.steps ? <Steps label={t("eng.process")} title={p.flagship ? t("eng.completeChain") : t("eng.howRuns")} items={p.steps} id="process" /> : null}
      {p.chain ? <Flagship p={{ ...p, headline: t("eng.completeChain"), lead: t("eng.chainLead") }} label={t("groups.label")} link={false} /> : null}
      {p.groups ? <Groups gs={p.groups} theme={p.steps ? "dark" : "light"} /> : null}
      {p.models ? (
        <section className="section theme-dark" data-theme="dark" aria-labelledby="jvm-title">
          <div className="container">
            <SplitHead label={t("eng.jvLabel")} title={t("eng.jvTitle")} id="jvm-title" />
            <ul className="models models--compact" role="list">{p.models.map((m, i) => {
              const [a, b] = m.split(/\s\+\s/);
              return (
                <li className="models__item" data-anim="fade-up" key={i}>
                  <p className="models__pair h4"><span>{a}</span>{b ? <><span className="models__plus" aria-hidden="true">+</span><span>{b}</span></> : null}</p>
                </li>
              );
            })}</ul>
          </div>
        </section>
      ) : null}
      {p.note ? (
        <section className="section section--tight theme-light" data-theme="light">
          <div className="container"><p className="notice notice--large body-md"><Icon name="doc" className="notice__icon" /><span>{p.note}</span></p></div>
        </section>
      ) : null}
      <section className="section theme-light section--raised" data-theme="light" aria-labelledby="deliv-title">
        <div className="container deliverables">
          <div>
            <SplitHead label={t("eng.getLabel")} title={t("eng.getTitle")} text={t("eng.getText")} id="deliv-title" />
          </div>
          <details className="disclosure disclosure--large" open>
            <summary className="button-sm"><span>{t("eng.showDeliverables")}</span><span className="disclosure__count color-white-40">{p.deliverables.length}</span><Icon name="plus" className="disclosure__icon" /></summary>
            <ol className="deliverables__list" role="list">{p.deliverables.map((d, i) => <li className="body-lg" key={i}><span className="micro color-white-40">{pad2(i + 1)}</span>{d}</li>)}</ol>
          </details>
        </div>
      </section>
      <RelatedEngagements slugs={p.related} title={t("eng.combined")} />
      <CtaSection f={{ ...home.final, title: t("eng.ctaTitle"), text: t("eng.ctaText"), primary: { label: p.cta.label, href: ctaHref }, secondary: { label: t("menu.allEngagements"), href: "/engagements/" } }} />
    </>
  );
}

export default function pages(c) {
  const { engagements, packageBySlug, t } = c;
  // packageBySlug is used by components; checking here keeps related slugs validated at build time.
  engagements.packages.forEach((p) => p.related.forEach((s) => { if (!packageBySlug(s)) throw new Error(`Unknown engagement "${s}" in ${p.slug}.related`); }));
  return [
    { path: "/engagements/", title: t("eng.seoTitle"), description: t("eng.seoDesc"), element: <EngagementsHub /> },
    ...engagements.packages.map((p) => ({
      path: `/engagements/${p.slug}/`,
      title: t("eng.detailTitle", { name: p.name }),
      description: `${p.short} ${p.lead}`.slice(0, 300),
      element: <EngagementPage p={p} />,
    })),
  ];
}
