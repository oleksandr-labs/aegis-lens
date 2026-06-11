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
  companiesWithinKm,
  listCompanyCitySlugs,
  CITY_COORDS,
} from "@/lib/company-city";
import { MiniMap } from "@/components/Map/MiniMap";
import type { AegisEvent } from "@aegis/types";
import { industrySlug } from "@/lib/industries";
import { SITE } from "@/lib/site";

type Params = { locale: string; city: string };

const MIN_ENTRIES = 1;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const s of listCompanyCitySlugs()) {
    if (companiesInCity(s).length < MIN_ENTRIES) continue;
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, city: s });
  }
  return out;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ r?: string | string[]; sort?: string | string[] }>;
}): Promise<Metadata> {
  const { locale: raw, city } = await params;
  const sp = await searchParams;
  const radiusKm = parseRadius(sp.r);
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const items = companiesInCity(city);
  if (items.length === 0) return { robots: { index: false } };
  const label = cityDisplay(city);
  return buildMetadata({
    locale,
    title: `OSINT, cyber, and defense companies near ${label}`,
    description: `${items.length} catalogued companies headquartered in or near ${label} — OSINT, cybersecurity, geospatial, satellite imagery, threat intelligence, and verification.`,
    pathFor: (lc) => localePath(lc, `/companies-near/${city}`),
    // Non-default radius or sort variants are duplicate-content of the canonical
    // page; canonical points back to the no-param URL, and we noindex them too.
    noindex: radiusKm !== DEFAULT_RADIUS || sortRaw === "distance",
  });
}

const ALLOWED_RADII = [100, 250, 500, 1000, 2500] as const;
type AllowedRadius = (typeof ALLOWED_RADII)[number];
const DEFAULT_RADIUS: AllowedRadius = 500;

function parseRadius(raw: string | string[] | undefined): AllowedRadius {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return (ALLOWED_RADII as readonly number[]).includes(n)
    ? (n as AllowedRadius)
    : DEFAULT_RADIUS;
}

