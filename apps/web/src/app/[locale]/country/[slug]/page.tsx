import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listRegions, getRegion } from "@/lib/regions-seed";
import { eventsInCountry } from "@/lib/events-seed";
import { listOblasts } from "@/lib/oblasts-seed";
import { listCities } from "@/lib/cities-seed";
import { ALL_CLASSES } from "@/lib/filter-config";
import { listThreats, threatsByRegion } from "@/lib/threats-seed";
import { listInvestigations } from "@/lib/investigations-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { listGuides } from "@/lib/guides-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

// ---------------------------------------------------------------------------
// Country enrichment data
// ---------------------------------------------------------------------------

type CoverageLevel = "primary" | "standard" | "limited" | "cyber-only";

type CountryMeta = {
  iso2: string;
  flag: string;
  population: string;
  coverage: CoverageLevel;
  region: string;
  capital: string;
  area: string;
  languages: string[];
  conflictActive: boolean;
};

const COUNTRY_META: Record<string, CountryMeta> = {
  ua: {
    iso2: "ua",
    flag: "🇺🇦",
    population: "44M",
    coverage: "primary",
    region: "Eastern Europe",
    capital: "Kyiv",
    area: "603,550 km²",
    languages: ["Ukrainian"],
    conflictActive: true,
  },
  pl: {
    iso2: "pl",
    flag: "🇵🇱",
    population: "38M",
    coverage: "standard",
    region: "Eastern Europe",
    capital: "Warsaw",
    area: "312,696 km²",
    languages: ["Polish"],
    conflictActive: false,
  },
  de: {
    iso2: "de",
    flag: "🇩🇪",
    population: "84M",
    coverage: "standard",
    region: "Central Europe",
    capital: "Berlin",
    area: "357,114 km²",
    languages: ["German"],
    conflictActive: false,
  },
  ru: {
    iso2: "ru",
    flag: "🇷🇺",
    population: "144M",
    coverage: "limited",
    region: "Eastern Europe / North Asia",
    capital: "Moscow",
    area: "17,098,242 km²",
    languages: ["Russian"],
    conflictActive: true,
  },
  gb: {
    iso2: "gb",
    flag: "🇬🇧",
    population: "67M",
    coverage: "cyber-only",
    region: "Western Europe",
    capital: "London",
    area: "243,610 km²",
    languages: ["English"],
    conflictActive: false,
  },
  us: {
    iso2: "us",
    flag: "🇺🇸",
    population: "335M",
    coverage: "cyber-only",
    region: "North America",
    capital: "Washington D.C.",
    area: "9,372,610 km²",
    languages: ["English"],
    conflictActive: false,
  },
  by: {
    iso2: "by",
    flag: "🇧🇾",
    population: "9M",
    coverage: "limited",
    region: "Eastern Europe",
    capital: "Minsk",
    area: "207,600 km²",
    languages: ["Belarusian", "Russian"],
    conflictActive: true,
  },
};

const COVERAGE_DESC: Record<CoverageLevel, string> = {
  primary: "Full event taxonomy, real-time updates, all region and threat modules active.",
  standard: "Core event classes covered; region modules active; threat library populated.",
  limited: "Partial coverage; events logged where verifiable sources exist.",
  "cyber-only": "Only cyber and information-operations events are tracked for this country.",
};

const COVERAGE_BADGE_CLASS: Record<CoverageLevel, string> = {
  primary: "border-accent/30 bg-accent/10 text-accent",
  standard: "border-border-subtle bg-bg-elevated text-text-secondary",
  limited: "border-border-subtle bg-bg-elevated text-text-muted",
  "cyber-only": "border-border-subtle bg-bg-elevated text-text-muted",
};

