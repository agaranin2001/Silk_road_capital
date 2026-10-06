import { useContent } from "../../i18n/context.jsx";
import { BtnPrimary, BtnOutline, SectionHead, Lines, MiniLabel, Heading } from "../ui.jsx";
import { PageHero, MarketAccess, SaudiBlock, UzbekistanBlock, CellGrid, OpportunityRail, CtaSection } from "../sections.jsx";

function MarketsPage() {
  const { markets, home, t } = useContent();
  const g = markets.gcc;
  return (
    <>
      <PageHero
        label={markets.hero.label}
        title={markets.hero.title}
        lead={markets.hero.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.markets") }]}
        actions={[
          <BtnPrimary key="plan" label={t("mk.plan")} href="/engagements/market-entry/" />,
          <BtnOutline key="saudi" label={t("mk.saudi")} href="#saudi-arabia" />,
        ]}
      />
      <MarketAccess />
      <section className="section theme-light" data-theme="light" id="gcc" aria-labelledby="gcc-title">
        <div className="container">
          <div className="editorial">
            <div className="editorial__head">
              <MiniLabel label={g.label} />
              <Heading level="h2" className="h2" id="gcc-title" anim="chars"><Lines text={g.title} /></Heading>
            </div>
            <p className="body-xl color-white-60 editorial__lead" data-anim="fade-up">{g.lead}</p>
          </div>
          <ul className="topics" role="list">
            {g.topics.map((tp, i) => (
              <li className="topics__item" data-anim="fade-up" key={i}><span className="micro color-white-40">{String(i + 1).padStart(2, "0")}</span><p className="body-lg">{tp.name}</p><p className="body-sm color-white-60">{tp.text}</p></li>
            ))}
          </ul>
        </div>
      </section>
      <SaudiBlock />
      <UzbekistanBlock />
      <section className="section theme-light" data-theme="light" id="other-markets" aria-labelledby="others-title">
        <div className="container">
          <SectionHead label={markets.others.label} title={markets.others.title} id="others-title" />
          <CellGrid items={markets.others.items} cols={4} />
        </div>
      </section>
      <OpportunityRail />
      <CtaSection f={{ ...home.final, primary: { label: t("mk.plan"), href: "/contact/?interest=market-entry" } }} />
    </>
  );
}

export default function pages(c) {
  return [{ path: "/markets/", title: c.t("mk.seoTitle"), description: c.t("mk.seoDesc"), element: <MarketsPage /> }];
}
