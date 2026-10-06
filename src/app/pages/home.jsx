import { useContent } from "../../i18n/context.jsx";
import { MHero, MMarquee, MLinkGrid, MPair, MWide, MTabsSplit, NeedsPanel, AiPanel, MStories, MGlow, MSupport, MCta, MTiles } from "../blocks.jsx";

// Home page — section order follows the mollie.com home page component sequence.
function HomePage() {
  const { home: h, t } = useContent();
  return (
    <>
      <MHero {...h.hero} eyebrow={h.hero.eyebrow} />
      <MMarquee items={h.marquee} />
      <MLinkGrid links={h.links} />
      <MPair cards={h.pairs[0]} />
      <MWide {...h.wide} id="jv" />
      <MPair cards={h.pairs[1]} />
      <MTabsSplit
        id="needs"
        eyebrow={h.needs.eyebrow}
        title={h.needs.title}
        text={h.needs.text}
        items={h.needs.items.map((n) => ({ ...n, title: n.label }))}
        renderPanel={(n) => <NeedsPanel n={n} />}
      />
      <MStories {...h.stories} />
      <MTabsSplit
        id="ai"
        eyebrow={h.ai.eyebrow}
        title={h.ai.split.title}
        text={h.ai.split.text}
        link={h.ai.split.link}
        items={h.ai.ladder.map((s, i) => ({ title: s.name, text: s.text, badge: i === h.ai.ladder.length - 1 ? t("ai.goal") : null }))}
        renderPanel={(s, i) => <AiPanel stage={s} i={i} ai={h.ai} />}
      />
      <MGlow {...h.glow} id="discretion" />
      <MSupport {...h.support} />
      <MTiles />
      <MCta {...h.cta} />
    </>
  );
}

export default function pages(c) {
  const h = c.home;
  return [{ path: "/", title: h.seo.title, description: h.seo.description, ogImage: h.hero.image, element: <HomePage /> }];
}
