import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventsInCountry } from "@/lib/events-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Countries";
const DESCRIPTION =
  "Country briefs across Aegis Lens coverage — situation summary, regions, threats, sources, investigations, and guides per country.";

type CoverageLevel = "primary" | "standard" | "limited" | "cyber-only";

type CountryEntry = {
  iso2: string;
  name: string;
  flag: string;
  population: string;
  coverage: CoverageLevel;
  region: string;
};

const COUNTRIES_DATA: CountryEntry[] = [
  { iso2: "ua", name: "Ukraine", flag: "🇺🇦", population: "44M", coverage: "primary", region: "Eastern Europe" },
  { iso2: "pl", name: "Poland", flag: "🇵🇱", population: "38M", coverage: "standard", region: "Eastern Europe" },
  { iso2: "de", name: "Germany", flag: "🇩🇪", population: "84M", coverage: "standard", region: "Central Europe" },
  { iso2: "ru", name: "Russia", flag: "🇷🇺", population: "144M", coverage: "limited", region: "Eastern Europe / North Asia" },
  { iso2: "gb", name: "United Kingdom", flag: "🇬🇧", population: "67M", coverage: "cyber-only", region: "Western Europe" },
  { iso2: "us", name: "United States", flag: "🇺🇸", population: "335M", coverage: "cyber-only", region: "North America" },
  { iso2: "by", name: "Belarus", flag: "🇧🇾", population: "9M", coverage: "limited", region: "Eastern Europe" },
];

const COVERAGE_BADGE: Record<CoverageLevel, { label: string; className: string }> = {
  primary: { label: "Primary", className: "bg-accent/10 text-accent border-accent/30" },
  standard: { label: "Standard", className: "bg-bg-elevated text-text-secondary border-border-subtle" },
  limited: { label: "Limited", className: "bg-bg-elevated text-text-muted border-border-subtle" },
  "cyber-only": { label: "Cyber only", className: "bg-bg-elevated text-text-muted border-border-subtle" },
};

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
    pathFor: (lc) => localePath(lc, "/countries"),
  });
}

export default async function CountriesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Compute live event counts from seed
  const countries = COUNTRIES_DATA.map((c) => ({
    ...c,
    eventCount: eventsInCountry(c.iso2).length,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/countries")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: countries.length,
      itemListElement: countries.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${urls.country(locale, c.iso2)}`,
        name: c.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Coverage" title={TITLE} description={DESCRIPTION} />

      <section className="mx-auto max-w-4xl px-4 py-10">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {countries.map((c) => {
            const badge = COVERAGE_BADGE[c.coverage];
            return (
              <li key={c.iso2}>
                <Link
                  href={urls.region(locale, c.iso2)}
                  className="block h-full rounded border border-border-subtle bg-bg-surface p-5 hover:bg-bg-elevated"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none" aria-hidden>
                        {c.flag}
                      </span>
                      <div>
                        <div className="text-base font-semibold text-text-primary">{c.name}</div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          {c.region}
                        </div>
                      </div>
                    </div>
                    {/* Coverage badge */}
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>Pop. {c.population}</span>
                    {c.eventCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{c.eventCount} events</span>
                      </>
                    )}
                  </div>

                  <div className="mt-3 font-mono text-[11px] uppercase tracking-wider text-accent">
                    View →
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
