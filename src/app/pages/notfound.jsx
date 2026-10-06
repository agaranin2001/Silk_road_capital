import { useContent } from "../../i18n/context.jsx";
import { BtnPrimary, BtnOutline } from "../ui.jsx";
import { PageHero } from "../sections.jsx";

function NotFoundPage() {
  const { t } = useContent();
  return (
    <PageHero
      label="404"
      title={t("nf.title")}
      lead={t("nf.lead")}
      actions={[
        <BtnPrimary key="back" label={t("nf.back")} href="/" />,
        <BtnOutline key="start" label={t("about.start")} href="/contact/" />,
      ]}
    />
  );
}

export default function pages(c) {
  return [{ path: "/404.html", file: "404.html", title: c.t("nf.seoTitle"), element: <NotFoundPage /> }];
}
