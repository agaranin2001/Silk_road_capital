import { page } from "../components/layout.mjs";
import { btnPrimary, btnOutline } from "../components/ui.mjs";
import { pageHero } from "../components/sections.mjs";
import { t } from "../content/index.mjs";

export default function render() {
  const body = pageHero({
    label: "404",
    title: t("nf.title"),
    lead: t("nf.lead"),
    actions: [btnPrimary({ label: t("nf.back"), href: "/" }), btnOutline({ label: t("about.start"), href: "/contact/" })],
  });
  return [{ path: "/404.html", file: "404.html", html: page({ path: "/404.html", title: t("nf.seoTitle"), body }) }];
}
