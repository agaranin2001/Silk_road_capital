import { html } from "../lib/html.mjs";
import { page } from "../components/layout.mjs";
import { mHero, mMarquee, mLinkGrid, mPair, mWide, mTabsSplit, needsPanel, aiPanel, mStories, mGlow, mSupport, mCta, mTiles } from "../components/blocks.mjs";
import { home, t } from "../content/index.mjs";

// Home page — section order follows the mollie.com home page component sequence.
export default function render() {
  const h = home;
  const body = html`
${mHero({ ...h.hero, eyebrow: h.hero.eyebrow })}
${mMarquee(h.marquee)}
${mLinkGrid(h.links)}
${mPair(h.pairs[0])}
${mWide(h.wide, { id: "jv" })}
${mPair(h.pairs[1])}
${mTabsSplit({
  id: "needs",
  eyebrow: h.needs.eyebrow,
  title: h.needs.title,
  text: h.needs.text,
  items: h.needs.items.map((n) => ({ ...n, title: n.label })),
  renderPanel: (n) => needsPanel(n),
})}
${mStories(h.stories)}
${mTabsSplit({
  id: "ai",
  eyebrow: h.ai.eyebrow,
  title: h.ai.split.title,
  text: h.ai.split.text,
  link: h.ai.split.link,
  items: h.ai.ladder.map((s, i) => ({ title: s.name, text: s.text, badge: i === h.ai.ladder.length - 1 ? t("ai.goal") : null })),
  renderPanel: (s, i) => aiPanel(s, i, h.ai),
})}
${mGlow(h.glow, { id: "discretion" })}
${mSupport(h.support)}
${mTiles()}
${mCta(h.cta)}`;

  return [{ path: "/", html: page({ path: "/", title: h.seo.title, description: h.seo.description, ogImage: h.hero.image, body }) }];
}
