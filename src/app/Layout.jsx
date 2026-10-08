import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useContent } from "../i18n/context.jsx";
import { LOCALES } from "../i18n/index.js";
import { Icon } from "./icons.jsx";
import { FitLabel, Img, L } from "./ui.jsx";
import { MMarquee } from "./blocks.jsx";

// While the menu or language dialog is open the page is locked with body.is-locked (overflow:
// hidden on the viewport). Smooth scrolling (Lenis) is not paused for this: lenis.stop() clips
// <html>, which turns <body> into its own scroller and pushes the sticky header off-screen.
// Lenis ignores wheel events inside [data-lenis-prevent] (menu, dialog, sheets).
const lockPage = (on) => document.body.classList.toggle("is-locked", on);

/** English path of the current page ("/ru/markets/" → "/markets/"). */
export const useEnglishPath = () => {
  const { pathname } = useLocation();
  const { locale } = useContent();
  const p = locale.prefix && pathname.startsWith(locale.prefix) ? pathname.slice(locale.prefix.length) || "/" : pathname;
  return p.startsWith("/") ? p : `/${p}`;
};

// Hash links ("/about/#network") point into a section, not a page — never "current".
const isCurrent = (href, path) => {
  if (href.includes("#")) return false;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href);
};

const Logo = ({ className }) => (
  <span className={className}>
    <img className="logo-mark" src="/assets/img/silk-road-mark-96.webp" srcSet="/assets/img/silk-road-mark-96.webp 1x, /assets/img/silk-road-mark-192.webp 2x" width="101" height="96" alt="" decoding="async" />
    <span className="logo-word">Silk Road <span className="logo-capital">Capital</span></span>
  </span>
);

/* ------------------------------------------------------------------ header nav */

