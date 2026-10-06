import { useContent } from "../../i18n/context.jsx";
import { Icon } from "../icons.jsx";
import { BtnPrimary, BtnSecondary, contactHref, SplitHead } from "../ui.jsx";
import { PageHero, OpportunityCard, Discretion, CtaSection } from "../sections.jsx";

function OpportunitiesList() {
  const { opportunities: o, home, contact, t } = useContent();
  return (
    <>
      <PageHero
        label={o.intro.label}
        title={o.intro.title}
        lead={o.intro.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.opportunities") }]}
        actions={[<BtnPrimary key="access" label={t("menu.requestAccess")} href={contactHref(contact, { interest: "investment", topic: t("opp.accessTopic") })} />]}
        notice={o.intro.notice}
      />
      <section className="section theme-dark" data-theme="dark" aria-labelledby="opp-list-title">
        <div className="container">
          <h2 className="sr-only" id="opp-list-title">{t("opp.listTitle")}</h2>
          <div className="opp-grid">{o.items.map((it) => <OpportunityCard o={it} key={it.slug} />)}</div>
        </div>
      </section>
      <Discretion d={home.discretion} />
      <CtaSection f={{ ...home.final, title: t("opp.shareTitle"), text: t("opp.shareText"), primary: { label: t("opp.discuss"), href: contactHref(contact, { interest: "investment" }) }, secondary: null }} />
    </>
  );
}

function OpportunityPage({ it }) {
  const { opportunities: o, contact, t } = useContent();
  const teaserHref = contactHref(contact, { interest: "investment", topic: t("opp.topic", it) });
  return (
    <>
      <PageHero
        label={`${it.country} / ${it.type}`}
        title={it.sector}
        lead={it.summary}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.opportunities"), href: "/opportunities/" }, { label: it.sector }]}
        actions={[<BtnPrimary key="teaser" label={t("opp.teaser")} href={teaserHref} />]}
        notice={o.intro.notice}
        aside={<dl className="meta-list meta-list--hero">{o.fields.map((f) => <div className="meta-list__row" key={f.key}><dt className="body-sm color-white-50">{f.label}</dt><dd className="body-sm">{it[f.key]}</dd></div>)}</dl>}
      />
      <section className="section theme-light" data-theme="light" aria-labelledby="opp-detail-title">
        <div className="container opp-detail">
          <nav className="opp-detail__toc" aria-label={t("opp.onPage")}>
            <p className="micro color-white-50">{t("opp.onPage")}</p>
            <ol role="list">{o.sectionTitles.map((s) => <li key={s.key}><a className="body-sm" href={`#${s.key}`}>{s.title}</a></li>)}<li><a className="body-sm" href="#contact-opp">{t("opp.contact")}</a></li></ol>
          </nav>
          <div className="opp-detail__body">
            <h2 className="sr-only" id="opp-detail-title">{t("opp.details")}</h2>
            {o.sectionTitles.map((s, i) => (
              <section className="opp-detail__section" id={s.key} aria-labelledby={`${s.key}-h`} key={s.key}>
                <span className="micro color-white-40">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h4" id={`${s.key}-h`}>{s.title}</h3>
                <p className="body-lg color-white-60">{it.sections[s.key]}</p>
              </section>
            ))}
            <section className="opp-detail__section opp-detail__contact" id="contact-opp" aria-labelledby="contact-opp-h">
              <Icon name="lock" className="notice__icon" />
              <h3 className="h4" id="contact-opp-h">{t("opp.contact")}</h3>
              <p className="body-md color-white-60">{t("opp.contactText")}</p>
              <BtnSecondary label={t("opp.teaser")} href={teaserHref} />
            </section>
          </div>
        </div>
      </section>
      <section className="section theme-dark" data-theme="dark" aria-labelledby="more-opps">
        <div className="container">
          <SplitHead label={t("crumb.opportunities")} title={t("opp.other")} id="more-opps" />
          <div className="opp-grid">{o.items.filter((x) => x.slug !== it.slug).slice(0, 3).map((x) => <OpportunityCard o={x} key={x.slug} />)}</div>
        </div>
      </section>
    </>
  );
}

export default function pages(c) {
  const { opportunities, t } = c;
  return [
    { path: "/opportunities/", title: t("opp.seoTitle"), description: t("opp.seoDesc"), element: <OpportunitiesList /> },
    ...opportunities.items.map((it) => ({
      path: `/opportunities/${it.slug}/`,
      title: t("opp.detailTitle", it),
      description: t("opp.detailDesc", { ...it, type: it.type.toLowerCase() }),
      element: <OpportunityPage it={it} />,
    })),
  ];
}
