import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { btnPrimary, btnOutline, contactHref, splitHead, pad2 } from "../components/ui.mjs";
import { icon } from "../components/icons.mjs";
import {
  pageHero, levels, packageGrid, packageSelector, flagship, solutions, commercialModels, ctaSection, steps, groups, relatedEngagements,
} from "../components/sections.mjs";
import { engagements, home, packageBySlug, t } from "../content/index.mjs";

const hub = () => {
  const e = engagements;
  const featured = e.packages.filter((p) => !p.flagship);
  const body = html`
${pageHero({
  label: e.intro.label,
  title: e.intro.title,
  lead: e.intro.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.engagements") }],
  actions: [btnPrimary({ label: t("eng.find"), href: "#selector" }), btnOutline({ label: t("eng.commercial"), href: "#commercial" })],
})}
${levels(e.philosophy)}
${packageSelector(e.selector)}
<section class="section theme-light" data-theme="light" aria-labelledby="all-title">
  <div class="container">
    ${splitHead({ label: t("eng.modelsLabel"), title: t("eng.modelsTitle"), text: t("eng.modelsText"), id: "all-title" })}
    ${packageGrid(featured)}
  </div>
</section>
${flagship(e.packages.find((p) => p.flagship))}
${solutions(e.solutions)}
${commercialModels(e.commercial)}
${ctaSection({ ...home.final, primary: { label: t("eng.discuss"), href: "/contact/" } })}`;
  return {
    path: "/engagements/",
    html: page({
      path: "/engagements/",
      title: t("eng.seoTitle"),
      description: t("eng.seoDesc"),
      body,
    }),
  };
};

const detail = (p) => {
  const body = html`
${pageHero({
  label: `${p.mode} / ${p.name}`,
  title: p.headline,
  lead: p.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.engagements"), href: "/engagements/" }, { label: p.name }],
  actions: [btnPrimary({ label: p.cta.label, href: contactHref({ ...p.cta, topic: p.name }) })],
  aside: html`<p class="body-sm page-hero__client"><span class="micro color-white-50">${t("idealClient")}</span>${p.idealClient}</p>`,
})}
${p.markets ? html`<section class="section section--tight theme-light" data-theme="light" aria-labelledby="mk-title">
  <div class="container includes">
    <h2 class="micro color-white-50" id="mk-title">${t("eng.marketsFor")}</h2>
    <ul class="includes__list" role="list">${p.markets.map((m) => html`<li class="body-lg">${m}</li>`)}</ul>
  </div>
</section>` : ""}
${p.steps ? steps({ label: t("eng.process"), title: p.flagship ? t("eng.completeChain") : t("eng.howRuns"), items: p.steps, id: "process" }) : ""}
${p.chain ? flagship({ ...p, headline: t("eng.completeChain"), lead: t("eng.chainLead") }, { label: t("groups.label"), link: false }) : ""}
${p.groups ? groups(p.groups, { theme: p.steps ? "dark" : "light" }) : ""}
${p.models ? html`<section class="section theme-dark" data-theme="dark" aria-labelledby="jvm-title">
  <div class="container">
    ${splitHead({ label: t("eng.jvLabel"), title: t("eng.jvTitle"), id: "jvm-title" })}
    <ul class="models models--compact" role="list">${p.models.map((m) => {
      const [a, b] = m.split(/\s\+\s/);
      return html`<li class="models__item" data-anim="fade-up"><p class="models__pair h4"><span>${a}</span>${b ? html`<span class="models__plus" aria-hidden="true">+</span><span>${b}</span>` : ""}</p></li>`;
    })}</ul>
  </div>
</section>` : ""}
${p.note ? html`<section class="section section--tight theme-light" data-theme="light">
  <div class="container"><p class="notice notice--large body-md">${icon("doc", "notice__icon")}<span>${p.note}</span></p></div>
</section>` : ""}
<section class="section theme-light section--raised" data-theme="light" aria-labelledby="deliv-title">
  <div class="container deliverables">
    <div>
      ${splitHead({ label: t("eng.getLabel"), title: t("eng.getTitle"), text: t("eng.getText"), id: "deliv-title" })}
    </div>
    <details class="disclosure disclosure--large" open>
      <summary class="button-sm"><span>${t("eng.showDeliverables")}</span><span class="disclosure__count color-white-40">${p.deliverables.length}</span>${icon("plus", "disclosure__icon")}</summary>
      <ol class="deliverables__list" role="list">${p.deliverables.map((d, i) => html`<li class="body-lg"><span class="micro color-white-40">${pad2(i + 1)}</span>${d}</li>`)}</ol>
    </details>
  </div>
</section>
${relatedEngagements(p.related, { title: t("eng.combined") })}
${ctaSection({ ...home.final, title: t("eng.ctaTitle"), text: t("eng.ctaText"), primary: { label: p.cta.label, href: contactHref({ ...p.cta, topic: p.name }) }, secondary: { label: t("menu.allEngagements"), href: "/engagements/" } })}`;
  return {
    path: `/engagements/${p.slug}/`,
    html: page({
      path: `/engagements/${p.slug}/`,
      title: t("eng.detailTitle", { name: p.name }),
      description: `${p.short} ${p.lead}`.slice(0, 300),
      body,
    }),
  };
};

export default function render() {
  // packageBySlug is used by components; referencing it here keeps related slugs validated at build time.
  engagements.packages.forEach((p) => p.related.forEach((s) => { if (!packageBySlug(s)) throw new Error(`Unknown engagement "${s}" in ${p.slug}.related`); }));
  return [hub(), ...engagements.packages.map(detail)];
}