// Header — same structure as the Silk Road Travel header
// (logo cell | nav with mega dropdowns | accent cell | burger cell, dark full-screen menu).
function NavItem({ item, path, index }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const btnRef = useRef(null);
  const current = (item.match ?? [item.href]).some((h) => isCurrent(h, path));
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setOpen(false), [path]);

  if (!item.children) {
    return (
      <li className="header-nav__item">
        <L className="button-sm header-nav__link" href={item.href} aria-current={current ? "page" : undefined}>{item.label}</L>
      </li>
    );
  }
  const id = `dropdown-${index}`;
  const m = item.mega;
  return (
    <li
      className={`header-nav__item header-nav__item--mega ${current ? "is-current" : ""} ${open ? "is-open" : ""}`.replace(/\s+/g, " ").trim()}
      data-dropdown=""
      onMouseEnter={() => { clearTimeout(timer.current); setOpen(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 150); }}
      onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
    >
      <button ref={btnRef} type="button" className="button-sm header-nav__link" aria-expanded={open ? "true" : "false"} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {item.label}<Icon name="caret" className="header-nav__caret" />
      </button>
      <div className="dropdown mega" id={id}>
        <div className="mega__in">
          <L className="mega__card" href={m.cta.href}>
            <span className="mega__photo"><Img file={m.image} alt="" className="mega__img" sizes="352px" /></span>
            <span className="mega__kicker micro">{m.kicker}</span>
            <span className="mega__title">{m.title}</span>
            <span className="mega__text">{m.text}</span>
            <span className="mega__cta button-sm">{m.cta.label}<Icon name="arrowUpRight" className="mega__cta-icon" /></span>
          </L>
          <div className="mega__links">
            <p className="mega__heading">{item.label}</p>
            <ul className="mega__list" role="list">
              {item.children.map((c, i) => (
                <li key={`${i}-${c.href}`}>
                  <L className="mega__link" href={c.href} aria-current={isCurrent(c.href, path) ? "page" : undefined}>
                    <span className="mega__link-body"><span className="mega__link-label">{c.label}</span><span className="mega__link-text">{c.text}</span></span>
                    <Icon name="arrowUpRight" className="mega__link-icon" />
                  </L>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ language dialog */

// Native <dialog>: focus is trapped while open, Esc closes it; we add backdrop-click and
// close-button handling, and pause smooth scrolling underneath. Language links reload the
// page, so <html lang/dir> and the prerendered page for that language are loaded.
function LangDialog({ dialogRef, current, path, onClosed }) {
  const { site, t } = useContent();
  return (
    <dialog
      className="lang-dialog"
      id="lang-dialog"
      aria-labelledby="lang-dialog-title"
      data-lang-dialog=""
      data-lenis-prevent=""
      ref={dialogRef}
      onClose={onClosed}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
    >
      <div className="lang-dialog__in">
        <div className="lang-dialog__head">
          <p className="m-eyebrow">{t("lang.eyebrow")}</p>
          <button type="button" className="lang-dialog__close" data-lang-close="" aria-label={t("aria.close")} onClick={() => dialogRef.current?.close()}><Icon name="close" /></button>
        </div>
        <h2 className="lang-dialog__title" id="lang-dialog-title">{t("lang.title")}</h2>
        <ul className="lang-dialog__list" role="list">
          {site.languages.map((l) => {
            const isCur = l.code === current.code;
            const prefix = (LOCALES.find((x) => x.code === l.code) || {}).prefix || "";
            return (
              <li key={l.code}>
                <a
                  className={`lang-option ${isCur ? "is-current" : ""}`}
                  href={`${prefix}${path === "/404.html" ? "/" : path}`}
                  hrefLang={l.code}
                  lang={l.code}
                  data-lang={l.code}
                  aria-current={isCur ? "true" : undefined}
                  onClick={isCur ? (e) => { e.preventDefault(); dialogRef.current?.close(); } : undefined}
                >
                  <span className="lang-option__code">{l.code.toUpperCase()}</span>
                  <span className="lang-option__body"><span className="lang-option__native" lang={l.code}>{l.native}</span><span className="lang-option__name">{l.name}</span></span>
                  {isCur ? <span className="lang-option__state"><Icon name="check" /></span> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ header */

export function Header() {
  const { site, markets, t } = useContent();
  const path = useEnglishPath();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const currentLang = site.languages.find((l) => l.code === site.lang) || site.languages[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // start loading the menu's market photos on the first touch/hover of the burger, so they are there when it opens
  const warmMenuPhotos = useCallback(() => {
    menuRef.current?.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = "eager"; });
  }, []);

  const setMenu = useCallback((open) => {
    setMenuOpen(open);
    lockPage(open);
    if (open) requestAnimationFrame(() => { const first = menuRef.current?.querySelector("a, button"); if (first) first.focus({ preventScroll: true }); });
  }, []);

  // Close the menu on navigation and with Esc.
  useEffect(() => { setMenu(false); }, [path, setMenu]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") { setMenu(false); burgerRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenu]);

  const openLang = (e) => {
    const d = dialogRef.current;
    if (!d || typeof d.showModal !== "function") return;
    openerRef.current = e.currentTarget;
    d.showModal();
    lockPage(true);
    const cur = d.querySelector(".lang-option.is-current");
    if (cur) cur.focus();
  };
  const onLangClosed = () => { lockPage(false); openerRef.current?.focus(); };

  const LangButton = ({ className }) => (
    <button type="button" className={className} data-lang-open="" aria-haspopup="dialog" aria-controls="lang-dialog" aria-label={t("lang.button", { name: currentLang.name })} onClick={openLang}>
      <Icon name="globe" className="header__lang-icon" /><span className="button-sm">{currentLang.code.toUpperCase()}</span>
    </button>
  );

  const groups = [
    { title: t("menu.opportunities"), links: [{ label: t("menu.allOpportunities"), href: "/opportunities/" }, { label: t("menu.requestAccess"), href: "/contact/?interest=investment" }] },
    { title: t("menu.insights"), links: [{ label: t("menu.perspectives"), href: "/insights/" }] },
    { title: t("menu.company"), links: [...site.navSecondary, { label: t("privacy"), href: "/privacy/" }] },
  ];

  return (
    <>
      <header className={`header${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-active" : ""}`} data-header="">
        <div className="header__in">
          <L className="header__l" href="/" aria-label={t("aria.home")}><Logo className="header-logo" /></L>
          <nav className="header__r" aria-label={t("aria.mainNav")}>
            <ul className="header-nav" role="list">{site.nav.map((item, i) => <NavItem key={`${i}-${item.href}`} item={item} path={path} index={i} />)}</ul>
            <LangButton className="header__lang" />
            <L className="header__accent" href={site.cta.href}><span className="button-sm">{site.cta.label}</span><Icon name="arrowUpRight" className="header__accent-icon" /></L>
          </nav>
          <LangButton className="header__lang header__lang--compact" />
          <div className="header__burger">
            <button
              ref={burgerRef}
              className={`btn-burger${menuOpen ? " is-active" : ""}`}
              type="button"
              aria-label={menuOpen ? t("aria.closeMenu") : t("aria.openMenu")}
              aria-expanded={menuOpen ? "true" : "false"}
              aria-controls="mobile-menu"
              data-burger=""
              onClick={() => setMenu(!menuOpen)}
              onPointerDown={warmMenuPhotos}
              onPointerEnter={warmMenuPhotos}
            >
              <span className="btn-burger__in"><span className="btn-burger__line btn-burger__line--1" /><span className="btn-burger__line btn-burger__line--2" /></span>
            </button>
          </div>
        </div>
        <div
          ref={menuRef}
          className={`fullmenu${menuOpen ? " is-active" : ""}`}
          id="mobile-menu"
          data-mobile-menu=""
          aria-hidden={menuOpen ? "false" : "true"}
          data-lenis-prevent=""
          onClick={(e) => { if (e.target.closest("a")) setMenu(false); }}
        >
          <div className="fullmenu__in">
            {/* phones: the section categories replace the services columns and the link groups */}
            <nav className="fullmenu__cats" aria-label={t("aria.siteSections")}>
              {site.nav.map((item, i) => (
                <L key={`${i}-${item.href}`} className="fullmenu__cat" href={item.href} aria-current={isCurrent(item.href, path) ? "page" : undefined}><span className="fullmenu__plus">+</span>{item.label}</L>
              ))}
            </nav>
            <div className="fullmenu__main">
              <section className="fullmenu__section fullmenu__section--services" aria-labelledby="fm-services">
                <div className="fullmenu__head">
                  <p className="fullmenu__title" id="fm-services">{t("menu.services")}</p><span className="fullmenu__rule" />
                  <L className="fullmenu__all button-sm" href="/engagements/">{t("menu.allEngagements")}<Icon name="arrowUpRight" className="fullmenu__arrow" /></L>
                </div>
                <div className="fullmenu__cols">
                  {site.nav.filter((n) => n.children && n.href !== "/markets/").map((n) => (
                    <div className="fullmenu__col" key={`${n.label}-${n.href}`}>
                      <L className="fullmenu__label" href={n.href}>{n.label}</L>
                      <ul role="list">
                        {n.children.map((c, i) => (
                          <li key={`${i}-${c.href}`}><L className="fullmenu__link" href={c.href} aria-current={isCurrent(c.href, path) ? "page" : undefined}>{c.label}</L></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
              <section className="fullmenu__section" aria-labelledby="fm-markets">
                <div className="fullmenu__head">
                  <p className="fullmenu__title" id="fm-markets">{t("menu.markets")}</p><span className="fullmenu__rule" />
                  <L className="fullmenu__all button-sm" href="/markets/">{t("menu.allMarkets")}<Icon name="arrowUpRight" className="fullmenu__arrow" /></L>
                </div>
                <div className="fullmenu__cards">
                  {markets.tiles.map((tile, i) => (
                    <L className="fullmenu__card" href={tile.href} key={`${i}-${tile.href}`}>
                      <span className="fullmenu__photo"><Img file={tile.image} alt="" sizes="(max-width: 1199px) 200px, 22vw" /></span>
                      <span className="fullmenu__caption">{tile.name}</span>
                    </L>
                  ))}
                </div>
              </section>
            </div>
            <nav className="fullmenu__more" aria-label={t("aria.siteSections")}>
              {groups.map((g) => (
                <div className="fullmenu__group" key={g.title}>
                  <p className="fullmenu__label">{g.title}</p>
                  <ul role="list">
                    {g.links.map((l, i) => (
                      <li key={`${i}-${l.href}`}><L className="fullmenu__link fullmenu__link--sm" href={l.href} aria-current={isCurrent(l.href, path) ? "page" : undefined}>{l.label}</L></li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="fullmenu__foot">
              <div className="fullmenu__contacts">
                <p className="fullmenu__statement">{site.statement}</p>
                <p className="fullmenu__geo">{site.geography.join(" · ")}</p>
              </div>
              <L className="fullmenu__btn" href={site.cta.href}><span className="button-sm">{site.cta.label}</span><Icon name="spark" className="fullmenu__btn-icon" /></L>
            </div>
          </div>
        </div>
      </header>
      <LangDialog dialogRef={dialogRef} current={currentLang} path={path} onClosed={onLangClosed} />
    </>
  );
}

/* ------------------------------------------------------------------ footer */

export function Footer() {
  const { site, home, t } = useContent();
  return (
    <footer className="m-footer">
      <div className="m-wrap">
        <div className="m-footer__top">
          {site.footer.map((col) => (
            <div className="m-footer__col" key={col.title}>
              <FitLabel as="p" className="m-eyebrow">{col.title}</FitLabel>
              <ul role="list">{col.links.map((l, i) => <li key={`${i}-${l.href}`}><L href={l.href}>{l.label}</L></li>)}</ul>
            </div>
          ))}
          <div className="m-footer__col m-footer__col--brand">
            <FitLabel as="p" className="m-eyebrow">Silk Road Capital</FitLabel>
            <p className="m-footer__statement">{site.statement}</p>
          </div>
        </div>
      </div>
      <MMarquee items={home.marquee} label={t("aria.marketsFooter")} />
      <div className="m-wrap">
        <div className="m-footer__bottom">
          <L className="m-footer__logo" href="/" aria-label={t("aria.home")}><Logo className="m-logo" /></L>
          <p>{site.copyright}, <span data-year="" suppressHydrationWarning>{new Date().getFullYear()}</span></p>
          <L href="/privacy/">{t("privacy")}</L>
        </div>
      </div>
    </footer>
  );
}

export function SkipLink() {
  const { t } = useContent();
  return <a className="skip-link" href="#main">{t("skip")}</a>;
}
