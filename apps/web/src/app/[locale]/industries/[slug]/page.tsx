import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { getIndustry, listIndustries } from "@/lib/industries";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const i of listIndustries()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: i.slug });
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
  const ind = getIndustry(slug);
  if (!ind) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${ind.label} — companies & tools`,
    description: `Aegis Lens directory: ${ind.companies.length} companies and ${ind.tools.length} tools in the ${ind.label} industry.`,
    pathFor: (lc) => localePath(lc, `/industries/${ind.slug}`),
  });
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ind = getIndustry(slug);
  if (!ind) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/industries/${ind.slug}`)}`;
  const related = listIndustries()
    .filter((x) => x.slug !== ind.slug)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${ind.label} — Aegis Lens directory`,
        description: `${ind.companies.length} companies and ${ind.tools.length} tools tagged ${ind.label}.`,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Industries",
            item: `${SITE.url}${urls.industries(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: ind.label },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-5xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.industries(locale)} className="hover:text-text-primary">
            Industries
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{ind.label}</span>
        </nav>

        <PageHeader
          eyebrow="Industry"
          title={ind.label}
          description={`${ind.companies.length} companies and ${ind.tools.length} tools tagged in this industry across the Aegis Lens directory.`}
        />

        {ind.companies.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Companies ({ind.companies.length})
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {ind.companies.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={urls.companyDetail(locale, c.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{c.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">{c.region}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">{c.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {ind.tools.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Tools ({ind.tools.length})
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {ind.tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={urls.toolDetail(locale, t.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{t.name}</span>
                      <Link
                        href={urls.alternatives(locale, t.slug)}
                        className="font-mono text-[10px] text-accent hover:underline"
                      >
                        alternatives
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">{t.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other industries</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.industry(locale, r.slug)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{r.total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
