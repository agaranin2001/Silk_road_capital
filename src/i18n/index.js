// Content + i18n. Every piece of copy lives in the JSON files in src/content, so pages
// and components stay data-driven. English is the source; src/content/i18n/<lang>/<file>.json
// holds translations with the same structure and is deep-merged over the English file, so
// anything untranslated falls back to English. Interface strings live in ui.json (t()).
//
// English content is bundled; other languages are code-split and loaded on demand
// (loadContent), so a visitor only downloads the language they read.

export const LOCALES = [
  { code: "en", prefix: "", dir: "ltr", intl: "en-GB", og: "en_GB" },
  { code: "ar", prefix: "/ar", dir: "rtl", intl: "ar", og: "ar_SA" },
  { code: "ru", prefix: "/ru", dir: "ltr", intl: "ru-RU", og: "ru_RU" },
  { code: "uz", prefix: "/uz", dir: "ltr", intl: "uz-Latn-UZ", og: "uz_UZ" },
];

export const FILES = ["site", "home", "services", "engagements", "markets", "opportunities", "insights", "products", "about", "contact", "images", "ui"];

const base = import.meta.glob("../content/*.json", { eager: true, import: "default" });
const translations = import.meta.glob("../content/i18n/*/*.json", { import: "default" });

const english = Object.fromEntries(FILES.map((f) => [f, base[`../content/${f}.json`]]));

/** Locale whose prefix the URL path starts with ("/ar/…" → ar), English otherwise. */
export const localeFromPath = (path) =>
  LOCALES.find((l) => l.prefix && (path === l.prefix || path.startsWith(`${l.prefix}/`))) || LOCALES[0];

// Arrays merge by index (translations keep the same order); strings/numbers are replaced.
const merge = (b, over) => {
  if (over === undefined || over === null) return b;
  if (Array.isArray(b)) return Array.isArray(over) ? b.map((x, i) => merge(x, over[i])) : b;
  if (b && typeof b === "object") {
    if (!over || typeof over !== "object") return b;
    const out = { ...b };
    for (const k of Object.keys(b)) out[k] = merge(b[k], over[k]);
    return out;
  }
  return typeof over === typeof b ? over : b;
};

/** Translation overrides for one language: { site: {...}, home: {...}, ... } (missing files → {}). */
export async function loadOverrides(lang) {
  if (lang === "en") return {};
  const entries = await Promise.all(
    FILES.map(async (f) => {
      const load = translations[`../content/i18n/${lang}/${f}.json`];
      return [f, load ? await load() : undefined];
    }),
  );
  return Object.fromEntries(entries);
}

/** Full content for a language: English merged with its translations, plus t(). */
export function buildContent(lang, overrides = {}) {
  const locale = LOCALES.find((l) => l.code === lang) || LOCALES[0];
  const c = Object.fromEntries(FILES.map((f) => [f, merge(english[f], overrides[f])]));
  c.site = { ...c.site, lang: locale.code };
  c.marketsBase = english.markets; // English point names, used to resolve map routes
  c.locale = locale;
  c.lang = locale.code;
  /** Interface string by key, with {name} placeholders: t("explore", { name: "AI" }). */
  c.t = (key, vars = {}) => {
    const s = c.ui[key] ?? english.ui[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  };
  /** Locale-prefixed path for internal links ("/contact/" → "/ru/contact/"). */
  c.href = (path) => {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || /^\/(assets|api)\//.test(path)) return path;
    return locale.prefix + path;
  };
  c.serviceBySlug = (slug) => c.services.find((s) => s.slug === slug);
  c.packageBySlug = (slug) => c.engagements.packages.find((p) => p.slug === slug);
  return c;
}

export async function loadContent(lang) {
  return buildContent(lang, await loadOverrides(lang));
}
