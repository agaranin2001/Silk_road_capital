import { useContent } from "../../i18n/context.jsx";
import { PageHero } from "../sections.jsx";

function LegalPage() {
  const { site, t } = useContent();
  // Short privacy notice for the enquiry form. Review with counsel before launch.
  const sections = [1, 2, 3, 4, 5].map((n) => ({ title: t(`privacy.s${n}.title`), text: t(`privacy.s${n}.text`) }));
  return (
    <>
      <PageHero label={t("privacy.label")} title={t("privacy.title")} lead={t("privacy.lead")} crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("privacy.label") }]} />
      <section className="section section--flush-top theme-light" data-theme="light" aria-labelledby="privacy-title">
        <div className="container">
          <h2 className="sr-only" id="privacy-title">{t("privacy.h2")}</h2>
          <div className="article__body legal">
            {sections.map((s, i) => (
              <section className="legal__section" key={i}><h3 className="h4">{s.title}</h3><p className="body-lg color-white-60">{s.text}</p></section>
            ))}
            <section className="legal__section"><h3 className="h4">{t("privacy.important")}</h3><p className="body-md color-white-60">{site.disclaimer}</p></section>
          </div>
        </div>
      </section>
    </>
  );
}

export default function pages(c) {
  return [{ path: "/privacy/", title: c.t("privacy.seoTitle"), description: c.t("privacy.seoDesc"), element: <LegalPage /> }];
}
