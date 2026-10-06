import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { loadContent, localeFromPath } from "./i18n/index.js";
import App, { buildPages } from "./app/App.jsx";
import "./styles/tokens.css";
import "./styles/main.css";
import "./styles/sections.css";

// The language comes from the URL prefix (/ar/, /ru/, /uz/). Switching language is a full page
// load, so <html lang/dir> and the content are always those of the prerendered page.
const locale = localeFromPath(window.location.pathname);

loadContent(locale.code).then((content) => {
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App content={content} pages={buildPages(content)} />
      </BrowserRouter>
    </StrictMode>
  );
  const root = document.getElementById("root");
  if (root.hasChildNodes()) {
    hydrateRoot(root, app);
  } else {
    // Dev server (no prerendered HTML): set the language attributes ourselves.
    document.documentElement.lang = locale.code;
    document.documentElement.dir = locale.dir;
    if (locale.dir === "rtl" && !document.querySelector("link[data-font-ar]")) {
      const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" });
      link.dataset.fontAr = "";
      document.head.appendChild(link);
    }
    createRoot(root).render(app);
  }
});
