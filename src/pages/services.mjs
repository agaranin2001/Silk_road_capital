import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { btnPrimary, btnOutline, contactHref, microLabel } from "../components/ui.mjs";
import {
  pageHero, capabilityVisual, pillars, steps, beforeAfter, jvModels, statement, audience, aiShowcase, productCatalogue,
  relatedEngagements, ctaSection, capabilityGrid,
} from "../components/sections.mjs";
import { services, home, t } from "../content/index.mjs";
import { html as h } from "../lib/html.mjs";

// Block renderers: services.json describes each page as an ordered list of blocks.
// Themes alternate so long pages keep a sand ↔ dark rhythm.
const BLOCKS = {
  pillars: (b, theme) => pillars(b, { theme }),
  steps: (b, theme) => steps({ ...b, theme }),
  beforeAfter: (b, theme) => beforeAfter(b, { theme }),
  models: (b, theme) => jvModels(b, { theme }),
  statement: (b, theme) => statement(b.text, { theme }),
  audience: (b, theme) => audience(b, { theme }),
  aiShowcase: (_b, theme) => aiShowcase({ ...home.ai, cta: null }, { theme }),
  catalogue: (_b, theme) => productCatalogue({ theme }),
};
const THEMES = { aiShowcase: "dark", models: "dark" };

export default function render() {
  return services.map((s) => {
    let flip = false;
    const blocks = s.blocks.map((b) => {
      const theme = THEMES[b.type] ?? (b.type === "statement" ? "light" : flip ? "dark" : "light");
      if (!THEMES[b.type] && b.type !== "statement") flip = !flip;
      return BLOCKS[b.type](b, theme);
    });
    const others = services.filter((o) => o.slug !== s.slug);
    const body = html`
${pageHero({
  label: `${s.index} / ${s.name}`,
  title: s.headline,
  lead: s.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: s.name }],
  actions: [btnPrimary({ label: s.cta.label, href: contactHref(s.cta) }), btnOutline({ label: t("btn.engagements"), href: "/engagements/" })],
  image: s.image,
})}
<section class="section section--tight theme-light" data-theme="light" aria-labelledby="includes-title">
  <div class="container includes">
    <h2 class="micro color-white-50" id="includes-title">${t("whatsIncluded")}</h2>
    <ul class="includes__list" role="list">${s.includes.map((x) => h`<li class="body-lg">${x}</li>`)}</ul>
  </div>
</section>
${blocks}
${relatedEngagements(s.related)}
<section class="section theme-light section--raised" data-theme="light" aria-labelledby="other-title">
  <div class="container">
    ${microLabel(t("services.otherLabel"), "color-white-50 margin-bottom-24")}
    <h2 class="h3 margin-bottom-40" id="other-title">${t("services.otherTitle")}</h2>
    ${capabilityGrid(others)}
  </div>
</section>
${ctaSection({ ...home.final, primary: { label: s.cta.label, href: contactHref(s.cta) } })}`;
    return {
      path: `/${s.slug}/`,
      html: page({
        path: `/${s.slug}/`,
        title: s.seo.title,
        description: s.seo.description,
        ogImage: s.image,
        body,
        jsonLd: { "@context": "https://schema.org", "@type": "Service", name: s.name, serviceType: s.name, description: s.seo.description, provider: { "@type": "Organization", name: "Silk Road Capital" }, areaServed: ["Saudi Arabia", "GCC", "Uzbekistan", "Central Asia", "Europe"] },
      }),
    };
  });
}
