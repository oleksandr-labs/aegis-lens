import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { SOURCES, getSource, freshnessLabel, TYPE_ICON, TIER_LABEL, TIER_COLOR, STATUS_DOT } from "@/lib/sources-data";
import { ALL_CLASSES } from "@/lib/filter-config";
import { getRegion, listRegions } from "@/lib/regions-seed";
import { eventsInCountry } from "@/lib/events-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string; country: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const s of PUBLIC_SOURCES) {
    const iso2 = s.country.toLowerCase();
    if (!listRegions().some((r) => r.iso2 === iso2)) continue;
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: s.slug, country: iso2 });
    }
  }
  // Also include slugs from SOURCES that have a known region
  for (const s of SOURCES) {
    const iso2 = s.country.toLowerCase();
    if (!listRegions().some((r) => r.iso2 === iso2)) continue;
    if (PUBLIC_SOURCES.some((p) => p.slug === s.slug)) continue; // already added
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: s.slug, country: iso2 });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Try new SOURCES first, fall back to PUBLIC_SOURCES
  const richSource = getSource(slug);
  const legacySource = PUBLIC_SOURCES.find((s) => s.slug === slug);
  const region = getRegion(country);

  if ((!richSource && !legacySource) || !region) return { robots: { index: false } };

  const sourceName = richSource?.name ?? legacySource!.name;
  const sourceCountry = richSource?.country ?? legacySource!.country.toLowerCase();
  if (sourceCountry.toLowerCase() !== country.toLowerCase()) {
    return { robots: { index: false } };
  }

  const countryLabel = region.name[locale] ?? region.name.en;
  const description = richSource?.description ?? legacySource!.description;

  return buildMetadata({
    locale,
    title: `${sourceName} — ${countryLabel} coverage`,
    description: `${sourceName} covers ${countryLabel}: ${description}`,
    pathFor: (lc) => localePath(lc, `/sources/${slug}/in/${country}`),
  });
}

// ─── Country-specific stats derived from SOURCES data ────────────────────────

