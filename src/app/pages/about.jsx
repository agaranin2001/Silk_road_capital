import { useContent } from "../../i18n/context.jsx";
import { BtnPrimary, BtnOutline, SectionHead, SplitHead } from "../ui.jsx";
import { PageHero, CellGrid, Steps, Network, Journey, Discretion, CommercialModels, CtaSection } from "../sections.jsx";

function AboutPage() {
  const { about: a, home, engagements, t } = useContent();
  return (
    <>
      <PageHero
        label={a.hero.label}
        title={a.hero.title}
        lead={a.hero.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.about") }]}
        actions={[
          <BtnPrimary key="start" label={t("about.start")} href="/contact/" />,
          <BtnOutline key="approach" label={t("about.approach")} href="#approach" />,
        ]}
        image={a.hero.image}
        imageAlt={a.hero.imageAlt}
      />
      <section className="section theme-light" data-theme="light" aria-labelledby="positioning-title">
        <div className="container">
          <h2 className="sr-only" id="positioning-title">{t("about.positioning")}</h2>
          <ul className="positioning positioning--large" role="list">{home.intro.positioning.map((p, i) => <li className="h3" data-anim="fade-up" key={i}>{p}</li>)}</ul>
        </div>
      </section>
      <section className="section theme-dark" data-theme="dark" aria-labelledby="modes-title">
        <div className="container">
          <SplitHead label={a.modes.label} title={a.modes.title} text={a.modes.text} id="modes-title" />
          <CellGrid items={a.modes.items} cols={3} numbered />
        </div>
      </section>
      <div id="approach"><Steps label={home.method.label} title={home.method.title} items={home.method.steps} interactive id="approach-steps" /></div>
      <Journey j={home.journey} />
      <Network n={{ ...a.ecosystem, nodes: a.ecosystem.categories, center: a.ecosystem.center }} theme="light" id="ecosystem" />
      <Network n={home.network} id="network" />
      <section className="section theme-light" data-theme="light" aria-labelledby="principles-title">
        <div className="container">
          <SectionHead label={a.principles.label} title={a.principles.title} id="principles-title" />
          <CellGrid items={a.principles.items} cols={3} />
        </div>
      </section>
      <CommercialModels c={{ ...engagements.commercial, label: t("about.engage") }} id="engage" />
      <Discretion d={home.discretion} />
      <CtaSection f={home.final} />
    </>
  );
}

export default function pages(c) {
  const a = c.about;
  return [{ path: "/about/", title: a.seo.title, description: a.seo.description, ogImage: a.hero.image, element: <AboutPage /> }];
}
