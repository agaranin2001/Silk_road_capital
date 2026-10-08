import { Fragment } from "react";
import { useContent } from "../../i18n/context.jsx";
import { BtnPrimary, BtnOutline, contactHref, MicroLabel } from "../ui.jsx";
import {
  PageHero, Pillars, Steps, BeforeAfter, JvModels, Statement, Audience, AiShowcase, ProductCatalogue,
  RelatedEngagements, CtaSection, CapabilityGrid, NordicSection,
} from "../sections.jsx";

// Block renderers: services.json describes each page as an ordered list of blocks.
// Themes alternate so long pages keep a sand ↔ dark rhythm.
const BLOCKS = {
  pillars: (b) => <Pillars b={b} />,
  steps: (b, theme) => <Steps {...b} theme={theme} />,
  beforeAfter: (b, theme) => <BeforeAfter b={b} theme={theme} />,
  models: (b, theme) => <JvModels b={b} theme={theme} />,
  statement: (b, theme) => <Statement text={b.text} theme={theme} />,
  audience: (b, theme) => <Audience a={b} theme={theme} />,
  aiShowcase: (_b, theme, home) => <AiShowcase ai={{ ...home.ai, cta: null }} theme={theme} />,
  catalogue: (_b, theme) => <ProductCatalogue theme={theme} />,
  nordic: (b) => <NordicSection focus={b.focus} />,
};
const THEMES = { aiShowcase: "dark", models: "dark", pillars: "light", nordic: "light" }; // fixed themes do not flip the rhythm

function ServicePage({ s }) {
  const { services, home, contact, t } = useContent();
  let flip = false;
  const blocks = s.blocks.map((b, i) => {
    const theme = THEMES[b.type] ?? (b.type === "statement" ? "light" : flip ? "dark" : "light");
    if (!THEMES[b.type] && b.type !== "statement") flip = !flip;
    return <Fragment key={i}>{BLOCKS[b.type](b, theme, home)}</Fragment>;
  });
  const others = services.filter((o) => o.slug !== s.slug);
  return (
    <>
      <PageHero
        label={`${s.index} / ${s.name}`}
        title={s.headline}
        lead={s.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: s.name }]}
        actions={[
          <BtnPrimary key="cta" label={s.cta.label} href={contactHref(contact, s.cta)} />,
          <BtnOutline key="eng" label={t("btn.engagements")} href="/engagements/" />,
        ]}
        image={s.image}
        partner={s.blocks.some((b) => b.type === "nordic")}
      />
      <section className="section section--tight theme-light" data-theme="light" aria-labelledby="includes-title">
        <div className="container includes">
          <h2 className="micro color-white-50" id="includes-title">{t("whatsIncluded")}</h2>
          <ul className="includes__list" role="list">{s.includes.map((x, i) => <li className="body-lg" key={i}>{x}</li>)}</ul>
        </div>
      </section>
      {blocks}
      <RelatedEngagements slugs={s.related} />
      <section className="section theme-light section--raised" data-theme="light" aria-labelledby="other-title">
        <div className="container">
          <MicroLabel text={t("services.otherLabel")} className="color-white-50 margin-bottom-24" />
          <h2 className="h3 margin-bottom-40" id="other-title">{t("services.otherTitle")}</h2>
          <CapabilityGrid items={others} />
        </div>
      </section>
      <CtaSection f={{ ...home.final, primary: { label: s.cta.label, href: contactHref(contact, s.cta) } }} />
    </>
  );
}

export default function pages(c) {
  return c.services.map((s) => ({
    path: `/${s.slug}/`,
    title: s.seo.title,
    description: s.seo.description,
    ogImage: s.image,
    jsonLd: { "@context": "https://schema.org", "@type": "Service", name: s.name, serviceType: s.name, description: s.seo.description, provider: { "@type": "Organization", name: "Silk Road Capital" }, areaServed: ["Saudi Arabia", "GCC", "Uzbekistan", "Central Asia", "Europe"] },
    element: <ServicePage s={s} />,
  }));
}
