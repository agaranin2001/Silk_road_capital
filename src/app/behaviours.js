/* Page behaviours — the DOM-driven parts of the former assets/js/main.js, run once per page
 * after React has rendered it (see Page in App.jsx) and torn down on navigation.
 * Interactive pieces with their own state (header, menu, language dialog, selector, filter,
 * contact form) are React components; these behaviours find their elements by data attributes.
 * Client-only: loaded with a dynamic import so GSAP/Lenis never run during prerendering. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// `?noanim` disables animations (used for screenshot QA).
export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]noanim\b/.test(window.location.search);

/* ------------------------------------------------------------ smooth scrolling (Lenis)
 * Inertial wheel/trackpad scrolling, created once for the whole visit. Anchor links scroll
 * smoothly too, offset by the sticky header. Skipped for reduced motion. */
let lenis = null;
export const getLenis = () => lenis;
export function initSmoothScroll() {
  if (lenis || reducedMotion()) return lenis;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    autoRaf: true,
    anchors: { offset: -((document.querySelector("[data-header]") || {}).offsetHeight || 72) - 16 },
  });
  lenis.on("scroll", () => ScrollTrigger.update());
  return lenis;
}

/* ------------------------------------------------------------ helpers */

// Count numbers up from 0 (elements with data-count / data-suffix) inside root.
const countUp = (root) => {
  if (!root || reducedMotion()) return;
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

/**
 * Wire every behaviour inside `root` (the page's <main>). Returns a cleanup function that
 * removes listeners, observers, timers and GSAP animations (SplitText is reverted).
 * `introLead`: seconds the intro animations wait for (the preloader on first load).
 */
export function initPage(root, { introLead = 0 } = {}) {
  const motionOff = reducedMotion();
  const cleanups = [];
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };
  const onVisible = (el, fn, opts = { threshold: 0.25 }) => {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(); io.disconnect(); } });
    }, opts);
    io.observe(el);
    cleanups.push(() => io.disconnect());
    return undefined;
  };

  /* ---------------------------------------------------------- tabs (needs selector, catalogue, AI use cases) */
  $$("[data-tabs]", root).forEach((box) => {
    const list = $("[role='tablist']", box);
    if (!list) return;
    const tabsEls = $$("[role='tab']", list);
    const select = (tab, focus = false) => {
      tabsEls.forEach((t) => {
        const isOn = t === tab;
        t.setAttribute("aria-selected", String(isOn));
        t.tabIndex = isOn ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) { panel.classList.toggle("is-active", isOn); panel.hidden = !isOn; }
      });
      if (focus) tab.focus();
    };
    tabsEls.forEach((t, i) => {
      on(t, "click", () => select(t));
      on(t, "keydown", (e) => {
        const horizontal = !box.classList.contains("needs");
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
    if (tabsEls.length) select(tabsEls.find((t) => t.getAttribute("aria-selected") === "true") || tabsEls[0]);
  });

  /* ---------------------------------------------------------- interactive timeline */
  $$("[data-timeline]", root).forEach((box) => {
    const stepsEls = $$(".timeline__step", box);
    const activate = (s) => stepsEls.forEach((x) => x.classList.toggle("is-active", x === s));
    stepsEls.forEach((s) => ["mouseenter", "focus", "click"].forEach((type) => on(s, type, () => activate(s))));
  });

  /* ---------------------------------------------------------- scroll-triggered states */
  $$("[data-journey]", root).forEach((el) => onVisible(el, () => el.classList.add("is-visible")));
  $$(".dash", root).forEach((el) => onVisible(el, () => { el.classList.add("is-visible"); countUp(el); }));
  $$("[data-map]", root).forEach((el) => {
    onVisible(el, () => el.classList.add("is-visible"), { threshold: 0.15 });
    // On narrow screens the map scrolls sideways: start centred on the Gulf.
    if (el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.55;
  });

  /* ---------------------------------------------------------- auto-advancing accordion tabs (Mollie split) */
  $$("[data-autotabs]", root).forEach((box) => {
    const tabsEls = $$("[role='tab']", box);
    if (!tabsEls.length) return;
    const DUR = 6000;
    box.style.setProperty("--dur", `${DUR / 1000}s`);
    let i = 0, timer = null, auto = !motionOff;
    const select = (k, focus = false) => {
      i = (k + tabsEls.length) % tabsEls.length;
      tabsEls.forEach((t, j) => {
        const isOn = j === i;
        t.setAttribute("aria-selected", String(isOn));
        t.tabIndex = isOn ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) { panel.classList.toggle("is-active", isOn); panel.hidden = !isOn; }
        if (panel && isOn && panel.closest(".m-split__panel.is-in")) countUp(panel);
      });
      if (focus) tabsEls[i].focus();
      if (auto) { box.classList.remove("is-auto"); void box.offsetWidth; box.classList.add("is-auto"); }
    };
    const start = () => { if (!auto) return; clearInterval(timer); timer = setInterval(() => select(i + 1), DUR); };
    const stop = () => { auto = false; clearInterval(timer); box.classList.remove("is-auto"); };
    cleanups.push(() => clearInterval(timer));
    tabsEls.forEach((t, k) => {
      on(t, "click", () => { stop(); select(k); });
      on(t, "keydown", (e) => {
        let n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = k + 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = k - 1;
        if (n !== null) { e.preventDefault(); stop(); select(n, true); }
      });
    });
    select(0);
    if ("IntersectionObserver" in window && auto) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting && auto) { select(i); start(); } else clearInterval(timer);
      }), { threshold: 0.35 });
      io.observe(box);
      cleanups.push(() => io.disconnect());
    }
  });

  /* ---------------------------------------------------------- auto-scrolling card strips: start when reached */
  $$(".cell-marquee", root).forEach((el) => onVisible(el, () => el.classList.add("is-running"), { threshold: 0.3 }));

  /* ---------------------------------------------------------- UI mock-ups: reveal on scroll */
  $$(".m-vis, .m-fan, .m-split__panel, .m-pipe", root).forEach((el) => {
    if (motionOff) { el.classList.add("is-in"); return; }
    onVisible(el, () => {
      el.classList.add("is-in");
      countUp(el.classList.contains("m-split__panel") ? $(".m-split__view.is-active", el) : el);
    }, { threshold: 0.3 });
  });

  /* ---------------------------------------------------------- story carousel (infinite)
   * The real cards are flanked by one cloned set on each side. When scrolling settles inside a
   * clone set, the track jumps by one set width to the matching real card, so prev/next (and
   * swiping) never reach an end. Clones are hidden from assistive tech and removed on cleanup. */
  $$("[data-carousel]", root).forEach((box) => {
    const track = $(".m-carousel__track", box);
    const originals = track ? $$(".m-story", track) : [];
    if (!originals.length) return;
    const clone = (c) => {
      const n = c.cloneNode(true);
      n.setAttribute("aria-hidden", "true");
      n.setAttribute("inert", "");
      n.classList.add("is-clone");
      $$("a, button", n).forEach((el) => { el.tabIndex = -1; });
      return n;
    };
    const clones = [];
    originals.forEach((c) => { const n = clone(c); clones.push(n); track.appendChild(n); });
    originals.slice().reverse().forEach((c) => { const n = clone(c); clones.push(n); track.insertBefore(n, track.firstChild); });
    cleanups.push(() => clones.forEach((n) => n.remove()));
    const cards = $$(".m-story", track);
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 20;
    const step = () => cards[0].getBoundingClientRect().width + gap();
    const setWidth = () => originals[0].offsetLeft - cards[0].offsetLeft;
    const centerOn = (c) => c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2;
    const jump = (left) => {
      track.style.scrollSnapType = "none";
      track.scrollLeft = left;
      later(() => { track.style.scrollSnapType = ""; }, 60);
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
    on(track, "scroll", () => {
      window.requestAnimationFrame(mark);
      clearTimeout(idle);
      idle = setTimeout(recentre, 140);
    }, { passive: true });
    cleanups.push(() => clearTimeout(idle));
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: motionOff ? "auto" : "smooth" });
    const prev = $("[data-carousel-prev]", box), next = $("[data-carousel-next]", box);
    if (prev) on(prev, "click", () => go(-1));
    if (next) on(next, "click", () => go(1));
    // start on the first real card; the clones on either side show its neighbours
    jump(centerOn(originals[0]));
    on(window, "resize", () => jump(centerOn($(".m-story.is-current:not(.is-clone)", track) || originals[0])));
    mark();
  });

  /* ---------------------------------------------------------- country carousel
   * Arrows scroll one tile; at either end they wrap around to the other end. */
  $$("[data-countries]", root).forEach((box) => {
    const track = $("[data-countries-track]", box);
    if (!track) return;
    const step = () => { const li = track.firstElementChild; return li ? li.getBoundingClientRect().width + 20 : 300; };
    const behavior = motionOff ? "auto" : "smooth";
    // In right-to-left pages scrollLeft runs from 0 towards negative values.
    const sign = () => (getComputedStyle(track).direction === "rtl" ? -1 : 1);
    const go = (dir) => {
      const max = track.scrollWidth - track.clientWidth - 2;
      const pos = Math.abs(track.scrollLeft);
      if (dir > 0 && pos >= max) track.scrollTo({ left: 0, behavior });
      else if (dir < 0 && pos <= 2) track.scrollTo({ left: sign() * track.scrollWidth, behavior });
      else track.scrollBy({ left: sign() * dir * step(), behavior });
    };
    const prev = $("[data-countries-prev]", box), next = $("[data-countries-next]", box);
    if (prev) on(prev, "click", () => go(-1));
    if (next) on(next, "click", () => go(1));
  });

  /* ---------------------------------------------------------- hero cases
   * Each case (country photo + status chips + engagement card) plays its chips one by one;
   * when the last chip has been read, the next case cross-fades in and plays. */
  $$("[data-hero-cases]", root).forEach((media) => {
    const cases = $$("[data-case]", media);
    const dots = $$(".m-case-dot", media);
    const chipsOf = (c) => $$(".m-chip", c);
    if (!cases.length) return;
    if (motionOff) { cases.forEach((c) => chipsOf(c).forEach((x) => x.classList.add("is-in"))); return; }
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
      chips.forEach((x, i) => later(() => x.classList.add("is-in"), 900 + i * 1100));
      later(() => {
        chips.forEach((x) => x.classList.remove("is-in"));
        later(() => { k = (k + 1) % cases.length; show(k); run(); }, 650);
      }, 900 + chips.length * 1100 + 2800);
    };
    show(0);
    later(run, introLead * 1000);
  });

  /* ---------------------------------------------------------- before / after toggle (mobile) */
  $$("[data-ba]", root).forEach((box) => {
    box.dataset.show = "after";
    const btns = $$("[data-ba-show]", box);
    btns.forEach((b) => on(b, "click", () => {
      box.dataset.show = b.dataset.baShow;
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }));
  });

  /* ---------------------------------------------------------- parallax on photo bands */
  const bands = $$("[data-parallax]", root);
  if (bands.length && !motionOff) {
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
    on(window, "scroll", () => window.requestAnimationFrame(tick), { passive: true });
  }

  /* ---------------------------------------------------------- reveal animations (shared Silk Road system) */
  const html = document.documentElement;
  const reveal = () => html.classList.remove("anim-pending");
  let ctx = null;
  let cancelled = false;
  const initAnimations = () => {
    if (cancelled) return;
    if (motionOff) { reveal(); return; }
    // Arabic letters join, so splitting into characters would break the script: animate words.
    const joined = html.lang === "ar";
    const unitsOf = (split) => (joined ? split.words : split.chars);

    ctx = gsap.context(() => {
      // Character "typewriter" fade (opacity 0 → .4 → 1) on headings.
      const typeChars = (el, { delay = 0, speed = 0.03, onScroll = true } = {}) => {
        const split = new SplitText(el, joined ? { type: "words" } : { type: "words,chars", charsClass: "tw-char" });
        const units = unitsOf(split);
        const step = joined ? speed * 3 : speed;
        gsap.set(units, { opacity: 0 });
        const play = () => gsap.to(units, {
          keyframes: [{ opacity: 0.4, duration: step * 2, ease: "none" }, { opacity: 1, duration: step * 6, ease: "power1.out" }],
          stagger: step,
          delay,
        });
        if (onScroll) ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
        else play();
      };

      // Intro
      const heroLines = $$(".m-display__line", root);
      if (heroLines.length) {
        gsap.from(heroLines, { yPercent: 40, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: introLead + 0.1 });
      } else {
        const introTitle = $("[data-anim='intro-title']", root);
        if (introTitle) typeChars(introTitle, { delay: introLead + 0.1, speed: 0.035, onScroll: false });
      }
      const media = $("[data-anim='intro-media']", root);
      if (media) gsap.from(media, { opacity: 0, y: 40, duration: 1.1, delay: introLead + 0.35, ease: "power3.out" });
      $$("[data-anim='intro-text'], [data-anim='intro-button']", root).forEach((el, i) => {
        gsap.from(el, { opacity: 0, y: 30, duration: 0.9, delay: introLead + 0.4 + i * 0.12, ease: "power3.out" });
      });

      $$("[data-anim='chars']", root).forEach((el) => typeChars(el));

      // Masked line reveal + colour wash on large statements.
      $$("[data-anim='lines']", root).forEach((el) => {
        const split = new SplitText(el, { type: joined ? "lines,words" : "lines,words,chars", linesClass: "split-line", mask: "lines" });
        gsap.set(split.lines, { yPercent: 100 });
        gsap.set(unitsOf(split), { opacity: 0.4 });
        ScrollTrigger.create({
          trigger: el, start: "top 85%", once: true,
          onEnter: () => {
            gsap.to(split.lines, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 });
            gsap.to(unitsOf(split), { opacity: 1, duration: 0.4, stagger: joined ? 0.03 : 0.006, delay: 0.4 });
          },
        });
      });

      const fades = $$("[data-anim='fade-up']", root);
      if (fades.length) {
        gsap.set(fades, { opacity: 0, y: 30 });
        ScrollTrigger.batch(fades, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform" }),
        });
      }
    }, root);

    reveal();
    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!cancelled) ScrollTrigger.refresh(); });
  };

  // Split text only after the fonts have loaded so line/char measurements are correct.
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(initAnimations);
  else initAnimations();

  return () => {
    cancelled = true;
    timers.forEach((id) => clearTimeout(id));
    cleanups.forEach((fn) => fn());
    if (ctx) ctx.revert();
  };
}
