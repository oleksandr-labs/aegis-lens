import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { EmbedBuilderClient } from "./EmbedBuilderClient";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE       = "Embed Builder";
const DESCRIPTION = "Add live intelligence widgets to your website with a single snippet.";

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
    pathFor: (lc) => localePath(lc, "/embed/builder"),
  });
}

export default async function EmbedBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Resolve locale for potential future server-side needs (e.g. i18n strings).
  const { locale: raw } = await params;
  void raw; // currently unused — config panel is fully client-side

  return (
    <>
      <PageHeader
        eyebrow="Embeds"
        title={TITLE}
        description={DESCRIPTION}
      />
      <EmbedBuilderClient />
    </>
  );
}
