import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { btnPrimary, btnOutline, sectionHead, splitHead } from "../components/ui.mjs";
import { pageHero, cellGrid, steps, network, journey, discretion, commercialModels, ctaSection } from "../components/sections.mjs";
import { about, home, engagements, t } from "../content/index.mjs";

export default function render() {
  const a = about;
  const body = html`
${pageHero({
  label: a.hero.label,
  title: a.hero.title,
  lead: a.hero.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.about") }],
  actions: [btnPrimary({ label: t("about.start"), href: "/contact/" }), btnOutline({ label: t("about.approach"), href: "#approach" })],
  image: a.hero.image,
  imageAlt: a.hero.imageAlt,
})}
<section class="section theme-light" data-theme="light" aria-labelledby="positioning-title">
  <div class="container">
    <h2 class="sr-only" id="positioning-title">${t("about.positioning")}</h2>
    <ul class="positioning positioning--large" role="list">${home.intro.positioning.map((p) => html`<li class="h3" data-anim="fade-up">${p}</li>`)}</ul>
  </div>
</section>
<section class="section theme-dark" data-theme="dark" aria-labelledby="modes-title">
  <div class="container">
    ${splitHead({ label: a.modes.label, title: a.modes.title, text: a.modes.text, id: "modes-title" })}
    ${cellGrid(a.modes.items, { cols: 3, numbered: true })}
  </div>
</section>
<div id="approach">${steps({ label: home.method.label, title: home.method.title, items: home.method.steps, interactive: true, id: "approach-steps" })}</div>
${journey(home.journey)}
${network({ ...a.ecosystem, nodes: a.ecosystem.categories, center: a.ecosystem.center }, { theme: "light", id: "ecosystem" })}
${network(home.network, { id: "network" })}
<section class="section theme-light" data-theme="light" aria-labelledby="principles-title">
  <div class="container">
    ${sectionHead({ label: a.principles.label, title: a.principles.title, id: "principles-title" })}
    ${cellGrid(a.principles.items, { cols: 3 })}
  </div>
</section>
${commercialModels({ ...engagements.commercial, label: t("about.engage") }, { id: "engage" })}
${discretion(home.discretion)}
${ctaSection(home.final)}`;
  return [{ path: "/about/", html: page({ path: "/about/", title: a.seo.title, description: a.seo.description, ogImage: a.hero.image, body }) }];
}
