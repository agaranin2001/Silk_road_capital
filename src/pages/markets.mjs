import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { btnPrimary, btnOutline, sectionHead, lines, miniLabel, heading } from "../components/ui.mjs";
import { pageHero, marketAccess, saudiBlock, uzbekistanBlock, cellGrid, opportunityRail, ctaSection } from "../components/sections.mjs";
import { markets, home, t } from "../content/index.mjs";

export default function render() {
  const g = markets.gcc;
  const body = html`
${pageHero({
  label: markets.hero.label,
  title: markets.hero.title,
  lead: markets.hero.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.markets") }],
  actions: [btnPrimary({ label: t("mk.plan"), href: "/engagements/market-entry/" }), btnOutline({ label: t("mk.saudi"), href: "#saudi-arabia" })],
})}
${marketAccess()}
<section class="section theme-light" data-theme="light" id="gcc" aria-labelledby="gcc-title">
  <div class="container">
    <div class="editorial">
      <div class="editorial__head">
        ${miniLabel(g.label)}
        ${heading("h2", "h2", lines(g.title), { id: "gcc-title", anim: "chars" })}
      </div>
      <p class="body-xl color-white-60 editorial__lead" data-anim="fade-up">${g.lead}</p>
    </div>
    <ul class="topics" role="list">
      ${g.topics.map((tp, i) => html`<li class="topics__item" data-anim="fade-up"><span class="micro color-white-40">${String(i + 1).padStart(2, "0")}</span><p class="body-lg">${tp.name}</p><p class="body-sm color-white-60">${tp.text}</p></li>`)}
    </ul>
  </div>
</section>
${saudiBlock()}
${uzbekistanBlock()}
<section class="section theme-light" data-theme="light" id="other-markets" aria-labelledby="others-title">
  <div class="container">
    ${sectionHead({ label: markets.others.label, title: markets.others.title, id: "others-title" })}
    ${cellGrid(markets.others.items, { cols: 4 })}
  </div>
</section>
${opportunityRail()}
${ctaSection({ ...home.final, primary: { label: t("mk.plan"), href: "/contact/?interest=market-entry" } })}`;
  return [{
    path: "/markets/",
    html: page({
      path: "/markets/",
      title: t("mk.seoTitle"),
      description: t("mk.seoDesc"),
      body,
    }),
  }];
}
