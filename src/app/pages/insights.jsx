import { useEffect, useRef, useState } from "react";
import { useContent } from "../../i18n/context.jsx";
import { BtnSecondary, SplitHead, formatDate, contactHref } from "../ui.jsx";
import { PageHero, InsightCard, InsightsGrid, readingTime, CtaSection } from "../sections.jsx";

/**
 * Category filter (port of main.js "category filter"): the pill buttons set the filter and
 * aria-pressed; cards whose data-category ("tag|tag") does not include it get `hidden`.
 * The cards are rendered by <InsightsGrid>, so `hidden` is applied to those DOM nodes in an
 * effect rather than through props — the nodes stay mounted (no re-run of their entrance
 * animations) and the markup stays the same as the prerendered HTML.
 */
function InsightsList() {
  const { insights, t } = useContent();
  const [filter, setFilter] = useState("");
  const ref = useRef(null);
  const used = insights.categories.filter((c) => insights.items.some((a) => a.tags.includes(c)));

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll("[data-category]").forEach((it) => {
      it.hidden = Boolean(filter) && !it.dataset.category.split("|").includes(filter);
    });
  }, [filter]);

  return (
    <section className="section section--flush-top theme-light" data-theme="light" aria-labelledby="insights-list-title" ref={ref}>
      <div className="container">
        <h2 className="sr-only" id="insights-list-title">{t("ins.all")}</h2>
        <div className="filter" role="group" aria-label={t("ins.filter")} data-filter="[data-category]">
          <button type="button" className="pill-tab button-sm" aria-pressed={String(filter === "")} data-filter-value="" onClick={() => setFilter("")}>{t("ins.allBtn")}</button>
          {used.map((c) => (
            <button type="button" className="pill-tab button-sm" aria-pressed={String(filter === c)} data-filter-value={c} key={c} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <InsightsGrid items={insights.items} />
      </div>
    </section>
  );
}

function InsightsPage() {
  const { insights, home, t } = useContent();
  return (
    <>
      <PageHero
        label={insights.intro.label}
        title={insights.intro.title}
        lead={insights.intro.lead}
        crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.insights") }]}
      />
      <InsightsList />
      <CtaSection f={home.final} />
    </>
  );
}

function ArticlePage({ a }) {
  const { insights, contact, locale, t } = useContent();
  const related = insights.items.filter((x) => x.slug !== a.slug && x.tags.some((tag) => a.tags.includes(tag))).slice(0, 3);
  return (
    <>
      <article className="article">
        <PageHero
          label={`${a.category} · ${t("ins.minRead", { n: readingTime(a) })}`}
          title={a.title}
          lead={a.summary}
          crumbs={[{ label: t("crumb.home"), href: "/" }, { label: t("crumb.insights"), href: "/insights/" }, { label: a.category }]}
          aside={<p className="body-sm color-white-50"><time dateTime={a.date}>{formatDate(a.date, locale.intl)}</time> · Ibn Sina Ventures</p>}
        />
        <div className="section section--flush-top theme-light" data-theme="light">
          <div className="container">
            <div className="article__body rich-text">
              {a.body.map((p, i) => <p className={i === 0 ? "body-xl" : "body-lg"} key={i}>{p}</p>)}
              <ul className="chips" role="list">{a.tags.map((tag) => <li className="chip body-sm" key={tag}>{tag}</li>)}</ul>
              <BtnSecondary label={t("ins.discuss")} href={contactHref(contact, { interest: "other", topic: a.title })} />
            </div>
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="section theme-light section--raised" data-theme="light" aria-labelledby="related-insights">
          <div className="container">
            <SplitHead label={t("crumb.insights")} title={t("ins.related")} id="related-insights" />
            <div className="insight-grid">{related.map((x) => <InsightCard a={x} key={x.slug} />)}</div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function pages(c) {
  const { insights, locale, t } = c;
  return [
    { path: "/insights/", title: t("ins.seoTitle"), description: t("ins.seoDesc"), element: <InsightsPage /> },
    ...insights.items.map((a) => ({
      path: `/insights/${a.slug}/`,
      title: a.title,
      description: a.summary,
      jsonLd: { "@context": "https://schema.org", "@type": "Article", inLanguage: locale.code, headline: a.title, datePublished: a.date, description: a.summary, author: { "@type": "Organization", name: "Ibn Sina Ventures" }, publisher: { "@type": "Organization", name: "Ibn Sina Ventures" } },
      element: <ArticlePage a={a} />,
    })),
  ];
}
