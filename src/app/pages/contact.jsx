import { useEffect, useRef, useState } from "react";
import { useContent } from "../../i18n/context.jsx";
import { Icon } from "../icons.jsx";
import { L, MiniLabel, pad2 } from "../ui.jsx";

// Engagement keys that map onto one of the form's interest options (same map as contact.aliases).
const ALIASES = { "business-build": "advisory", growth: "digital", structure: "advisory" };

const Field = ({ name, label, type = "text", required = false, autocomplete, wide = false, error }) => {
  const { t } = useContent();
  return (
    <div className={`inp-group ${wide ? "inp-group--wide" : ""}${error ? " is-error" : ""}`} data-field="">
      <label className="inp-group__label body-sm" htmlFor={`f-${name}`}>{label}{required ? <span className="color-white-40"> *</span> : <span className="color-white-40">{t("form.optional")}</span>}</label>
      <input className="inp" id={`f-${name}`} name={name} type={type} required={required || undefined} autoComplete={autocomplete} aria-invalid={error ? "true" : undefined} />
      <p className="inp-group__error body-sm" data-error="">{error || ""}</p>
    </div>
  );
};

/**
 * Enquiry form (port of main.js "contact form"): prefill from ?interest= / ?topic=, client-side
 * validation, JSON POST to the contact endpoint, loading / error / success states.
 */
function ContactForm() {
  const { contact: c, t } = useContent();
  const regarding = t("form.regarding");
  const [interests, setInterests] = useState([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const successRef = useRef(null);

  // Prefill after mount (not during render) so the prerendered HTML and hydration match.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const interest = ALIASES[q.get("interest")] || q.get("interest");
    if (interest && c.interests.some((x) => x.value === interest)) setInterests((prev) => (prev.includes(interest) ? prev : [...prev, interest]));
    const topic = q.get("topic");
    if (topic) setMessage((prev) => prev || `${regarding}${topic.slice(0, 200)}\n\n`);
  }, [c.interests, regarding]);

  useEffect(() => {
    if (sent && successRef.current) successRef.current.focus();
  }, [sent]);

  const validate = (d) => {
    const e = {};
    if (!d.name || d.name.trim().length < 2) e.name = t("form.errName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((d.email || "").trim())) e.email = t("form.errEmail");
    if (!d.message || (d.message.startsWith(regarding) ? d.message.split("\n").slice(1).join("\n") : d.message).trim().length < 10) e.message = t("form.errMessage");
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.interests = fd.getAll("interests");
    const found = validate(data);
    setErrors((prev) => ({ ...prev, name: found.name, email: found.email, message: found.message }));
    setFormError("");
    const first = Object.keys(found)[0];
    if (first) { form.elements[first].focus(); return; }

    setSending(true);
    try {
      const res = await fetch(import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok !== false) { setSent(true); return; }
      if (out.fields) setErrors((prev) => ({ ...prev, ...out.fields }));
      setFormError(out.error === "not_configured" ? t("form.notConfigured") : c.error);
    } catch {
      setFormError(c.error);
    } finally {
      setSending(false);
    }
  };

  const toggleInterest = (value, checked) =>
    setInterests((prev) => (checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)));

  // The last sentence of the privacy line becomes the link to the privacy notice.
  const [, privacyLead, privacyLink] = c.privacy.match(/^(.*?\s?)([^.!?؟。]+[.!?؟。]?)$/s) ?? [null, "", c.privacy];

  return (
    <div className="contact__panel">
      <form className="contact-form" action="/api/contact" method="post" noValidate data-contact-form="" hidden={sent || undefined} onSubmit={onSubmit}>
        <div className="contact-form__grid">
          <Field name="name" label={t("form.name")} required autocomplete="name" error={errors.name} />
          <Field name="company" label={t("form.company")} autocomplete="organization" error={errors.company} />
          <Field name="email" label={t("form.email")} type="email" required autocomplete="email" error={errors.email} />
          <div className={`inp-group${errors.country ? " is-error" : ""}`} data-field="">
            <label className="inp-group__label body-sm" htmlFor="f-country">{t("form.country")}<span className="color-white-40">{t("form.optional")}</span></label>
            <div className="select"><select className="inp" id="f-country" name="country" autoComplete="country-name" aria-invalid={errors.country ? "true" : undefined}>
              <option value="">{t("form.select")}</option>
              {c.countries.map((x) => <option key={x}>{x}</option>)}
            </select><Icon name="caret" className="select__caret" /></div>
            <p className="inp-group__error body-sm" data-error="">{errors.country || ""}</p>
          </div>
        </div>
        <fieldset className="contact-form__interests">
          <legend className="inp-group__label body-sm">{t("form.interested")}</legend>
          <div className="chips">
            {c.interests.map((x) => (
              <label className="opt" key={x.value}><input type="checkbox" name="interests" value={x.value} data-label={x.label} checked={interests.includes(x.value)} onChange={(e) => toggleInterest(x.value, e.target.checked)} /><span className="opt__pill body-sm">{x.label}</span></label>
            ))}
          </div>
        </fieldset>
        <div className={`inp-group inp-group--wide${errors.message ? " is-error" : ""}`} data-field="">
          <label className="inp-group__label body-sm" htmlFor="f-message">{t("form.message")}<span className="color-white-40"> *</span></label>
          <textarea className="inp inp--area" id="f-message" name="message" rows="6" required placeholder={t("form.placeholder")} value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={errors.message ? "true" : undefined} />
          <p className="inp-group__error body-sm" data-error="">{errors.message || ""}</p>
        </div>
        <div className="hp" aria-hidden="true"><label htmlFor="f-website">Website</label><input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
        <p className="body-sm color-white-50 contact-form__privacy"><Icon name="lock" className="contact-form__lock" /><span>{privacyLead}<L className="link" href="/privacy/">{privacyLink}</L></span></p>
        <p className="contact-form__error body-sm" role="alert" data-form-error="">{formError}</p>
        <button className={`btn-primary contact-form__submit${sending ? " is-loading" : ""}`} type="submit" data-submit="" aria-busy={sending ? "true" : undefined}><span className="button-sm" data-submit-label="">{sending ? t("form.sending") || "Sending…" : c.submit}</span><span className="btn-icon"><Icon name="spark" /></span></button>
      </form>
      <div className="contact-success theme-dark" role="status" aria-live="polite" data-contact-success="" hidden={!sent || undefined} tabIndex={sent ? -1 : undefined} ref={successRef}>
        <Icon name="checkCircle" className="contact-success__icon" />
        <p className="h3">{c.success.title}</p>
        <p className="body-lg color-white-60">{c.success.text}</p>
      </div>
    </div>
  );
}

