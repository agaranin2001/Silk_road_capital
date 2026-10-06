import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useContent } from "../i18n/context.jsx";
import { Icon } from "./icons.jsx";

/* ------------------------------------------------------------------ links */

const isInternal = (href) => typeof href === "string" && href.startsWith("/") && !href.startsWith("//") && !/^\/(assets|api)\//.test(href);

/**
 * Link that adds the current language prefix to root-relative paths ("/contact/" → "/ru/contact/")
 * and navigates client-side. Hash-only, external, asset and API links render a plain <a>.
 */
export function L({ href, children, ...rest }) {
  const { href: localise } = useContent();
  if (isInternal(href)) return <Link to={localise(href)} {...rest}>{children}</Link>;
  return <a href={href} {...rest}>{children}</a>;
}

/** Contact link that pre-selects an interest (aliases map engagement keys onto form options). */
export const contactHref = (contact, { interest, topic } = {}) => {
  const params = new URLSearchParams();
  const value = contact.aliases[interest] ?? interest;
  if (value) params.set("interest", value);
  if (topic) params.set("topic", topic);
  const q = params.toString();
  return `/contact/${q ? `?${q}` : ""}`;
};

/* ------------------------------------------------------------------ images */

/** Unsplash CDN URL for a photo key from images.json at a given width. */
const unsplash = (p, w) => `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=72`;

/**
 * Responsive <img>. `file` is a photo key from images.json (web photography served from the
 * Unsplash CDN) or a file name in public/assets/img.
 */
export function Img({ file, alt, className, sizes = "100vw", eager = false }) {
  const { images } = useContent();
  const p = images.items[file];
  if (p) {
    return (
      <img
        className={className || undefined}
        src={unsplash(p, 1600)}
        srcSet={[640, 1024, 1600, 2400].map((w) => `${unsplash(p, w)} ${w}w`).join(", ")}
        sizes={sizes}
        alt={alt ?? p.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    );
  }
  return <img className={className || undefined} src={`/assets/img/${file}`} alt={alt ?? ""} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

/** Image URL for CSS backgrounds / og:image. */
export const imgUrl = (images, file) => (images.items[file] ? unsplash(images.items[file], 1600) : `/assets/img/${file}`);

/** Round country flag (circle-flags by HatScripts, MIT licence, via jsDelivr). Decorative. */
const FLAG_CDN = "https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags";
export const Flag = ({ code, className = "m-flag" }) => (
  <img className={className} src={`${FLAG_CDN}/${code}.svg`} alt="" width="24" height="24" loading="lazy" decoding="async" />
);

/* ------------------------------------------------------------------ text */

/** Text with "\n" line breaks → text with <br>. */
export const Lines = ({ text }) => {
  const parts = String(text ?? "").split("\n");
  return parts.map((p, i) => (i ? [<br key={i} />, p] : p));
};

export const pad2 = (n) => String(n).padStart(2, "0");

export const formatDate = (iso, intl) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(intl, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * One-line label. When the text is wider than the space available it is duplicated and
 * scrolls in an endless loop (CSS .label-fit in main.css); re-checked on resize.
 * <FitLabel as="p" className="m-eyebrow">Text</FitLabel>
 */
export function FitLabel({ as: Tag = "p", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [scroll, setScroll] = useState(null); // null | duration in seconds
  const text = children;
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      const clip = el.querySelector(".label-fit__clip"), copy = el.querySelector(".label-fit__copy");
      if (!clip || !copy) return;
      el.classList.remove("is-scrolling");
      const over = copy.scrollWidth > clip.clientWidth + 1;
      setScroll(over ? Math.max(8, copy.offsetWidth / 35) : null);
      if (over) el.classList.add("is-scrolling");
    };
    fit();
    let timer;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(fit, 150); };
    window.addEventListener("resize", onResize);
    if (document.fonts) document.fonts.ready.then(fit);
    return () => { clearTimeout(timer); window.removeEventListener("resize", onResize); };
  }, [text]);
  return (
    <Tag ref={ref} className={`${className} label-fit${scroll ? " is-scrolling" : ""}`.trim()} {...rest}>
      <span className="label-fit__clip" style={scroll ? { "--label-dur": `${scroll}s` } : undefined}>
        <span className="label-fit__track">
          <span className="label-fit__copy">{text}</span>
          <span className="label-fit__copy" aria-hidden="true">{text}</span>
        </span>
      </span>
    </Tag>
  );
}