export default async function CompaniesNearCityPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ r?: string | string[]; sort?: string | string[] }>;
}) {
  const { locale: raw, city } = await params;
  const sp = await searchParams;
  const radiusKm = parseRadius(sp.r);
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sortMode: "category" | "distance" = sortRaw === "distance" ? "distance" : "category";
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const items = companiesInCity(city);
  if (items.length === 0) notFound();

  const label = cityDisplay(city);
  const pageUrl = `${SITE.url}${localePath(locale, `/companies-near/${city}`)}`;
  const verified = items.filter((c) => c.verified);
  const featured = (verified.length > 0 ? verified : items).slice(0, 5);

  // Group by industry
  const byCategory = new Map<string, typeof items>();
  for (const c of items) {
    const arr = byCategory.get(c.category) ?? [];
    arr.push(c);
    byCategory.set(c.category, arr);
  }

  const hasCoords = Boolean(CITY_COORDS[city]);
  const homeCoords = CITY_COORDS[city];
  const within = hasCoords ? companiesWithinKm(city, radiusKm) : [];

  // Synthesize minimal AegisEvent stubs so the MiniMap component can render city
  // pins without us hand-rolling a maplibre component. Home city is "infrastructure"
  // (accent blue), nearby cities are "civilian_alert" (yellow).
  const mapEvents: AegisEvent[] = [];
  if (homeCoords) {
    mapEvents.push({
      eventId: `city-${city}`,
      occurredAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
      location: { lat: homeCoords[1], lon: homeCoords[0], precisionM: 0 },
      class: "infrastructure",
      subclass: null,
      severity: 0,
      dangerScore: 0,
      confidence: 1,
      verificationState: "verified",
      sources: [],
      media: [],
      summary: { en: `${label} · here · ${items.length} ${items.length === 1 ? "company" : "companies"}` },
      originalText: null,
    });
    const seen = new Set<string>([city]);
    // City → company count + distance.
    const cityAgg = new Map<string, { count: number; distanceKm: number }>();
    for (const w of within) {
      const cur = cityAgg.get(w.citySlug);
      if (cur) cur.count += 1;
      else cityAgg.set(w.citySlug, { count: 1, distanceKm: w.distanceKm });
    }
    for (const [slug, { count, distanceKm }] of cityAgg) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      const c = CITY_COORDS[slug];
      if (!c) continue;
      mapEvents.push({
        eventId: `city-${slug}`,
        occurredAt: new Date().toISOString(),
        reportedAt: new Date().toISOString(),
        ingestedAt: new Date().toISOString(),
        location: { lat: c[1], lon: c[0], precisionM: 0 },
        class: "civilian_alert",
        subclass: null,
        severity: 0,
        dangerScore: 0,
        confidence: 1,
        verificationState: "verified",
        sources: [],
        media: [],
        summary: {
          en: `${cityDisplay(slug)} · ${Math.round(distanceKm)} km · ${count} ${count === 1 ? "company" : "companies"}`,
        },
        originalText: null,
      });
    }
  }
  // Zoom heuristic based on radius — tighter radii zoom in.
  const mapZoom = radiusKm <= 100 ? 6 : radiusKm <= 250 ? 5 : radiusKm <= 500 ? 4 : radiusKm <= 1000 ? 3.5 : 2.5;

  // Distance-sorted flat list: home city at 0 km, then nearby in ascending distance.
  const distanceFlat: { company: typeof items[number]; citySlug: string; distanceKm: number }[] =
    hasCoords
      ? [
          ...items.map((c) => ({ company: c, citySlug: city, distanceKm: 0 })),
          ...within,
        ].sort((a, b) => a.distanceKm - b.distanceKm)
      : [];

  const otherCities = listCompanyCitySlugs()
    .filter((s) => s !== city)
    .map((s) => ({ slug: s, label: cityDisplay(s), count: companiesInCity(s).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `OSINT, cyber, and defense companies near ${label}`,
        description: `${items.length} companies headquartered near ${label}.`,
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
          { "@type": "ListItem", position: 2, name: `Near ${label}`, item: pageUrl },
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
          <span className="text-text-secondary">Near {label}</span>
        </nav>

        <PageHeader
          eyebrow="Geo-aware directory"
          title={`Companies near ${label}`}
          description={`${items.length} catalogued companies headquartered in or near ${label}, across ${byCategory.size} industries.`}
        />

        {featured.length > 0 && (
          <section className="mt-6">
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {verified.length > 0
                ? `Top verified near ${label}`
                : `Top catalogued near ${label}`}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {featured.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={urls.companyDetail(locale, c.slug)}
                    className="block rounded border border-border-default bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{c.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {c.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {c.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasCoords && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Sort:
            </span>
            {(["category", "distance"] as const).map((mode) => {
              const active = mode === sortMode;
              const qs = new URLSearchParams();
              if (radiusKm !== DEFAULT_RADIUS) qs.set("r", String(radiusKm));
              if (mode === "distance") qs.set("sort", "distance");
              const suffix = qs.toString();
              const href = `${localePath(locale, `/companies-near/${city}`)}${suffix ? `?${suffix}` : ""}`;
              return (
                <Link
                  key={mode}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-elevated"
                  }`}
                >
                  {mode === "category" ? "Industry" : "Distance"}
                </Link>
              );
            })}
          </div>
        )}

        {sortMode === "distance" && hasCoords && (
          <section className="mt-6">
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              All companies — sorted by distance from {label}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {distanceFlat.map((w) => (
                <li key={`${w.company.slug}-${w.citySlug}`}>
                  <Link
                    href={urls.companyDetail(locale, w.company.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-text-primary">{w.company.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-text-muted">
                        {w.distanceKm === 0 ? "here" : `${Math.round(w.distanceKm)} km`}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                      {w.company.category} · {cityDisplay(w.citySlug)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sortMode === "category" && (
        <section className="mt-10 space-y-8">
          {[...byCategory.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([category, arr]) => {
              const indSlug = industrySlug(category);
              return (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2 border-b border-border-subtle pb-2">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary">
                      {category}
                    </h3>
                    <span className="font-mono text-[10px] text-text-muted">
                      {arr.length} {arr.length === 1 ? "company" : "companies"}
                    </span>
                    <Link
                      href={urls.industryCity(locale, indSlug, city)}
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
        )}

        {hasCoords && homeCoords && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Within {radiusKm.toLocaleString()} km of {label}
            </h2>
            <div className="mt-3">
              <MiniMap
                center={homeCoords}
                zoom={mapZoom}
                events={mapEvents}
                height={240}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Radius:
              </span>
              {ALLOWED_RADII.map((r) => {
                const active = r === radiusKm;
                const href =
                  r === DEFAULT_RADIUS
                    ? localePath(locale, `/companies-near/${city}`)
                    : `${localePath(locale, `/companies-near/${city}`)}?r=${r}`;
                return (
                  <Link
                    key={r}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-elevated"
                    }`}
                  >
                    {r.toLocaleString()} km
                  </Link>
                );
              })}
            </div>
            {within.length === 0 ? (
              <p className="mt-3 text-xs text-text-muted">
                No other catalogued companies within {radiusKm.toLocaleString()} km.
                Try a wider radius.
              </p>
            ) : (
              <p className="mt-3 text-xs text-text-muted">
                {within.length} companies in {new Set(within.map((w) => w.citySlug)).size}{" "}
                nearby {new Set(within.map((w) => w.citySlug)).size === 1 ? "city" : "cities"}.
                Distance is between city centers (great-circle).
              </p>
            )}
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {within.slice(0, 12).map((w) => (
                <li key={w.company.slug}>
                  <Link
                    href={urls.companyDetail(locale, w.company.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-text-primary">{w.company.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-text-muted">
                        {Math.round(w.distanceKm)} km
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase text-text-muted">
                      {w.company.category} · {cityDisplay(w.citySlug)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherCities.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other cities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={urls.companiesNear(locale, c.slug)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>Near {c.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Catalogued by HQ city. See also{" "}
          <Link
            href={urls.companiesByCity(locale, city)}
            className="text-accent hover:underline"
          >
            /companies/city/{city}
          </Link>
          .
        </p>
      </article>
    </>
  );
}
