import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  cityDisplay,
  companiesInCity,
  listCompanyCitySlugs,
} from "@/lib/company-city";
import { industrySlug } from "@/lib/industries";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const s of listCompanyCitySlugs()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: s });
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
  const items = companiesInCity(slug);
  if (items.length === 0) return { robots: { index: false } };
  const label = cityDisplay(slug);
  return buildMetadata({
    locale,
    title: `Companies in ${label}`,
    description: `${items.length} OSINT, cybersecurity, geospatial, and defense companies headquartered in ${label}.`,
    pathFor: (lc) => localePath(lc, `/companies/city/${slug}`),
  });
}

export default async function CompaniesByCityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const items = companiesInCity(slug);
  if (items.length === 0) notFound();

  const label = cityDisplay(slug);
  const pageUrl = `${SITE.url}${localePath(locale, `/companies/city/${slug}`)}`;

  // Group by industry/category.
  const byCategory = new Map<string, typeof items>();
  for (const c of items) {
    const arr = byCategory.get(c.category) ?? [];
    arr.push(c);
    byCategory.set(c.category, arr);
  }

  const otherCities = listCompanyCitySlugs()
    .filter((s) => s !== slug)
    .map((s) => ({ slug: s, label: cityDisplay(s), count: companiesInCity(s).length }))
    .sort((a, b) => b.count - a.count);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `Companies in ${label}`,
        description: `${items.length} companies headquartered in ${label}.`,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((c, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${SITE.url}${urls.companyDetail(locale, c.slug)}`,
            name: c.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Companies",
            item: `${SITE.url}${urls.companies(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: label, item: pageUrl },
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
          <Link href={urls.companies(locale)} className="hover:text-text-primary">
            Companies
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{label}</span>
        </nav>

        <PageHeader
          eyebrow="Directory by city"
          title={`Companies in ${label}`}
          description={`${items.length} companies catalogued in Aegis Lens, across ${byCategory.size} industries.`}
        />

        <section className="mt-8 space-y-8">
          {[...byCategory.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([category, arr]) => {
              const indSlug = industrySlug(category);
              return (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2 border-b border-border-subtle pb-2">
                    <h2 className="font-mono text-xs uppercase tracking-wider text-text-primary">
                      {category}
                    </h2>
                    <span className="font-mono text-[10px] text-text-muted">
                      {arr.length} {arr.length === 1 ? "company" : "companies"}
                    </span>
                    <Link
                      href={urls.industryCity(locale, indSlug, slug)}
                      className="ml-auto font-mono text-[10px] text-accent hover:underline"
                    >
                      {category} in {label} →
                    </Link>
                  </div>
                  <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {arr.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={urls.companyDetail(locale, c.slug)}
                          className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-text-primary">{c.name}</span>
                            {c.verified && (
                              <span className="rounded border border-green-500/40 bg-green-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-green-300">
                                verified
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                            {c.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </section>

        {otherCities.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other cities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={urls.companiesByCity(locale, c.slug)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{c.count}</span>
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
