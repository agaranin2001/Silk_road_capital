import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { btnSecondary, splitHead, formatDate, contactHref } from "../components/ui.mjs";
import { pageHero, insightCard, insightsGrid, readingTime, ctaSection } from "../components/sections.mjs";
import { insights, home, locale, t } from "../content/index.mjs";

const list = () => {
  const used = insights.categories.filter((c) => insights.items.some((a) => a.tags.includes(c)));
  const body = html`
${pageHero({
  label: insights.intro.label,
  title: insights.intro.title,
  lead: insights.intro.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.insights") }],
})}
<section class="section section--flush-top theme-light" data-theme="light" aria-labelledby="insights-list-title">
  <div class="container">
    <h2 class="sr-only" id="insights-list-title">${t("ins.all")}</h2>
    <div class="filter" role="group" aria-label="${t("ins.filter")}" data-filter="[data-category]">
      <button type="button" class="pill-tab button-sm" aria-pressed="true" data-filter-value="">${t("ins.allBtn")}</button>
      ${used.map((c) => html`<button type="button" class="pill-tab button-sm" aria-pressed="false" data-filter-value="${c}">${c}</button>`)}
    </div>
    ${insightsGrid(insights.items)}
  </div>
</section>
${ctaSection(home.final)}`;
  return {
    path: "/insights/",
    html: page({
      path: "/insights/",
      title: t("ins.seoTitle"),
      description: t("ins.seoDesc"),
      body,
    }),
  };
};

const article = (a) => {
  const related = insights.items.filter((x) => x.slug !== a.slug && x.tags.some((tag) => a.tags.includes(tag))).slice(0, 3);
  const body = html`
<article class="article">
  ${pageHero({
    label: `${a.category} · ${t("ins.minRead", { n: readingTime(a) })}`,
    title: a.title,
    lead: a.summary,
    crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.insights"), href: "/insights/" }, { label: a.category }],
    aside: html`<p class="body-sm color-white-50"><time datetime="${a.date}">${formatDate(a.date)}</time> · Silk Road Capital</p>`,
  })}
  <div class="section section--flush-top theme-light" data-theme="light">
    <div class="container">
      <div class="article__body rich-text">
        ${a.body.map((p, i) => html`<p class="${i === 0 ? "body-xl" : "body-lg"}">${p}</p>`)}
        <ul class="chips" role="list">${a.tags.map((tag) => html`<li class="chip body-sm">${tag}</li>`)}</ul>
        ${btnSecondary({ label: t("ins.discuss"), href: contactHref({ interest: "other", topic: a.title }) })}
      </div>
    </div>
  </div>
</article>
${related.length ? html`<section class="section theme-light section--raised" data-theme="light" aria-labelledby="related-insights">
  <div class="container">
    ${splitHead({ label: t("crumb.insights"), title: t("ins.related"), id: "related-insights" })}
    <div class="insight-grid">${related.map((x) => insightCard(x))}</div>
  </div>
</section>` : ""}`;
  return {
    path: `/insights/${a.slug}/`,
    html: page({
      path: `/insights/${a.slug}/`,
      title: a.title,
      description: a.summary,
      body,
      jsonLd: { "@context": "https://schema.org", "@type": "Article", inLanguage: locale.code, headline: a.title, datePublished: a.date, description: a.summary, author: { "@type": "Organization", name: "Silk Road Capital" }, publisher: { "@type": "Organization", name: "Silk Road Capital" } },
    }),
  };
};

export default function render() {
  return [list(), ...insights.items.map(article)];
}
