import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

/* ------------------------------------------------------------------ select */

const SHEET_QUERY = "(max-width: 809px)";

/**
 * Custom dropdown in the site's style (replaces native <select>). Select-only combobox pattern:
 * arrows/Home/End move, Enter/Space choose, Esc closes, letters jump.
 * Desktop: a popover under the field. Phones (≤809px): a bottom sheet — backdrop, grab handle,
 * the field label as title, close button, and "Done" for multiple choice (like the language dialog).
 * The value is submitted through hidden inputs, so forms read it like a native select
 * (`multiple`: one input per chosen value, read with FormData.getAll; the list stays open).
 * Uncontrolled (defaultValue) or controlled (value + onChange).
 * <Select id="f-country" name="country" label="Country" placeholder="Select" options={["A", "B"]} invalid />
 */
export function Select({ id, name, label, options, placeholder = "", defaultValue, value: valueProp, onChange, invalid, multiple = false }) {
  const { t } = useContent();
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [inner, setInner] = useState(defaultValue ?? (multiple ? [] : ""));
  const value = valueProp !== undefined ? valueProp : inner;
  const isChosen = (v) => (multiple ? value.includes(v) : value === v);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [active, setActive] = useState(-1);
  const [up, setUp] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const sheetRef = useRef(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = `${id}-list`;
  const selectedIndex = items.findIndex((o) => isChosen(o.value));
  const current = multiple ? items.filter((o) => isChosen(o.value)).map((o) => o.label).join(", ") : items[selectedIndex]?.label;

  const show = () => {
    const asSheet = window.matchMedia(SHEET_QUERY).matches;
    const r = rootRef.current?.getBoundingClientRect();
    // Popover: open upwards when there is not enough room below the field.
    if (r && !asSheet) setUp(window.innerHeight - r.bottom < 300 && r.top > window.innerHeight - r.bottom);
    setSheet(asSheet);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus && sheet) btnRef.current?.focus({ preventScroll: true });
  };
  const choose = (i) => {
    const o = items[i];
    if (!o) return;
    const next = multiple ? (value.includes(o.value) ? value.filter((v) => v !== o.value) : [...value, o.value]) : o.value;
    if (valueProp === undefined) setInner(next);
    if (!multiple) close();
    if (onChange) onChange(next);
  };

  // Close on outside press (the sheet is portalled, so it counts as inside).
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target) && !sheetRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  // Sheet: lock page scrolling and move focus into the list while it is open.
  useEffect(() => {
    if (!open || !sheet) return undefined;
    document.body.classList.add("is-locked");
    listRef.current?.focus({ preventScroll: true });
    return () => document.body.classList.remove("is-locked");
  }, [open, sheet]);
  // Keep the active option in view.
  useEffect(() => {
    if (open && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e) => {
    const last = items.length - 1;
    const move = (i) => { e.preventDefault(); if (!open) show(); setActive(Math.max(0, Math.min(last, i))); };
    switch (e.key) {
      case "ArrowDown": return open ? move(active + 1) : (e.preventDefault(), show());
      case "ArrowUp": return open ? move(active - 1) : (e.preventDefault(), show());
      case "Home": return open ? move(0) : undefined;
      case "End": return open ? move(last) : undefined;
      case "Enter":
      case " ":
        e.preventDefault();
        return open ? choose(active) : show();
      case "Escape": if (open) { e.preventDefault(); close(); } return undefined;
      case "Tab": if (open) { if (sheet) e.preventDefault(); else setOpen(false); } return undefined;
      default: {
        if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return undefined;
        // Type-ahead: jump to the first option starting with the typed letters.
        const now = Date.now();
        typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
        const i = items.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
        if (i >= 0) { if (open || multiple) { if (!open) show(); setActive(i); } else choose(i); }
        return undefined;
      }
    }
  };

  const activeId = open && active >= 0 ? `${id}-opt-${active}` : undefined;
  const list = (
    <ul
      className="select__list"
      id={listId}
      role="listbox"
      aria-multiselectable={multiple ? "true" : undefined}
      aria-labelledby={sheet ? `${id}-sheet-title` : undefined}
      aria-activedescendant={sheet ? activeId : undefined}
      tabIndex={sheet ? 0 : undefined}
      onKeyDown={sheet ? onKeyDown : undefined}
      ref={listRef}
      hidden={!open}
      data-lenis-prevent=""
    >
      {items.map((o, i) => (
        <li
          key={o.value}
          id={`${id}-opt-${i}`}
          role="option"
          aria-selected={isChosen(o.value) ? "true" : "false"}
          className={`select__option${i === active ? " is-active" : ""}`}
          onPointerEnter={() => setActive(i)}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => choose(i)}
        >
          <span>{o.label}</span>
          {isChosen(o.value) ? <Icon name="check" className="select__check" /> : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`select${open ? " is-open" : ""}${up ? " select--up" : ""}`} ref={rootRef}>
      {multiple ? value.map((v) => <input key={v} type="hidden" name={name} value={v} />) : <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        ref={btnRef}
        className="inp select__btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-controls={listId}
        aria-activedescendant={sheet ? undefined : activeId}
        aria-invalid={invalid ? "true" : undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={onKeyDown}
      >
        <span className={current ? "select__value" : "select__value select__placeholder"}>{current || placeholder}</span>
      </button>
      <Icon name="caret" className="select__caret" />
      {open && sheet
        ? createPortal(
          <div className="select-sheet" data-lenis-prevent="" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <div className="select-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={`${id}-sheet-title`} ref={sheetRef}>
              <div className="select-sheet__head">
                <p className="select-sheet__title" id={`${id}-sheet-title`}>{label || placeholder}</p>
                <button type="button" className="select-sheet__close" aria-label={t("aria.close")} onClick={() => close()}><Icon name="close" /></button>
              </div>
              {list}
              {multiple ? <button type="button" className="btn-primary select-sheet__done" onClick={() => close()}><span className="button-sm">{t("select.done")}</span><span className="btn-icon"><Icon name="check" /></span></button> : null}
            </div>
          </div>,
          document.body,
        )
        : list}
    </div>
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
