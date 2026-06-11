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
  CITY_COORDS,
} from "@/lib/company-city";
import { SITE } from "@/lib/site";
import { MiniMap } from "@/components/Map/MiniMap";
import type { AegisEvent } from "@aegis/types";

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
    title: "Companies by HQ city — directory index",
    description:
      "Every HQ city covered by the Aegis Lens defense, OSINT, and cybersecurity directory. Pick a city to see catalogued companies plus radius-based nearby coverage.",
    pathFor: urls.companiesNearIndex,
  });
}

type GeoFilter = "all" | "geo";

export default async function CompaniesNearIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ geo?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;
  const geoFilter: GeoFilter = sp.geo === "1" ? "geo" : "all";

  const allCities = listCompanyCitySlugs()
    .map((slug) => ({
      slug,
      label: cityDisplay(slug),
      count: companiesInCity(slug).length,
      hasCoords: Boolean(CITY_COORDS[slug]),
    }))
    .sort((a, b) => b.count - a.count);

  const cities = geoFilter === "geo" ? allCities.filter((c) => c.hasCoords) : allCities;

  const pageUrl = `${SITE.url}${localePath(locale, "/companies-near")}`;

  // Synthesize one map pin per geo-enabled HQ city.
  const now = new Date().toISOString();
  const mapEvents: AegisEvent[] = cities
    .filter((c) => c.hasCoords)
    .map((c) => {
      const coords = CITY_COORDS[c.slug]!;
      return {
        eventId: `city-${c.slug}`,
        occurredAt: now,
        reportedAt: now,
        ingestedAt: now,
        location: { lat: coords[1], lon: coords[0], precisionM: 0 },
        class: "infrastructure" as const,
        subclass: null,
        severity: 0 as const,
        dangerScore: 0,
        confidence: 1,
        verificationState: "verified" as const,
        sources: [],
        media: [],
        summary: { en: `${c.label} · ${c.count} ${c.count === 1 ? "company" : "companies"}` },
        originalText: null,
      };
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Companies by HQ city",
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: cities.length,
          itemListElement: cities.map((c, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${SITE.url}${urls.companiesNear(locale, c.slug)}`,
            name: c.label,
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
          { "@type": "ListItem", position: 2, name: "By HQ city", item: pageUrl },
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
          <Link href={urls.companies(locale)} className="hover:text-text-primary">
            Companies
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">By HQ city</span>
        </nav>

        <PageHeader
          eyebrow="Geo-aware directory"
          title="Companies by HQ city"
          description={`${cities.length} cities with at least one catalogued defense, OSINT, or cybersecurity company. Cities with coordinates support distance-aware "nearby" lookups.`}
        />

        {mapEvents.length > 0 && (
          <div className="mt-6">
            <MiniMap center={[10, 40]} zoom={1.4} events={mapEvents} height={300} />
            <p className="mt-2 font-mono text-[10px] text-text-muted">
              {mapEvents.length} geo-enabled HQ cities · hover a pin for city + company count
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Filter:
          </span>
          <Link
            href={localePath(locale, "/companies-near")}
            className={`rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              geoFilter === "all"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All ({allCities.length})
          </Link>
          <Link
            href={localePath(locale, "/companies-near") + "?geo=1"}
            className={`rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              geoFilter === "geo"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            Geo-enabled ({allCities.filter((c) => c.hasCoords).length})
          </Link>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={urls.companiesNear(locale, c.slug)}
                className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 hover:bg-bg-elevated"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-text-primary">
                    {c.label}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {c.count}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                  {c.hasCoords ? "geo-enabled" : "no coords"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </>
  );
}
