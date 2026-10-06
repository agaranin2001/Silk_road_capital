import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { pageHero } from "../components/sections.mjs";
import { site, t } from "../content/index.mjs";

// Short privacy notice for the enquiry form. Review with counsel before launch.
const SECTIONS = [1, 2, 3, 4, 5].map((n) => ({ title: t(`privacy.s${n}.title`), text: t(`privacy.s${n}.text`) }));

export default function render() {
  const body = html`
${pageHero({ label: t("privacy.label"), title: t("privacy.title"), lead: t("privacy.lead"), crumbs: [{ label: t("crumb.home"), href: "/" }, { label: t("privacy.label") }] })}
<section class="section section--flush-top theme-light" data-theme="light" aria-labelledby="privacy-title">
  <div class="container">
    <h2 class="sr-only" id="privacy-title">${t("privacy.h2")}</h2>
    <div class="article__body legal">
      ${SECTIONS.map((s) => html`<section class="legal__section"><h3 class="h4">${s.title}</h3><p class="body-lg color-white-60">${s.text}</p></section>`)}
      <section class="legal__section"><h3 class="h4">${t("privacy.important")}</h3><p class="body-md color-white-60">${site.disclaimer}</p></section>
    </div>
  </div>
</section>`;
  return [{ path: "/privacy/", html: page({ path: "/privacy/", title: t("privacy.seoTitle"), description: t("privacy.seoDesc"), body }) }];
}