function ContactPage() {
  const { contact: c, site, t } = useContent();
  return (
    <section className="contact theme-light" data-theme="light" aria-labelledby="contact-title">
      <div className="container contact__in">
        <div className="contact__intro">
          <MiniLabel label={c.label} />
          <h1 className="page-hero__title" id="contact-title" data-anim="intro-title">{c.title}</h1>
          <p className="body-xl color-white-60" data-anim="intro-text">{c.lead}</p>
          <ol className="contact__steps" role="list">
            {c.steps.map((s, i) => <li data-anim="fade-up" key={i}><span className="micro color-white-40">{pad2(i + 1)}</span><span className="body-lg">{s.name}</span><span className="body-sm color-white-60">{s.text}</span></li>)}
          </ol>
          <div className="contact__discretion">
            <Icon name="lock" className="notice__icon" />
            <p className="body-sm color-white-60"><strong className="color-white">{t("form.discretionStrong")}</strong> {t("form.discretionText")}</p>
          </div>
          {site.contacts.email ? <p className="body-md">{t("form.preferEmail")} <a className="link" href={`mailto:${site.contacts.email}`}>{site.contacts.email}</a></p> : null}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

export default function pages(c) {
  return [{ path: "/contact/", title: c.contact.seo.title, description: c.contact.seo.description, element: <ContactPage /> }];
}
