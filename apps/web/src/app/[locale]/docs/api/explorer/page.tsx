import type { Metadata } from "next";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { localePath } from "@aegis/url-builder";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ApiExplorerClient } from "./ApiExplorerClient";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "API Explorer";
const DESCRIPTION =
  "Test the Aegis Lens API interactively. No setup required — requests are authenticated with a demo key.";

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
    pathFor: (lc) => localePath(lc, "/docs/api/explorer"),
  });
}

export default async function ApiExplorerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  void locale;

  return (
    <>
      <PageHeader
        eyebrow="API Docs"
        title={TITLE}
        description={DESCRIPTION}
      />
      <ApiExplorerClient />
    </>
  );
}