/* ------------------------------------------------------------------ buttons */

const BtnInner = ({ label, iconName }) => (
  <>
    <span className="button-sm">{label}</span>
    <span className="btn-icon"><Icon name={iconName} /></span>
  </>
);

const Btn = ({ base, label, href, className = "", attrs = {}, iconName, type }) => {
  const cls = `${base} ${className}`.trim();
  if (type) return <button type={type} className={cls} {...attrs}><BtnInner label={label} iconName={iconName} /></button>;
  return <L className={cls} href={href} {...attrs}><BtnInner label={label} iconName={iconName} /></L>;
};

export const BtnPrimary = ({ iconName = "spark", ...p }) => <Btn base="btn-primary" iconName={iconName} {...p} />;
export const BtnSecondary = ({ iconName = "arrow", ...p }) => <Btn base="btn-secondary" iconName={iconName} {...p} />;
/** Outline pill — the quiet secondary action next to a primary button. */
export const BtnOutline = ({ iconName = "arrow", ...p }) => <Btn base="btn-outline" iconName={iconName} {...p} />;

/** Text link with arrow (card CTAs). */
export const ArrowLink = ({ label, href, className = "" }) => (
  <L className={`arrow-link button-sm ${className}`.trim()} href={href}>
    <span>{label}</span>
    <Icon name="arrowUpRight" className="arrow-link__icon" />
  </L>
);

/* ------------------------------------------------------------------ labels & headings */

export const MiniLabel = ({ label, className = "" }) => (
  <div className={`head__title ${className}`.trim()}>
    <Icon name="star8" className="logo-mini" />
    <FitLabel as="span" className="body-md">{label}</FitLabel>
  </div>
);

/** Uppercase micro-label: "01 / INVESTMENT ADVISORY". */
export const MicroLabel = ({ text, className = "" }) => <p className={`micro ${className}`.trim()}>{text}</p>;

/** <Heading level="h2" className="h2" id anim>…</Heading> */
export const Heading = ({ level: Tag = "h2", className, id, anim, children }) => (
  <Tag className={className || undefined} id={id} data-anim={anim}>{children}</Tag>
);

/**
 * Section head: "✦ Label" in the narrow column, statement in the wide column
 * (the Silk Road Travel `.head` block), optional muted copy and action below.
 */
export const SectionHead = ({ label, title, text, action, level = "h2", titleClass = "h2", id, className = "" }) => (
  <div className={`head ${className}`.trim()}>
    <div className="row mobile-column">
      <div className="column column-3"><MiniLabel label={label} className="mobile-margin-bottom-24" /></div>
      <div className="column column-9">
        <div className="head__description">
          <Heading level={level} className={titleClass} id={id} anim="chars"><Lines text={title} /></Heading>
          {text || action ? (
            <div className="head__aside">
              {text ? <p className="body-lg color-white-60 head__text" data-anim="fade-up">{text}</p> : null}
              {action ?? null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

/** Split head: big title on the left, muted copy (+ optional action) on the right. */
export const SplitHead = ({ label, title, text, action, level = "h2", titleClass = "h2", id }) => (
  <div className="head head--split">
    {label ? <MiniLabel label={label} className="margin-bottom-24" /> : null}
    <div className="row align-end mobile-column">
      <div className="column column-6"><Heading level={level} className={titleClass} id={id} anim="chars"><Lines text={title} /></Heading></div>
      <div className="column column-6">
        <div className="split-head">
          {text ? <p className="body-md color-white-60" data-anim="fade-up">{text}</p> : null}
          {action ?? null}
        </div>
      </div>
    </div>
  </div>
);
