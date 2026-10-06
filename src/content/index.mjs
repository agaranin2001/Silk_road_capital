// Content loader — every piece of copy lives in the JSON files in this folder,
// so pages and components stay data-driven.
//
// i18n: the build renders the site once per locale (scripts/build.mjs sets SITE_LANG).
// English is the source; i18n/<lang>/<file>.json holds translations with the same
// structure and is deep-merged over the English file, so anything untranslated falls
// back to English. Interface strings live in ui.json and are read with t().
import { readFileSync, existsSync } from "node:fs";

export const LOCALES = [
  { code: "en", prefix: "", dir: "ltr", intl: "en-GB", og: "en_GB" },
  { code: "ar", prefix: "/ar", dir: "rtl", intl: "ar", og: "ar_SA" },
  { code: "ru", prefix: "/ru", dir: "ltr", intl: "ru-RU", og: "ru_RU" },
  { code: "uz", prefix: "/uz", dir: "ltr", intl: "uz-Latn-UZ", og: "uz_UZ" },
];
export const lang = process.env.SITE_LANG && LOCALES.some((l) => l.code === process.env.SITE_LANG) ? process.env.SITE_LANG : "en";
export const locale = LOCALES.find((l) => l.code === lang);

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

// Arrays merge by index (translations keep the same order); strings/numbers are replaced.
const merge = (base, over) => {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base)) return Array.isArray(over) ? base.map((b, i) => merge(b, over[i])) : base;
  if (base && typeof base === "object") {
    if (!over || typeof over !== "object") return base;
    const out = { ...base };
    for (const k of Object.keys(base)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return typeof over === typeof base ? over : base;
};

const load = (name) => {
  const base = read(`./${name}`);
  if (lang === "en") return base;
  const path = `./i18n/${lang}/${name}`;
  return existsSync(new URL(path, import.meta.url)) ? merge(base, read(path)) : base;
};

export const site = { ...load("site.json"), lang };
export const home = load("home.json");
export const services = load("services.json");
export const engagements = load("engagements.json");
export const markets = load("markets.json");
export const marketsBase = read("./markets.json"); // English point names, used to resolve map routes
export const opportunities = load("opportunities.json");
export const insights = load("insights.json");
export const products = load("products.json");
export const about = load("about.json");
export const contact = load("contact.json");
export const images = load("images.json");
export const ui = load("ui.json");

/** Interface string by key, with {name} placeholders: t("explore", { name: "AI" }). */
export const t = (key, vars = {}) => {
  const s = ui[key] ?? read("./ui.json")[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
};

export const serviceBySlug = (slug) => services.find((s) => s.slug === slug);
export const packageBySlug = (slug) => engagements.packages.find((p) => p.slug === slug);
