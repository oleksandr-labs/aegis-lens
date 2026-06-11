import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { TOOLS } from "@/lib/directory-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const t of TOOLS) {
    for (const lc of ACTIVE_LOCALES) {
      if (lc === "en") continue;
      out.push({ locale: lc, slug: t.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: t.name,
    description: t.description,
    pathFor: (lc) => urls.toolDetail(lc, slug),
  });
}

export default async function ToolDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const tool = TOOLS.find((x) => x.slug === slug);
  if (!tool) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    url: `${SITE.url}${urls.toolDetail(locale, slug)}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow={`Tool · ${tool.category}`}
        title={tool.name}
        description={tool.description}
      />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded border border-border-subtle bg-bg-surface p-4 text-sm text-text-muted">
          Full tool profile (pricing, integrations, alternatives, screenshots) lands with the
          claim-listing flow in Sprint 2.
        </p>
      </section>
    </>
  );
}
