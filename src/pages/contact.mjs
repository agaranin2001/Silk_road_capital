import { html, attrs, raw } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { miniLabel, pad2 } from "../components/ui.mjs";
import { icon } from "../components/icons.mjs";
import { contact, site, t } from "../content/index.mjs";

const field = ({ name, label, type = "text", required = false, autocomplete, wide = false }) => html`
  <div class="inp-group ${wide ? "inp-group--wide" : ""}" data-field>
    <label class="inp-group__label body-sm" for="f-${name}">${label}${required ? html`<span class="color-white-40"> *</span>` : html`<span class="color-white-40">${t("form.optional")}</span>`}</label>
    <input ${attrs({ class: "inp", id: `f-${name}`, name, type, required, autocomplete })}>
    <p class="inp-group__error body-sm" data-error></p>
  </div>`;

export default function render() {
  const c = contact;
  // The last sentence of the privacy line becomes the link to the privacy notice.
  const [, privacyLead, privacyLink] = c.privacy.match(/^(.*?\s?)([^.!?؟。]+[.!?؟。]?)$/s) ?? [null, "", c.privacy];
  const body = html`
<section class="contact theme-light" data-theme="light" aria-labelledby="contact-title">
  <div class="container contact__in">
    <div class="contact__intro">
      ${miniLabel(c.label)}
      <h1 class="page-hero__title" id="contact-title" data-anim="intro-title">${c.title}</h1>
      <p class="body-xl color-white-60" data-anim="intro-text">${c.lead}</p>
      <ol class="contact__steps" role="list">
        ${c.steps.map((s, i) => html`<li data-anim="fade-up"><span class="micro color-white-40">${pad2(i + 1)}</span><span class="body-lg">${s.name}</span><span class="body-sm color-white-60">${s.text}</span></li>`)}
      </ol>
      <div class="contact__discretion">
        ${icon("lock", "notice__icon")}
        <p class="body-sm color-white-60"><strong class="color-white">${t("form.discretionStrong")}</strong> ${t("form.discretionText")}</p>
      </div>
      ${site.contacts.email ? html`<p class="body-md">${t("form.preferEmail")} <a class="link" href="mailto:${site.contacts.email}">${site.contacts.email}</a></p>` : ""}
    </div>
    <div class="contact__panel">
      <form class="contact-form" action="/api/contact" method="post" novalidate data-contact-form>
        <div class="contact-form__grid">
          ${field({ name: "name", label: t("form.name"), required: true, autocomplete: "name" })}
          ${field({ name: "company", label: t("form.company"), autocomplete: "organization" })}
          ${field({ name: "email", label: t("form.email"), type: "email", required: true, autocomplete: "email" })}
          <div class="inp-group" data-field>
            <label class="inp-group__label body-sm" for="f-country">${t("form.country")}<span class="color-white-40">${t("form.optional")}</span></label>
            <div class="select"><select class="inp" id="f-country" name="country" autocomplete="country-name">
              <option value="">${t("form.select")}</option>
              ${c.countries.map((x) => html`<option>${x}</option>`)}
            </select>${icon("caret", "select__caret")}</div>
            <p class="inp-group__error body-sm" data-error></p>
          </div>
        </div>
        <fieldset class="contact-form__interests">
          <legend class="inp-group__label body-sm">${t("form.interested")}</legend>
          <div class="chips">
            ${c.interests.map((x) => html`<label class="opt"><input type="checkbox" name="interests" value="${x.value}" data-label="${x.label}"><span class="opt__pill body-sm">${x.label}</span></label>`)}
          </div>
        </fieldset>
        <div class="inp-group inp-group--wide" data-field>
          <label class="inp-group__label body-sm" for="f-message">${t("form.message")}<span class="color-white-40"> *</span></label>
          <textarea class="inp inp--area" id="f-message" name="message" rows="6" required placeholder="${t("form.placeholder")}"></textarea>
          <p class="inp-group__error body-sm" data-error></p>
        </div>
        <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
        <p class="body-sm color-white-50 contact-form__privacy">${icon("lock", "contact-form__lock")}<span>${privacyLead}<a class="link" href="/privacy/">${privacyLink}</a></span></p>
        <p class="contact-form__error body-sm" role="alert" data-form-error></p>
        <button class="btn-primary contact-form__submit" type="submit" data-submit><span class="button-sm" data-submit-label>${c.submit}</span><span class="btn-icon">${icon("spark")}</span></button>
      </form>
      <div class="contact-success theme-dark" role="status" aria-live="polite" data-contact-success hidden>
        ${icon("checkCircle", "contact-success__icon")}
        <p class="h3">${c.success.title}</p>
        <p class="body-lg color-white-60">${c.success.text}</p>
      </div>
    </div>
  </div>
</section>
<script type="application/json" data-contact-messages>${raw(JSON.stringify({ error: c.error, notConfigured: t("form.notConfigured"), sending: t("form.sending") }).replace(/</g, "\\u003c"))}</script>`;
  return [{ path: "/contact/", html: page({ path: "/contact/", title: c.seo.title, description: c.seo.description, body }) }];
}
