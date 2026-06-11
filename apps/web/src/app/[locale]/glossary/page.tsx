import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { GlossarySearch } from "@/components/GlossarySearch";
import { GLOSSARY_TERMS_SORTED } from "@/lib/glossary-data";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Glossary",
    description: `OSINT, intel, and mil-tech terminology — ${GLOSSARY_TERMS_SORTED.length} terms defined.`,
    pathFor: (lc) => urls.glossary(lc),
  });
}

export default async function GlossaryIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Aegis Lens Glossary",
    description: "OSINT, intelligence, and military terminology used in the Aegis Lens platform.",
    inLanguage: locale,
    hasPart: GLOSSARY_TERMS_SORTED.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      url: `${urls.glossary(locale, t.slug)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Glossary"
        title="Glossary"
        description={`OSINT, intel, and mil-tech terminology — ${GLOSSARY_TERMS_SORTED.length} terms defined.`}
      />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <GlossarySearch terms={GLOSSARY_TERMS_SORTED} locale={locale} />
      </section>
    </>
  );
}
