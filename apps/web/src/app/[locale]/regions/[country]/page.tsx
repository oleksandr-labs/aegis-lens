import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getRegion, listRegions } from "@/lib/regions-seed";
import { eventsInCountry, eventsInBbox, COUNTRY_VIEW } from "@/lib/events-seed";
import { listOblasts } from "@/lib/oblasts-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { SITE } from "@/lib/site";
import { MiniMap } from "@/components/Map/MiniMap";
import { EventsPerHourSparkline } from "@/components/Sparkline";
import { timeAgo } from "@/lib/format";

type Params = { locale: string; country: string };

export function generateStaticParams() {
  const params: { locale: string; country: string }[] = [];
  for (const region of listRegions()) {
    // EN at root — no /en variant in static params (middleware rewrites).
    for (const locale of ACTIVE_LOCALES) {
      if (locale === "en") continue;
      params.push({ locale, country: region.iso2 });
    }
  }
  return params;
}

function resolveName(region: ReturnType<typeof getRegion>, locale: Locale): string {
  if (!region) return "";
  return region.name[locale] ?? region.name.en;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const region = getRegion(country);
  if (!region) return { robots: { index: false } };
  const name = resolveName(region, locale);
  const t = await getT(locale, "regions");
  return buildMetadata({
    locale,
    title: t("title", { country: name }),
    description: t("description", { country: name }),
    pathFor: (lc) => urls.region(lc, country),
  });
}

