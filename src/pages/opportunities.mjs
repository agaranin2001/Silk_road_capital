import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { btnPrimary, btnSecondary, contactHref, splitHead } from "../components/ui.mjs";
import { icon } from "../components/icons.mjs";
import { pageHero, opportunityCard, discretion, ctaSection } from "../components/sections.mjs";
import { opportunities, home, t } from "../content/index.mjs";

const list = () => {
  const o = opportunities;
  const body = html`
${pageHero({
  label: o.intro.label,
  title: o.intro.title,
  lead: o.intro.lead,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.opportunities") }],
  actions: [btnPrimary({ label: t("menu.requestAccess"), href: contactHref({ interest: "investment", topic: t("opp.accessTopic") }) })],
  notice: o.intro.notice,
})}
<section class="section theme-dark" data-theme="dark" aria-labelledby="opp-list-title">
  <div class="container">
    <h2 class="sr-only" id="opp-list-title">${t("opp.listTitle")}</h2>
    <div class="opp-grid">${o.items.map((it) => opportunityCard(it))}</div>
  </div>
</section>
${discretion(home.discretion)}
${ctaSection({ ...home.final, title: t("opp.shareTitle"), text: t("opp.shareText"), primary: { label: t("opp.discuss"), href: contactHref({ interest: "investment" }) }, secondary: null })}`;
  return {
    path: "/opportunities/",
    html: page({
      path: "/opportunities/",
      title: t("opp.seoTitle"),
      description: t("opp.seoDesc"),
      body,
    }),
  };
};

const detail = (it) => {
  const o = opportunities;
  const body = html`
${pageHero({
  label: `${it.country} / ${it.type}`,
  title: it.sector,
  lead: it.summary,
  crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("crumb.opportunities"), href: "/opportunities/" }, { label: it.sector }],
  actions: [btnPrimary({ label: t("opp.teaser"), href: contactHref({ interest: "investment", topic: t("opp.topic", it) }) })],
  notice: o.intro.notice,
  aside: html`<dl class="meta-list meta-list--hero">${o.fields.map((f) => html`<div class="meta-list__row"><dt class="body-sm color-white-50">${f.label}</dt><dd class="body-sm">${it[f.key]}</dd></div>`)}</dl>`,
})}
<section class="section theme-light" data-theme="light" aria-labelledby="opp-detail-title">
  <div class="container opp-detail">
    <nav class="opp-detail__toc" aria-label="${t("opp.onPage")}">
      <p class="micro color-white-50">${t("opp.onPage")}</p>
      <ol role="list">${o.sectionTitles.map((s) => html`<li><a class="body-sm" href="#${s.key}">${s.title}</a></li>`)}<li><a class="body-sm" href="#contact-opp">${t("opp.contact")}</a></li></ol>
    </nav>
    <div class="opp-detail__body">
      <h2 class="sr-only" id="opp-detail-title">${t("opp.details")}</h2>
      ${o.sectionTitles.map((s, i) => html`<section class="opp-detail__section" id="${s.key}" aria-labelledby="${s.key}-h">
        <span class="micro color-white-40">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="h4" id="${s.key}-h">${s.title}</h3>
        <p class="body-lg color-white-60">${it.sections[s.key]}</p>
      </section>`)}
      <section class="opp-detail__section opp-detail__contact" id="contact-opp" aria-labelledby="contact-opp-h">
        ${icon("lock", "notice__icon")}
        <h3 class="h4" id="contact-opp-h">${t("opp.contact")}</h3>
        <p class="body-md color-white-60">${t("opp.contactText")}</p>
        ${btnSecondary({ label: t("opp.teaser"), href: contactHref({ interest: "investment", topic: t("opp.topic", it) }) })}
      </section>
    </div>
  </div>
</section>
<section class="section theme-dark" data-theme="dark" aria-labelledby="more-opps">
  <div class="container">
    ${splitHead({ label: t("crumb.opportunities"), title: t("opp.other"), id: "more-opps" })}
    <div class="opp-grid">${o.items.filter((x) => x.slug !== it.slug).slice(0, 3).map((x) => opportunityCard(x))}</div>
  </div>
</section>`;
  return {
    path: `/opportunities/${it.slug}/`,
    html: page({
      path: `/opportunities/${it.slug}/`,
      title: t("opp.detailTitle", it),
      description: t("opp.detailDesc", { ...it, type: it.type.toLowerCase() }),
      body,
    }),
  };
};

export default function render() {
  return [list(), ...opportunities.items.map(detail)];
}
