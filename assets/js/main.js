/* Silk Road Capital — site behaviour. Vanilla JS; GSAP (CDN) is optional and only
 * drives the reveal animations (same system as the Silk Road Travel site). Every
 * feature degrades to plain HTML links/forms if this file fails to load. */
(() => {
  "use strict";

  const CONFIG = Object.assign({ contactEndpoint: "/api/contact" }, window.SRC_CONFIG || {});
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  // `?noanim` disables reveal animations (used for screenshot QA).
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]noanim\b/.test(window.location.search);
  // The page intro waits for the preloader curtain (≈2.5s, see main.css) to lift.
  const introLead = document.querySelector("[data-preloader]") && !document.documentElement.classList.contains("no-preloader") ? 2.5 : 0;

  /* ------------------------------------------------------------ smooth scrolling (Lenis, optional)
   * Inertial wheel/trackpad scrolling. Anchor links scroll smoothly too, offset by the
   * sticky header. Skipped for reduced motion; native scrolling remains otherwise. */
  const lenis = window.Lenis && !reducedMotion
    ? new window.Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        autoRaf: true,
        anchors: { offset: -((document.querySelector("[data-header]") || {}).offsetHeight || 72) - 16 },
      })
    : null;
  if (lenis) lenis.on("scroll", () => { if (window.ScrollTrigger) window.ScrollTrigger.update(); });

  const onVisible = (el, fn, opts = { threshold: 0.25 }) => {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(); io.disconnect(); } });
    }, opts);
    io.observe(el);
  };

  // Count numbers up from 0 (elements with data-count / data-suffix) inside root.
  const countUp = (root) => {
    if (!root || reducedMotion) return;
    $$("[data-count]", root).forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const decimals = (el.dataset.count.split(".")[1] || "").length;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1200);
        el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
        if (p < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    });
  };

  /* ------------------------------------------------------------ footer year */
  $$("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ------------------------------------------------------------ header: scroll state */
  const header = $("[data-header]");
  let menuOpen = false;
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ------------------------------------------------------------ language dialog
   * Native <dialog>: focus is trapped while open, Esc closes it; we add backdrop-click
   * and close-button handling, and pause smooth scrolling underneath. */
  const langDialog = $("[data-lang-dialog]");
  if (langDialog && typeof langDialog.showModal === "function") {
    let opener = null;
    const close = () => langDialog.close();
    $$("[data-lang-open]").forEach((b) => b.addEventListener("click", () => {
      opener = b;
      langDialog.showModal();
      if (lenis) lenis.stop();
      const current = $(".lang-option.is-current", langDialog);
      if (current) current.focus();
    }));
    langDialog.addEventListener("close", () => { if (lenis) lenis.start(); if (opener) opener.focus(); });
    $("[data-lang-close]", langDialog).addEventListener("click", close);
    langDialog.addEventListener("click", (e) => { if (e.target === langDialog) close(); });
    $$(".lang-option.is-current", langDialog).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); close(); }));
  }

  /* ------------------------------------------------------------ dropdowns */
  $$("[data-dropdown]").forEach((item) => {
    const btn = $("button", item);
    const set = (open) => { item.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    let timer;
    item.addEventListener("mouseenter", () => { clearTimeout(timer); set(true); });
    item.addEventListener("mouseleave", () => { timer = setTimeout(() => set(false), 150); });
    btn.addEventListener("click", () => set(!item.classList.contains("is-open")));
    item.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(false); btn.focus(); } });
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) set(false); });
  });

  /* Localised strings and the locale path prefix ("" for English, "/ar" …), set by the layout. */
  const I18N = Object.assign({ base: "", openMenu: "Open menu", closeMenu: "Close menu", startingPoint: "starting point: {value}", errName: "Please enter your name", errEmail: "Please enter a valid email address", errMessage: "Please add a few words about the opportunity", regarding: "Regarding: " }, window.SRC_I18N || {});

  /* ------------------------------------------------------------ section labels
   * Labels stay on one line. When the text is wider than the space available it is
   * duplicated and scrolls in an endless loop (re-checked on resize). */
  const labelTexts = $$(".m-eyebrow, .m-pill-eyebrow, .head__title > .body-md").filter((el) => !el.closest(".m-ui, dialog"));
  labelTexts.forEach((el) => {
    const text = el.textContent.trim();
    if (!text) return;
    el.textContent = "";
    el.classList.add("label-fit");
    el.insertAdjacentHTML("beforeend", '<span class="label-fit__clip"><span class="label-fit__track"><span class="label-fit__copy"></span><span class="label-fit__copy" aria-hidden="true"></span></span></span>');
    $$(".label-fit__copy", el).forEach((c) => { c.textContent = text; });
  });
  const fitLabels = () => labelTexts.forEach((el) => {
    const clip = $(".label-fit__clip", el), copy = $(".label-fit__copy", el);
    if (!clip || !copy) return;
    el.classList.remove("is-scrolling");
    const over = copy.scrollWidth > clip.clientWidth + 1;
    el.classList.toggle("is-scrolling", over);
    if (over) clip.style.setProperty("--label-dur", `${Math.max(8, copy.offsetWidth / 35)}s`);
  });
  if (labelTexts.length) {
    fitLabels();
    let fitTimer;
    window.addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitLabels, 150); });
    if (document.fonts) document.fonts.ready.then(fitLabels);
  }

  /* ------------------------------------------------------------ full-screen menu */
  const burger = $("[data-burger]");
  const menu = $("[data-mobile-menu]");
  const setMenu = (open) => {
    if (!burger || !menu) return;
    menuOpen = open;
    burger.classList.toggle("is-active", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? I18N.closeMenu : I18N.openMenu);
    menu.classList.toggle("is-active", open);
    menu.setAttribute("aria-hidden", String(!open));
    header.classList.toggle("is-active", open);
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    document.body.classList.toggle("is-locked", open);
    if (open) { const first = $("a, button", menu); if (first) first.focus({ preventScroll: true }); }
  };
  if (burger && menu) {
    burger.addEventListener("click", () => setMenu(!menuOpen));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) { setMenu(false); burger.focus(); } });
  }

  /* ------------------------------------------------------------ tabs (needs selector, catalogue, AI use cases) */
  $$("[data-tabs]").forEach((root) => {
    const list = $("[role='tablist']", root);
    const tabsEls = $$("[role='tab']", list);
    const select = (tab, focus = false) => {
      tabsEls.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) { panel.classList.toggle("is-active", on); panel.hidden = !on; }
      });
      if (focus) tab.focus();
    };
    tabsEls.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const horizontal = !root.classList.contains("needs");
        const next = horizontal ? "ArrowRight" : "ArrowDown";
        const prev = horizontal ? "ArrowLeft" : "ArrowUp";
        let k = null;
        if (e.key === next) k = (i + 1) % tabsEls.length;
        else if (e.key === prev) k = (i - 1 + tabsEls.length) % tabsEls.length;
        else if (e.key === "Home") k = 0;
        else if (e.key === "End") k = tabsEls.length - 1;
        if (k !== null) { e.preventDefault(); select(tabsEls[k], true); }
      });
    });
    select(tabsEls.find((t) => t.getAttribute("aria-selected") === "true") || tabsEls[0]);
  });

  /* ------------------------------------------------------------ interactive timeline */
  $$("[data-timeline]").forEach((root) => {
    const stepsEls = $$(".timeline__step", root);
    const activate = (s) => stepsEls.forEach((x) => x.classList.toggle("is-active", x === s));
    stepsEls.forEach((s) => {
      s.addEventListener("mouseenter", () => activate(s));
      s.addEventListener("focus", () => activate(s));
      s.addEventListener("click", () => activate(s));
    });
  });

  /* ------------------------------------------------------------ scroll-triggered states */
  $$("[data-journey]").forEach((el) => onVisible(el, () => el.classList.add("is-visible")));
  $$(".dash").forEach((el) => onVisible(el, () => el.classList.add("is-visible")));
  $$("[data-map]").forEach((el) => {
    onVisible(el, () => el.classList.add("is-visible"), { threshold: 0.15 });
    // On narrow screens the map scrolls sideways: start centred on the Gulf.
    if (el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.55;
  });

  /* ------------------------------------------------------------ auto-advancing accordion tabs (Mollie split) */
  $$("[data-autotabs]").forEach((root) => {
    const tabsEls = $$("[role='tab']", root);
    const DUR = 6000;
    root.style.setProperty("--dur", `${DUR / 1000}s`);
    let i = 0, timer = null, auto = !reducedMotion;
    const select = (k, focus = false) => {
      i = (k + tabsEls.length) % tabsEls.length;
      tabsEls.forEach((t, j) => {
        const on = j === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) { panel.classList.toggle("is-active", on); panel.hidden = !on; }
        if (panel && on && panel.closest(".m-split__panel.is-in")) countUp(panel);
      });
      if (focus) tabsEls[i].focus();
      if (auto) { root.classList.remove("is-auto"); void root.offsetWidth; root.classList.add("is-auto"); }
    };
    const start = () => { if (!auto) return; clearInterval(timer); timer = setInterval(() => select(i + 1), DUR); };
    const stop = () => { auto = false; clearInterval(timer); root.classList.remove("is-auto"); };
    tabsEls.forEach((t, k) => {
      t.addEventListener("click", () => { stop(); select(k); });
      t.addEventListener("keydown", (e) => {
        let n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = k + 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = k - 1;
        if (n !== null) { e.preventDefault(); stop(); select(n, true); }
      });
    });
    select(0);
    if ("IntersectionObserver" in window && auto) {
      new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting && auto) { select(i); start(); } else clearInterval(timer);
      }), { threshold: 0.35 }).observe(root);
    }
  });

  /* ------------------------------------------------------------ UI mock-ups: reveal on scroll */
  $$(".m-vis, .m-fan, .m-split__panel, .m-pipe").forEach((el) => {
    if (reducedMotion) { el.classList.add("is-in"); return; }
    onVisible(el, () => {
      el.classList.add("is-in");
      countUp(el.classList.contains("m-split__panel") ? $(".m-split__view.is-active", el) : el);
    }, { threshold: 0.3 });
  });

  /* ------------------------------------------------------------ story carousel (infinite)
   * The real cards are flanked by one cloned set on each side. When scrolling settles
   * inside a clone set, the track jumps by one set width to the matching real card,
   * so prev/next (and swiping) never reach an end. Clones are hidden from assistive tech. */
  $$("[data-carousel]").forEach((root) => {
    const track = $(".m-carousel__track", root);
    const originals = $$(".m-story", track);
    if (!originals.length) return;
    const clone = (c) => {
      const n = c.cloneNode(true);
      n.setAttribute("aria-hidden", "true");
      n.setAttribute("inert", "");
      n.classList.add("is-clone");
      $$("a, button", n).forEach((el) => { el.tabIndex = -1; });
      return n;
    };
    originals.forEach((c) => track.appendChild(clone(c)));
    originals.slice().reverse().forEach((c) => track.insertBefore(clone(c), track.firstChild));
    const cards = $$(".m-story", track);
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 20;
    const step = () => cards[0].getBoundingClientRect().width + gap();
    const setWidth = () => originals[0].offsetLeft - cards[0].offsetLeft;
    const centerOn = (c) => c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2;
    const jump = (left) => {
      track.style.scrollSnapType = "none";
      track.scrollLeft = left;
      setTimeout(() => { track.style.scrollSnapType = ""; }, 60);
    };
    const mark = () => {
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = null, dist = Infinity;
      cards.forEach((c) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < dist) { dist = d; best = c; } });
      cards.forEach((c) => c.classList.toggle("is-current", c === best));
    };
    // Re-centre into the real set once scrolling stops.
    const recentre = () => {
      const w = setWidth();
      const first = centerOn(originals[0]);
      if (track.scrollLeft < first - step() / 2) jump(track.scrollLeft + w);
      else if (track.scrollLeft > first + w - step() / 2) jump(track.scrollLeft - w);
      mark();
    };
    let idle;
    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(mark);
      clearTimeout(idle);
      idle = setTimeout(recentre, 140);
    }, { passive: true });
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reducedMotion ? "auto" : "smooth" });
    $("[data-carousel-prev]", root).addEventListener("click", () => go(-1));
    $("[data-carousel-next]", root).addEventListener("click", () => go(1));
    // start on the second real card so neighbours show on both sides, like the reference
    jump(centerOn(originals[1] || originals[0]));
    window.addEventListener("resize", () => jump(centerOn($(".m-story.is-current:not(.is-clone)", track) || originals[1] || originals[0])));
    mark();
  });

  /* ------------------------------------------------------------ country carousel
   * Arrows scroll one tile; at either end they wrap around to the other end. */
  $$("[data-countries]").forEach((root) => {
    const track = $("[data-countries-track]", root);
    const step = () => { const li = track.firstElementChild; return li ? li.getBoundingClientRect().width + 20 : 300; };
    const behavior = reducedMotion ? "auto" : "smooth";
    // In right-to-left pages scrollLeft runs from 0 towards negative values.
    const sign = () => (getComputedStyle(track).direction === "rtl" ? -1 : 1);
    const go = (dir) => {
      const max = track.scrollWidth - track.clientWidth - 2;
      const pos = Math.abs(track.scrollLeft);
      if (dir > 0 && pos >= max) track.scrollTo({ left: 0, behavior });
      else if (dir < 0 && pos <= 2) track.scrollTo({ left: sign() * track.scrollWidth, behavior });
      else track.scrollBy({ left: sign() * dir * step(), behavior });
    };
    $("[data-countries-prev]", root).addEventListener("click", () => go(-1));
    $("[data-countries-next]", root).addEventListener("click", () => go(1));
  });

  /* ------------------------------------------------------------ hero cases
   * Each case (country photo + status chips + engagement card) plays its chips one by
   * one; when the last chip has been read, the next case cross-fades in and plays. */
  $$("[data-hero-cases]").forEach((media) => {
    const cases = $$("[data-case]", media);
    const dots = $$(".m-case-dot", media);
    const chipsOf = (c) => $$(".m-chip", c);
    if (reducedMotion) { cases.forEach((c) => chipsOf(c).forEach((x) => x.classList.add("is-in"))); return; }
    let k = 0;
    const show = (n) => {
      cases.forEach((c, i) => {
        c.classList.toggle("is-active", i === n);
        if (i === n) c.removeAttribute("aria-hidden"); else c.setAttribute("aria-hidden", "true");
        if (i === n) { c.classList.remove("is-play"); void c.offsetWidth; c.classList.add("is-play"); }
        $$("a", c).forEach((a) => { a.tabIndex = i === n ? 0 : -1; });
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === n));
    };
    const run = () => {
      const chips = chipsOf(cases[k]);
      chips.forEach((x) => x.classList.remove("is-in"));
      chips.forEach((x, i) => setTimeout(() => x.classList.add("is-in"), 900 + i * 1100));
      setTimeout(() => {
        chips.forEach((x) => x.classList.remove("is-in"));
        setTimeout(() => { k = (k + 1) % cases.length; show(k); run(); }, 650);
      }, 900 + chips.length * 1100 + 2800);
    };
    show(0);
    if (cases.length) setTimeout(run, introLead * 1000);
  });

  /* ------------------------------------------------------------ before / after toggle (mobile) */
  $$("[data-ba]").forEach((root) => {
    root.dataset.show = "after";
    $$("[data-ba-show]", root).forEach((b) => b.addEventListener("click", () => {
      root.dataset.show = b.dataset.baShow;
      $$("[data-ba-show]", root).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }));
  });

  /* ------------------------------------------------------------ category filter (insights) */
  $$("[data-filter]").forEach((bar) => {
    const items = $$(bar.dataset.filter);
    $$("[data-filter-value]", bar).forEach((btn) => btn.addEventListener("click", () => {
      const v = btn.dataset.filterValue;
      $$("[data-filter-value]", bar).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      items.forEach((it) => { it.hidden = Boolean(v) && !it.dataset.category.split("|").includes(v); });
    }));
  });

  /* ------------------------------------------------------------ engagement selector */
  const selector = $("[data-selector]");
  if (selector) {
    const data = JSON.parse(($("[data-selector-packages-data]") || {}).textContent || "{}");
    const title = $("[data-selector-title]", selector);
    const list = $("[data-selector-packages]", selector);
    const cta = $("[data-selector-cta]", selector);
    const result = $("[data-selector-result]", selector);
    const update = () => {
      const picked = (name) => $(`input[name="${name}"]:checked`, selector);
      const need = picked("need"), start = picked("start"), where = picked("where");
      const slugs = [];
      [need && need.dataset.adds, need && need.dataset.also, start && start.dataset.adds].forEach((s) => { if (s && !slugs.includes(s) && slugs.length < 2) slugs.push(s); });
      if (!slugs.length) return;
      title.textContent = slugs.map((s) => data[s].name).join(" + ") + (where ? ` — ${where.dataset.label}` : "");
      list.innerHTML = "";
      slugs.forEach((s) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `${I18N.base}/engagements/${s}/`;
        a.innerHTML = '<span class="body-lg"></span><span class="body-sm color-white-60"></span>';
        a.children[0].textContent = data[s].name;
        a.children[1].textContent = data[s].short;
        li.appendChild(a);
        list.appendChild(li);
      });
      const ready = Boolean(need && start && where);
      const params = new URLSearchParams({ topic: `${title.textContent}${start ? ` (${I18N.startingPoint.replace("{value}", start.dataset.label)})` : ""}` });
      const interest = data[slugs[0]].interest;
      if (interest) params.set("interest", interest);
      cta.href = `${I18N.base}/contact/?${params}`;
      cta.classList.toggle("is-disabled", !ready);
      cta.setAttribute("aria-disabled", String(!ready));
      result.classList.toggle("is-ready", ready);
    };
    selector.addEventListener("change", update);
    selector.addEventListener("submit", (e) => e.preventDefault());
  }

  /* ------------------------------------------------------------ contact form */
  const form = $("[data-contact-form]");
  if (form) {
    const msgs = JSON.parse(($("[data-contact-messages]") || {}).textContent || "{}");
    const ALIASES = { "business-build": "advisory", growth: "digital", structure: "advisory" };
    const q = new URLSearchParams(window.location.search);
    const interest = ALIASES[q.get("interest")] || q.get("interest");
    if (interest) { const box = $(`input[name="interests"][value="${CSS.escape(interest)}"]`, form); if (box) box.checked = true; }
    const topic = q.get("topic");
    if (topic && form.message && !form.message.value) form.message.value = `${I18N.regarding}${topic.slice(0, 200)}\n\n`;

    const setError = (name, message) => {
      const input = form.elements[name];
      const field = input && input.closest && input.closest("[data-field]");
      if (!field) return;
      field.classList.toggle("is-error", Boolean(message));
      const out = $("[data-error]", field);
      if (out) out.textContent = message || "";
      if (message) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    };
    const validate = (d) => {
      const e = {};
      if (!d.name || d.name.trim().length < 2) e.name = I18N.errName;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((d.email || "").trim())) e.email = I18N.errEmail;
      if (!d.message || (d.message.startsWith(I18N.regarding) ? d.message.split("\n").slice(1).join("\n") : d.message).trim().length < 10) e.message = I18N.errMessage;
      return e;
    };
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      data.interests = fd.getAll("interests");
      const errors = validate(data);
      ["name", "email", "message"].forEach((n) => setError(n, errors[n]));
      const formError = $("[data-form-error]", form);
      formError.textContent = "";
      if (Object.keys(errors).length) { form.elements[Object.keys(errors)[0]].focus(); return; }

      const submit = $("[data-submit]", form), label = $("[data-submit-label]", form), prev = label.textContent;
      submit.classList.add("is-loading"); submit.setAttribute("aria-busy", "true"); label.textContent = msgs.sending || "Sending…";
      try {
        const res = await fetch(CONFIG.contactEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok !== false) {
          form.hidden = true;
          const ok = $("[data-contact-success]");
          ok.hidden = false;
          ok.setAttribute("tabindex", "-1");
          ok.focus();
          return;
        }
        if (out.fields) Object.entries(out.fields).forEach(([k, v]) => setError(k, v));
        formError.textContent = out.error === "not_configured" ? msgs.notConfigured : msgs.error;
      } catch {
        formError.textContent = msgs.error;
      } finally {
        submit.classList.remove("is-loading"); submit.removeAttribute("aria-busy"); label.textContent = prev;
      }
    });
  }

  /* ------------------------------------------------------------ parallax on photo bands */
  const bands = $$("[data-parallax]");
  if (bands.length && !reducedMotion) {
    const tick = () => {
      bands.forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const im = b.querySelector("img");
        if (im) im.style.transform = `translate3d(0, ${(-12 + p * 14).toFixed(2)}%, 0)`;
      });
    };
    tick();
    window.addEventListener("scroll", () => window.requestAnimationFrame(tick), { passive: true });
  }

  /* ------------------------------------------------------------ reveal animations (shared Silk Road system) */
  const root = document.documentElement;
  const reveal = () => root.classList.remove("anim-pending");
  const initAnimations = () => {
    const gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger || reducedMotion) return reveal();
    gsap.registerPlugin(window.ScrollTrigger);
    const hasSplit = Boolean(window.SplitText);
    if (hasSplit) gsap.registerPlugin(window.SplitText);

    // Arabic letters join, so splitting into characters would break the script: animate words.
    const joined = document.documentElement.lang === "ar";
    const unitsOf = (split) => (joined ? split.words : split.chars);

    // Character "typewriter" fade (opacity 0 → .4 → 1) on headings.
    const typeChars = (el, { delay = 0, speed = 0.03, onScroll = true } = {}) => {
      if (!hasSplit) {
        gsap.from(el, { opacity: 0, y: 30, duration: 0.8, delay, ease: "power3.out", scrollTrigger: onScroll ? { trigger: el, start: "top 88%", once: true } : undefined });
        return;
      }
      const split = new window.SplitText(el, joined ? { type: "words" } : { type: "words,chars", charsClass: "tw-char" });
      const units = unitsOf(split);
      const step = joined ? speed * 3 : speed;
      gsap.set(units, { opacity: 0 });
      const play = () => gsap.to(units, {
        keyframes: [{ opacity: 0.4, duration: step * 2, ease: "none" }, { opacity: 1, duration: step * 6, ease: "power1.out" }],
        stagger: step,
        delay,
      });
      if (onScroll) window.ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
      else play();
    };

    // Intro
    const heroLines = $$(".m-display__line");
    if (heroLines.length) {
      gsap.from(heroLines, { yPercent: 40, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: introLead + 0.1 });
    } else {
      const introTitle = $("[data-anim='intro-title']");
      if (introTitle) typeChars(introTitle, { delay: introLead + 0.1, speed: 0.035, onScroll: false });
    }
    const media = $("[data-anim='intro-media']");
    if (media) gsap.from(media, { opacity: 0, y: 40, duration: 1.1, delay: introLead + 0.35, ease: "power3.out" });
    $$("[data-anim='intro-text'], [data-anim='intro-button']").forEach((el, i) => {
      gsap.from(el, { opacity: 0, y: 30, duration: 0.9, delay: introLead + 0.4 + i * 0.12, ease: "power3.out" });
    });

    $$("[data-anim='chars']").forEach((el) => typeChars(el));

    // Masked line reveal + colour wash on large statements.
    $$("[data-anim='lines']").forEach((el) => {
      if (!hasSplit) { gsap.from(el, { opacity: 0, y: 30, duration: 0.8, scrollTrigger: { trigger: el, start: "top 88%", once: true } }); return; }
      const split = new window.SplitText(el, { type: joined ? "lines,words" : "lines,words,chars", linesClass: "split-line", mask: "lines" });
      gsap.set(split.lines, { yPercent: 100 });
      gsap.set(unitsOf(split), { opacity: 0.4 });
      window.ScrollTrigger.create({
        trigger: el, start: "top 85%", once: true,
        onEnter: () => {
          gsap.to(split.lines, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 });
          gsap.to(unitsOf(split), { opacity: 1, duration: 0.4, stagger: joined ? 0.03 : 0.006, delay: 0.4 });
        },
      });
    });

    const batchReveal = (selector, from) => {
      const els = $$(selector);
      if (!els.length) return;
      gsap.set(els, from);
      window.ScrollTrigger.batch(els, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform" }),
      });
    };
    batchReveal("[data-anim='fade-up']", { opacity: 0, y: 30 });

    reveal();
    window.addEventListener("load", () => window.ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => window.ScrollTrigger.refresh());
  };

  if (document.fonts && document.fonts.ready) {
    // Split text only after Inter has loaded so line/char measurements are correct.
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(initAnimations);
  } else {
    initAnimations();
  }
})();
