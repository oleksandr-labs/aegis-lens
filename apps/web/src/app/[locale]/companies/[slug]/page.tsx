import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { COMPANIES } from "@/lib/directory-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const c of COMPANIES) {
    for (const lc of ACTIVE_LOCALES) {
      if (lc === "en") continue;
      out.push({ locale: lc, slug: c.slug });
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
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: c.name,
    description: c.description,
    pathFor: (lc) => urls.companyDetail(lc, slug),
  });
}

export default async function CompanyDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name,
    description: c.description,
    url: `${SITE.url}${urls.companyDetail(locale, slug)}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow={`Company · ${c.category}`}
        title={c.name}
        description={c.description}
      />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <dl className="grid grid-cols-2 gap-3">
          <Fact label="Category" value={c.category} />
          <Fact label="Region" value={c.region} />
          <Fact label="Verified" value={c.verified ? "Yes" : "No"} />
          <Fact label="Slug" value={c.slug} mono />
        </dl>
        <p className="mt-6 rounded border border-border-subtle bg-bg-surface p-4 text-sm text-text-muted">
          Full company profile (leadership, partners, integrations, reviews) lands with the
          claim-listing flow in Sprint 2.
        </p>
      </section>
    </>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className={`mt-1 text-sm ${mono ? "font-mono" : ""} text-text-primary`}>{value}</dd>
    </div>
  );
}
