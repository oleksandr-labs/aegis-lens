import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { getIndustry } from "@/lib/industries";
import {
  cityDisplay,
  companiesInIndustryAndCity,
  listIndustryCityPairs,
} from "@/lib/company-city";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string; city: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const pair of listIndustryCityPairs()) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: pair.industrySlug, city: pair.citySlug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug, city } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ind = getIndustry(slug);
  if (!ind) return { robots: { index: false } };
  const items = companiesInIndustryAndCity(slug, city);
  if (items.length === 0) return { robots: { index: false } };
  const cityLabel = cityDisplay(city);
  return buildMetadata({
    locale,
    title: `${ind.label} companies in ${cityLabel}`,
    description: `${items.length} ${ind.label} companies headquartered in ${cityLabel} — catalogued in the Aegis Lens directory.`,
    pathFor: (lc) => localePath(lc, `/industries/${slug}/${city}`),
  });
}

export default async function IndustryCityIntersectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, city } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ind = getIndustry(slug);
  if (!ind) notFound();
  const items = companiesInIndustryAndCity(slug, city);
  if (items.length === 0) notFound();

  const cityLabel = cityDisplay(city);
  const pageUrl = `${SITE.url}${localePath(locale, `/industries/${slug}/${city}`)}`;

  // Sibling: same industry, other cities + same city, other industries
  const sameIndustryOtherCities = listIndustryCityPairs()
    .filter((p) => p.industrySlug === slug && p.citySlug !== city)
    .map((p) => ({
      city: p.citySlug,
      label: cityDisplay(p.citySlug),
      count: companiesInIndustryAndCity(slug, p.citySlug).length,
    }));
  const sameCityOtherIndustries = listIndustryCityPairs()
    .filter((p) => p.citySlug === city && p.industrySlug !== slug)
    .map((p) => {
      const i = getIndustry(p.industrySlug);
      return {
        industrySlug: p.industrySlug,
        label: i?.label ?? p.industrySlug,
        count: companiesInIndustryAndCity(p.industrySlug, city).length,
      };
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${ind.label} companies in ${cityLabel}`,
        description: `${items.length} ${ind.label} companies headquartered in ${cityLabel}.`,
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
            name: "Industries",
            item: `${SITE.url}${urls.industries(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: ind.label,
            item: `${SITE.url}${urls.industry(locale, slug)}`,
          },
          { "@type": "ListItem", position: 3, name: cityLabel, item: pageUrl },
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

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.industries(locale)} className="hover:text-text-primary">
            Industries
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.industry(locale, slug)} className="hover:text-text-primary">
            {ind.label}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{cityLabel}</span>
        </nav>

        <PageHeader
          eyebrow={`${ind.label} × ${cityLabel}`}
          title={`${ind.label} companies in ${cityLabel}`}
          description={`${items.length} ${ind.label} ${items.length === 1 ? "company is" : "companies are"} headquartered in ${cityLabel} per the Aegis Lens directory.`}
        />

        <section className="mt-8">
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {items.map((c) => (
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
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2">{c.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {sameCityOtherIndustries.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Other industries in {cityLabel}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameCityOtherIndustries.map((r) => (
                <li key={r.industrySlug}>
                  <Link
                    href={urls.industryCity(locale, r.industrySlug, city)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{r.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sameIndustryOtherCities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              {ind.label} in other cities
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameIndustryOtherCities.map((r) => (
                <li key={r.city}>
                  <Link
                    href={urls.industryCity(locale, slug, r.city)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{r.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          See also{" "}
          <Link
            href={urls.industry(locale, slug)}
            className="text-accent hover:underline"
          >
            all {ind.label} companies
          </Link>{" "}
          and{" "}
          <Link
            href={urls.companiesByCity(locale, city)}
            className="text-accent hover:underline"
          >
            all companies in {cityLabel}
          </Link>
          .
        </p>
      </article>
    </>
  );
}