function countryStats(slug: string, country: string) {
  const s = getSource(slug);
  if (!s) return null;

  // Sources from the same country
  const sameCountrySources = SOURCES.filter(
    (x) => x.country.toLowerCase() === country.toLowerCase(),
  );

  // Sources covering same topics in this country
  const topicPeers = SOURCES.filter(
    (x) =>
      x.slug !== slug &&
      x.topics.some((t) => s.topics.includes(t)) &&
      x.country.toLowerCase() === country.toLowerCase(),
  );

  // Coverage share: what fraction of country sources share this source's topics
  const coverageTopics = ALL_CLASSES.filter((c) => s.topics.includes(c.id));

  return {
    source: s,
    sameCountrySources,
    topicPeers,
    coverageTopics,
    countrySourceCount: sameCountrySources.length,
    topicCoverageShare:
      sameCountrySources.length > 0
        ? Math.round((topicPeers.length / sameCountrySources.length) * 100)
        : 0,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SourceCountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Resolve from both source registries
  const richSource = getSource(slug);
  const legacySource = PUBLIC_SOURCES.find((s) => s.slug === slug);
  const region = getRegion(country);

  if ((!richSource && !legacySource) || !region) notFound();

  // Country must match the source's country
  const sourceCountry = richSource?.country ?? legacySource!.country.toLowerCase();
  if (sourceCountry.toLowerCase() !== country.toLowerCase()) notFound();

  const countryLabel = region.name[locale] ?? region.name.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/sources/${slug}/in/${country}`)}`;

  // Legacy data for events + sibling sources (PUBLIC_SOURCES based)
  const events = eventsInCountry(country);
  const sameCountryLegacy = PUBLIC_SOURCES.filter(
    (s) =>
      s.country.toLowerCase() === country.toLowerCase() && s.slug !== slug,
  ).sort((a, b) => b.reliability - a.reliability);

  // Rich data from new SOURCES registry
  const stats = countryStats(slug, country);
  const richSourceData = stats?.source;

  // Source name/description — prefer rich
  const sourceName = richSource?.name ?? legacySource!.name;
  const sourceDescription = richSource?.description ?? legacySource!.description;
  const sourceUrl = richSource?.url ?? legacySource!.homepageUrl;
  const reliability = legacySource ? Math.round(legacySource.reliability * 100) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${sourceName} — ${countryLabel} coverage`,
        description: sourceDescription,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: {
          "@type": "Place",
          name: countryLabel,
          address: {
            "@type": "PostalAddress",
            addressCountry: country.toUpperCase(),
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Sources",
            item: `${SITE.url}${urls.sources(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: sourceName,
            item: `${SITE.url}${urls.source(locale, slug)}`,
          },
          { "@type": "ListItem", position: 3, name: countryLabel },
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

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav
          className="font-mono text-[11px] text-text-muted"
          aria-label="Breadcrumb"
        >
          <Link href={urls.sources(locale)} className="hover:text-text-primary">
            Sources
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link
            href={urls.source(locale, slug)}
            className="hover:text-text-primary"
          >
            {sourceName}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{countryLabel}</span>
        </nav>

        <PageHeader
          eyebrow={`${richSource?.type ?? legacySource?.kind ?? "source"} · ${countryLabel}`}
          title={`${sourceName} — ${countryLabel} coverage`}
          description={sourceDescription}
        />

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {reliability !== null && (
            <div className="rounded border border-border-subtle bg-bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Reliability
              </div>
              <div className="mt-1 text-2xl font-semibold text-accent">
                {reliability}%
              </div>
            </div>
          )}

          {richSourceData && (
            <div className="rounded border border-border-subtle bg-bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Trust tier
              </div>
              <div
                className={`mt-1 inline-block rounded border px-2 py-0.5 font-mono text-sm font-bold tracking-wider ${TIER_COLOR[richSourceData.tier]}`}
              >
                {TIER_LABEL[richSourceData.tier]}
              </div>
            </div>
          )}

          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Language
            </div>
            <div className="mt-1 text-2xl font-semibold uppercase text-text-primary">
              {richSource?.language ?? legacySource?.language ?? "—"}
            </div>
          </div>

          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {countryLabel} events
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">
              {events.length}
            </div>
          </div>

          {richSourceData && (
            <div className="rounded border border-border-subtle bg-bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Update cadence
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-text-primary">
                {freshnessLabel(richSourceData.freshnessMinutes)}
              </div>
            </div>
          )}

          {richSourceData && (
            <div className="rounded border border-border-subtle bg-bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Total events
              </div>
              <div className="mt-1 font-mono text-base font-semibold text-text-primary">
                {richSourceData.eventCount.toLocaleString()}
              </div>
            </div>
          )}
        </section>

        {/* ── Topic coverage ─────────────────────────────────────────────── */}
        {richSourceData && stats && stats.coverageTopics.length > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
              Topic coverage in {countryLabel}
            </div>
            <ul className="space-y-2">
              {stats.coverageTopics.map((cls) => {
                // Count how many SOURCES cover this topic in this country
                const inCountry = SOURCES.filter(
                  (x) =>
                    x.country.toLowerCase() === country.toLowerCase() &&
                    x.topics.includes(cls.id),
                );
                const isUnique = inCountry.length === 1;
                return (
                  <li key={cls.id} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-sm text-text-secondary">
                      {cls.label}
                    </span>
                    <div className="flex-1 overflow-hidden rounded bg-border-subtle h-1.5">
                      <div className="h-full bg-accent" style={{ width: "100%" }} />
                    </div>
                    {isUnique && (
                      <span className="font-mono text-[9px] uppercase text-accent shrink-0">
                        sole source
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-text-muted">
              {stats.countrySourceCount} source{stats.countrySourceCount !== 1 ? "s" : ""} total cover {countryLabel} in our registry.
            </p>
          </section>
        )}

        {/* ── Source status (rich) ───────────────────────────────────────── */}
        {richSourceData && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
              Source status
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_DOT[richSourceData.activeStatus]}`}
                />
                <span className="text-sm text-text-secondary capitalize">
                  {richSourceData.activeStatus}
                </span>
              </div>
              {richSourceData.verified && (
                <span className="font-mono text-[11px] text-green-400">
                  ✓ Verified source
                </span>
              )}
              <span className="font-mono text-[11px] text-text-muted">
                {TYPE_ICON[richSourceData.type]} {richSourceData.type}
              </span>
            </div>
          </section>
        )}

        {/* ── Authoritative link ─────────────────────────────────────────── */}
        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Authoritative source
          </div>
          <a
            href={sourceUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            {sourceUrl}{" "}
            <span className="font-mono text-[10px] text-text-muted">↗</span>
          </a>
          <p className="mt-3 text-xs text-text-muted">
            {reliability !== null ? (
              <>
                Reliability score {reliability}% — see{" "}
                <Link
                  href={urls.scoring(locale, "reliability")}
                  className="text-accent hover:underline"
                >
                  /scoring/reliability
                </Link>{" "}
                for the full tiering rubric.
              </>
            ) : (
              <>
                See{" "}
                <Link
                  href={urls.scoring(locale, "reliability")}
                  className="text-accent hover:underline"
                >
                  /scoring/reliability
                </Link>{" "}
                for the full tiering rubric.
              </>
            )}
          </p>
        </section>

        {/* ── Sibling sources (same country, from rich SOURCES) ─────────── */}
        {stats && stats.sameCountrySources.filter((x) => x.slug !== slug).length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Other sources covering {countryLabel}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {stats.sameCountrySources
                .filter((x) => x.slug !== slug)
                .map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={urls.sourceCountry(locale, r.slug, country)}
                      className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{TYPE_ICON[r.type]}</span>
                        <span className="text-text-primary">{r.name}</span>
                        <span className="font-mono text-[9px] uppercase text-text-muted">
                          {r.type}
                        </span>
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider ${TIER_COLOR[r.tier]}`}
                      >
                        {TIER_LABEL[r.tier]}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* ── Fallback: legacy sibling sources if rich data unavailable ──── */}
        {!stats && sameCountryLegacy.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Other sources covering {countryLabel}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sameCountryLegacy.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.sourceCountry(locale, s.slug, country)}
                    className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-text-primary">{s.name}</span>
                      <span className="font-mono text-[9px] uppercase text-text-muted">
                        {s.kind}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] text-accent">
                      {Math.round(s.reliability * 100)}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Footer links ───────────────────────────────────────────────── */}
        <p className="mt-10 text-xs text-text-muted">
          Source profile:{" "}
          <Link
            href={urls.source(locale, slug)}
            className="text-accent hover:underline"
          >
            full {sourceName}
          </Link>{" "}
          · country brief:{" "}
          <Link href={urls.country(locale, country)} className="text-accent hover:underline">
            {countryLabel}
          </Link>
        </p>
      </article>
    </>
  );
}