// ---------------------------------------------------------------------------

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const r of listRegions()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: r.iso2 });
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
  const r = getRegion(slug);
  if (!r) return { robots: { index: false } };
  const name = r.name[locale] ?? r.name.en;
  return buildMetadata({
    locale,
    title: `${name} — country brief`,
    description: `Aegis Lens ${name} hub: situation summary, regions, threats, sources, investigations, and guides.`,
    pathFor: (lc) => localePath(lc, `/country/${slug}`),
  });
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const r = getRegion(slug);
  if (!r) notFound();

  const iso2 = r.iso2;
  const name = r.name[locale] ?? r.name.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/country/${iso2}`)}`;

  const meta = COUNTRY_META[iso2.toLowerCase()];

  const events = eventsInCountry(iso2);
  const eventCount = events.length;
  const avgDanger = eventCount
    ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / eventCount)
    : 0;
  const byClass = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});
  const topClasses = Object.entries(byClass).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topClass = topClasses[0]?.[0] ?? null;

  const oblasts = listOblasts(iso2);
  const cities = listCities(iso2);
  const sources = PUBLIC_SOURCES.filter(
    (s) => s.country.toLowerCase() === iso2.toLowerCase(),
  )
    .slice()
    .sort((a, b) => b.reliability - a.reliability)
    .slice(0, 6);
  const threats = threatsByRegion(iso2).slice(0, 6);
  const investigations = listInvestigations()
    .filter((inv) =>
      (inv.citedOblastSlugs ?? []).some((s) => oblasts.some((o) => o.slug === s)),
    )
    .slice(0, 4);
  const guides = listGuides().slice(0, 4);
  const otherCountries = listRegions().filter((x) => x.iso2 !== iso2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": pageUrl,
        name,
        address: {
          "@type": "PostalAddress",
          addressCountry: iso2.toUpperCase(),
        },
      },
      {
        "@type": "Article",
        headline: `${name} — country brief`,
        description: `Aegis Lens ${name} country hub.`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: { "@id": pageUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Countries",
            item: `${SITE.url}${urls.countries(locale)}`,
          },
          { "@type": "ListItem", position: 2, name },
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
        {/* Breadcrumb */}
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.countries(locale)} className="hover:text-text-primary">
            Countries
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{name}</span>
        </nav>

        {/* Hero: flag + name + conflict badge */}
        <div className="mt-6 flex flex-wrap items-start gap-4">
          {meta && (
            <span className="text-5xl leading-none" aria-hidden>
              {meta.flag}
            </span>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
                {name}
              </h1>
              {meta?.conflictActive && (
                <span className="rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-red-400">
                  Active conflict zone
                </span>
              )}
            </div>
            {meta && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {meta.region}
                {" · "}
                Pop. {meta.population}
              </p>
            )}
          </div>
        </div>

        {/* Coverage tier */}
        {meta && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${COVERAGE_BADGE_CLASS[meta.coverage]}`}
            >
              {meta.coverage.replace("-", " ")} coverage
            </span>
            <span className="text-sm text-text-secondary">
              {COVERAGE_DESC[meta.coverage]}
            </span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>Capital: {r.capital}</span>
          <span>·</span>
          <span>ISO-2: {iso2.toUpperCase()}</span>
          <span>·</span>
          <Link href={urls.region(locale, iso2)} className="hover:text-accent">
            operational map →
          </Link>
          <span>·</span>
          <a href={urls.countryFeed(locale, iso2)} className="hover:text-accent">
            RSS feed →
          </a>
        </div>

        {/* Key facts */}
        {meta && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Key facts
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-text-muted">Capital</dt>
                <dd className="text-text-primary">{meta.capital}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Area</dt>
                <dd className="text-text-primary">{meta.area}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Language{meta.languages.length > 1 ? "s" : ""}</dt>
                <dd className="text-text-primary">{meta.languages.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Population</dt>
                <dd className="text-text-primary">{meta.population}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Region</dt>
                <dd className="text-text-primary">{meta.region}</dd>
              </div>
            </dl>
          </section>
        )}

        {/* KPIs */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Events
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{eventCount}</div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Avg danger
            </div>
            <div className="mt-1 text-2xl font-semibold text-accent">{avgDanger}</div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Oblasts / regions
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{oblasts.length}</div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Cities
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{cities.length}</div>
          </div>
        </section>

        {/* Event stats: top class */}
        {topClass && (
          <section className="mt-4 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Event statistics
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-text-muted">Total events: </span>
                <span className="font-semibold text-text-primary">{eventCount}</span>
              </div>
              <div>
                <span className="text-text-muted">Avg danger score: </span>
                <span className="font-semibold text-accent">{avgDanger}</span>
              </div>
              <div>
                <span className="text-text-muted">Top class: </span>
                <Link
                  href={urls.topic(locale, topClass)}
                  className="font-semibold text-text-primary hover:text-accent"
                >
                  {CLASS_LABEL[topClass] ?? topClass}
                </Link>
              </div>
            </div>
          </section>
        )}

        {topClasses.length > 0 && (
          <section className="mt-4 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              By class
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-primary">
              {topClasses.map(([cls, n]) => (
                <li key={cls} className="inline-flex items-center gap-2">
                  <Link href={urls.topic(locale, cls)} className="hover:text-accent">
                    {CLASS_LABEL[cls] ?? cls}
                  </Link>
                  <span className="font-mono text-[10px] text-text-muted">{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Oblast-level breakdown link */}
        <section className="mt-6">
          <Link
            href={urls.region(locale, iso2)}
            className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            <span>View oblast-level breakdown</span>
            <span className="text-accent">→</span>
          </Link>
        </section>

        {/* Oblasts */}
        {oblasts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Regions ({oblasts.length})
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {oblasts.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={urls.region(locale, iso2, o.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {o.name[locale] ?? o.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Threats */}
        {threats.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Threat library</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {threats.map((th) => (
                <li key={th.slug}>
                  <Link
                    href={urls.threat(locale, th.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{th.name[locale] ?? th.name.en}</div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {th.summary[locale] ?? th.summary.en}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Top public sources</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sources.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.source(locale, s.slug)}
                    className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <span className="text-text-primary">{s.name}</span>
                    <span className="font-mono text-[10px] text-accent">
                      {Math.round(s.reliability * 100)}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Investigations */}
        {investigations.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Investigations referencing {name}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {investigations.map((inv) => (
                <li key={inv.slug}>
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{inv.title}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {inv.date} · lead: {inv.analyst}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Guides */}
        {guides.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Guides</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={urls.guide(locale, g.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{g.title[locale] ?? g.title.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {g.category} · {g.readingMinutes} min
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Other countries */}
        {otherCountries.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other countries</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCountries.map((c) => (
                <li key={c.iso2}>
                  <Link
                    href={urls.country(locale, c.iso2)}
                    className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {COUNTRY_META[c.iso2.toLowerCase()]?.flag && (
                      <span aria-hidden>{COUNTRY_META[c.iso2.toLowerCase()].flag}</span>
                    )}
                    {c.name[locale] ?? c.name.en}
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