export default async function RegionPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const region = getRegion(country);
  if (!region) notFound();

  const t = await getT(locale, "regions");
  const name = resolveName(region, locale);
  const description = region.description[locale] ?? region.description.en;

  // Real (synthetic seed) event aggregates.
  const events = eventsInCountry(country);
  const eventCount = events.length;
  const severityIndex = events.length
    ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)
    : 0;
  const byClass = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});
  const topClasses = Object.entries(byClass)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const faq = [
    {
      q: `What is the current security situation in ${name}?`,
      a: `Aegis Lens tracks ${eventCount} verified events in ${name}. The average danger score is ${severityIndex}/100. The most frequent event class is ${topClasses[0]?.[0] ?? "unknown"}. All data is sourced from open, verifiable reporting and updated continuously.`,
    },
    {
      q: `How does Aegis Lens verify events in ${name}?`,
      a: `Each event in ${name} is corroborated across at least two independent sources from different tiers (wire service, regional media, social reporting, satellite imagery). A confidence score (0–100) reflects source count, tier quality, and imagery confirmation. Events below confidence 30 are hidden from the public map.`,
    },
    {
      q: `Can I subscribe to alerts for ${name}?`,
      a: `Yes — from the live map, filter by ${name} (ISO-2: ${region.iso2.toUpperCase()}) and click Subscribe. You will receive email or webhook alerts when new events are published for this region, filtered by event class and minimum danger score.`,
    },
    {
      q: `Is Aegis Lens data for ${name} freely available?`,
      a: `Public event data for ${name} is available under the CC-BY-4.0 licence via the /datasets page and the REST API. Attribution to Aegis Lens is required. Bulk commercial redistribution requires a data licence agreement.`,
    },
  ];

  // Place JSON-LD (schema.org Place + BreadcrumbList + FAQPage).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        name,
        description,
        address: { "@type": "PostalAddress", addressCountry: region.iso2.toUpperCase() },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("title", { country: name }),
            item: `${SITE.url}${urls.region(locale, country)}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const related = listRegions().filter((r) => r.iso2 !== region.iso2);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Region</p>
        <h1 className="mt-2 text-4xl font-semibold text-text-primary">{name}</h1>
        <p className="mt-3 text-text-secondary">{description}</p>
      </header>

      {/* KPI strip */}
      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Events" value={eventCount.toString()} />
        <Kpi label="Severity" value={`${severityIndex}/100`} />
        <Kpi label="Top class" value={topClasses[0]?.[0] ?? "—"} />
        <Kpi label="Country" value={region.iso2.toUpperCase()} mono />
      </section>

      {/* Sparkline */}
      <section className="mt-8">
        <EventsPerHourSparkline events={events} hours={24} />
      </section>

      {/* Mini map */}
      <section className="mt-6">
        <MiniMap
          center={COUNTRY_VIEW[region.iso2]?.center ?? [31.5, 49]}
          zoom={(COUNTRY_VIEW[region.iso2]?.zoom ?? 5) - 0.5}
          events={events}
          height={300}
        />
      </section>

      {/* Events */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">{t("events.title")}</h2>
        {eventCount === 0 ? (
          <div className="mt-3 rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            {t("events.empty")}
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {events.slice(0, 10).map((e) => (
              <li key={e.eventId} className="px-4 py-3">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <span>{e.class}</span>
                  <span>·</span>
                  <span>conf {Math.round(e.confidence * 100)}%</span>
                  <span>·</span>
                  <span>danger {e.dangerScore}</span>
                  <span>·</span>
                  <span>{timeAgo(e.occurredAt, locale)}</span>
                </div>
                <div className="mt-1 text-sm text-text-primary">
                  {e.summary[locale] ?? e.summary.en}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Class breakdown */}
      {topClasses.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text-primary">By class</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {topClasses.map(([cls, count]) => (
              <li
                key={cls}
                className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
              >
                <span className="text-text-secondary">{cls}</span>
                <span className="font-mono text-text-primary">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Admin-1 (oblasts / voivodeships / Bundesländer) */}
      {(() => {
        const oblasts = listOblasts(country);
        if (oblasts.length === 0) return null;
        const label = oblasts[0]?.kindLabel ?? "Region";
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">
              {label}s ({oblasts.length})
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {oblasts.map((o) => {
                const oblastEventCount = eventsInBbox(o.bbox).length;
                return (
                  <li key={o.slug}>
                    <Link
                      href={
                        locale === "en"
                          ? `/regions/${country}/${o.slug}`
                          : `/${locale}/regions/${country}/${o.slug}`
                      }
                      className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:border-accent/30 hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <span>{o.name[locale] ?? o.name.en}</span>
                      {oblastEventCount > 0 && (
                        <span className="ml-2 shrink-0 rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
                          {oblastEventCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })()}

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Frequently asked questions</h2>
        <dl className="mt-4 space-y-3">
          {faq.map((f, i) => (
            <details
              key={i}
              className="rounded border border-border-subtle bg-bg-surface"
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-text-primary hover:text-accent">
                {f.q}
              </summary>
              <p className="border-t border-border-subtle px-4 py-3 text-sm text-text-secondary">
                {f.a}
              </p>
            </details>
          ))}
        </dl>
      </section>

      {/* Top sources for this region */}
      {(() => {
        const regionSources = PUBLIC_SOURCES.filter((s) => s.country === region.iso2)
          .sort((a, b) => b.reliability - a.reliability)
          .slice(0, 6);
        if (regionSources.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">
              Top sources covering {name}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Primary open-source channels used for event verification in this region.
            </p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {regionSources.map((s) => (
                <li key={s.slug}>
                  <div className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{s.name}</span>
                        <span className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                          {s.kind.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary line-clamp-1">
                        {s.description}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <span className="font-mono text-xs text-accent">
                        {Math.round(s.reliability * 100)}%
                      </span>
                      <p className="font-mono text-[9px] text-text-muted">reliability</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-text-muted">
              Reliability scores are calculated from corroboration history and editorial review.{" "}
              <Link href={urls.sources(locale)} className="text-accent underline-offset-2 hover:underline">
                View full sources index →
              </Link>
            </p>
          </section>
        );
      })()}

      {/* Related regions */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">{t("related.title")}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.iso2}>
                <Link
                  href={urls.region(locale, r.iso2)}
                  className="block rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                >
                  {resolveName(r, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Kpi({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</div>
      <div className={`mt-1 text-lg ${mono ? "font-mono" : ""} text-text-primary`}>{value}</div>
    </div>
  );
}
