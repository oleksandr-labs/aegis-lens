import type { Metadata } from "next";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { localePath } from "@aegis/url-builder";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { RuleBuilderClient } from "./RuleBuilderClient";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Alert Rule Builder";
const DESCRIPTION =
  "Create custom alert rules in plain language or using the visual builder.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/alerts/rule-builder"),
  });
}

export default function AlertRuleBuilderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title={TITLE}
        description={DESCRIPTION}
      />
      <RuleBuilderClient />
    </>
  );
}
