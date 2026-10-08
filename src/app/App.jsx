import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router";
import { ContentProvider, useContent } from "../i18n/context.jsx";
import { Footer, Header, SkipLink } from "./Layout.jsx";
import home from "./pages/home.jsx";
import services from "./pages/services.jsx";
import engagements from "./pages/engagements.jsx";
import markets from "./pages/markets.jsx";
import opportunities from "./pages/opportunities.jsx";
import insights from "./pages/insights.jsx";
import about from "./pages/about.jsx";
import contact from "./pages/contact.jsx";
import legal from "./pages/legal.jsx";
import notfound from "./pages/notfound.jsx";

const PAGE_MODULES = [home, services, engagements, markets, opportunities, insights, about, contact, legal, notfound];

/**
 * Every page of the site for one language: [{ path, title, description, ogImage, jsonLd, file?, element }].
 * `path` is the English path; the router and the prerenderer add the language prefix.
 */
export const buildPages = (content) => PAGE_MODULES.flatMap((mod) => mod(content));

export const fullTitle = (site, title) => (title ? `${title} | ${site.name}` : site.defaultTitle);

// Behaviours (GSAP, Lenis, carousels…) are client-only: loaded once, after the first render.
let behavioursPromise = null;
const loadBehaviours = () => {
  behavioursPromise ??= import("./behaviours.js").then((mod) => { mod.initSmoothScroll(); return mod; });
  return behavioursPromise;
};
// The first page waits for the preloader curtain (≈2.5s, see main.css) before its intro.
let firstPage = true;

/** Page body: sets the document title and wires the page behaviours inside <main>. */
function Page({ page, children }) {
  const { site } = useContent();
  useEffect(() => {
    document.title = fullTitle(site, page.title);
    let cleanup = null;
    let cancelled = false;
    const introLead = firstPage && document.querySelector("[data-preloader]") && !document.documentElement.classList.contains("no-preloader") ? 2.5 : 0;
    firstPage = false;
    loadBehaviours().then((mod) => {
      if (cancelled) return;
      cleanup = mod.initPage(document.getElementById("main"), { introLead });
    });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, [page, site]);
  return children;
}

/** Scroll to the top on navigation, or to the #hash target when there is one. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    loadBehaviours().then((mod) => {
      const l = mod.getLenis();
      if (target) { if (l) l.scrollTo(target, { offset: -96 }); else target.scrollIntoView(); }
      else if (l) l.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    });
  }, [pathname, hash]);
  return null;
}

function SiteRoutes({ pages }) {
  const { locale } = useContent();
  const { pathname } = useLocation();
  const notFound = pages.find((p) => p.file === "404.html");
  return (
    <main id="main" tabIndex={-1} key={pathname}>
      <Routes>
        {pages.filter((p) => !p.file).map((p) => (
          <Route key={p.path} path={locale.prefix + p.path} element={<Page page={p}>{p.element}</Page>} />
        ))}
        {notFound ? <Route path="*" element={<Page page={notFound}>{notFound.element}</Page>} /> : null}
      </Routes>
    </main>
  );
}

export default function App({ content, pages }) {
  return (
    <ContentProvider content={content}>
      <SkipLink />
      <Header />
      <ScrollManager />
      <SiteRoutes pages={pages} />
      <Footer />
    </ContentProvider>
  );
}
