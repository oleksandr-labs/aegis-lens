import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { MiniMap } from "@/components/Map/MiniMap";
import { EventsPerHourSparkline } from "@/components/Sparkline";
import { getRegion } from "@/lib/regions-seed";
import { getOblast, listOblasts } from "@/lib/oblasts-seed";
import { listCities } from "@/lib/cities-seed";
import { eventsInBbox, eventById } from "@/lib/events-seed";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";
import { listReports } from "@/lib/reports-seed";
import { listInvestigations } from "@/lib/investigations-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { findOblast } from "@/lib/region-lookup";
import { EventTimeSeriesChart } from "@/components/EventTimeSeriesChart";

// Approximate administrative centre coordinates for Ukrainian oblasts.
const OBLAST_CENTERS: Record<string, { lat: number; lon: number }> = {
  kyiv:         { lat: 50.45, lon: 30.52 },
  kharkiv:      { lat: 49.99, lon: 36.23 },
  donetsk:      { lat: 48.01, lon: 37.80 },
  zaporizhzhia: { lat: 47.84, lon: 35.14 },
  kherson:      { lat: 46.64, lon: 32.62 },
  odesa:        { lat: 46.48, lon: 30.72 },
  mykolaiv:     { lat: 46.97, lon: 31.99 },
  dnipro:       { lat: 48.46, lon: 35.05 },
  lviv:         { lat: 49.84, lon: 24.03 },
  mariupol:     { lat: 47.09, lon: 37.55 },
};

type Params = { locale: string; country: string; oblast: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const country of ["ua", "pl", "de"]) {
    for (const o of listOblasts(country)) {
      for (const lc of ACTIVE_LOCALES) {
        out.push({ locale: lc, country, oblast: o.slug });
      }
    }
  }
  return out;
}

function name(o: ReturnType<typeof getOblast>, locale: Locale): string {
  if (!o) return "";
  return o.name[locale] ?? o.name.en;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, country, oblast } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const o = getOblast(country, oblast);
  if (!o) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: name(o, locale),
    description: `Verified events, infrastructure, and recent activity in ${name(o, locale)}.`,
    pathFor: (lc) =>
      lc === "en"
        ? `/regions/${country}/${oblast}`
        : `/${lc}/regions/${country}/${oblast}`,
    feeds: [
      {
        type: "application/rss+xml",
        href: urls.oblastFeed(locale, country, oblast),
        title: `${name(o, locale)} — events (RSS)`,
      },
      {
        type: "application/atom+xml",
        href: urls.oblastAtomLocale(locale, country, oblast),
        title: `${name(o, locale)} — events (Atom)`,
      },
      {
        type: "application/feed+json",
        href: urls.oblastJsonLocale(locale, country, oblast),
        title: `${name(o, locale)} — events (JSON Feed)`,
      },
    ],
  });
}

export default async function OblastPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, country, oblast } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const o = getOblast(country, oblast);
  if (!o) notFound();
  const parent = getRegion(country);

  const label = name(o, locale);
  const events = eventsInBbox(o.bbox);
  const eventCount = events.length;
  const severityIndex = events.length
    ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)
    : 0;
  const byClass = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});
  const topClasses = Object.entries(byClass).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        name: label,
        address: { "@type": "PostalAddress", addressCountry: country.toUpperCase(), addressRegion: label },
        geo: { "@type": "GeoCoordinates", latitude: o.center[1], longitude: o.center[0] },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Regions",
            item: `${SITE.url}${locale === "en" ? "/regions" : `/${locale}/regions`}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: parent?.name[locale] ?? parent?.name.en ?? country.toUpperCase(),
            item: `${SITE.url}${urls.region(locale, country)}`,
          },
          { "@type": "ListItem", position: 3, name: label },
        ],
      },
    ],
  };

  const now = Date.now();
  const recentEvents = events.filter(
    (e) => now - Date.parse(e.occurredAt) <= 24 * 3_600_000,
  );
  const avgDanger = severityIndex;

  // Resolve oblast centre: prefer OBLAST_CENTERS lookup (slug-keyed), fall back to bbox centre.
  const oblastCenter = OBLAST_CENTERS[oblast] ?? {
    lat: o.center[1],
    lon: o.center[0],
  };

  const siblings = listOblasts(country)
    .filter((x) => x.slug !== o.slug)
    .slice(0, 12);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
        <Link href={urls.region(locale, country)} className="hover:text-text-primary">
          {parent?.name[locale] ?? parent?.name.en ?? country.toUpperCase()}
        </Link>
        <span className="mx-2 text-border-default">/</span>
        <span className="text-text-secondary">{label}</span>
      </nav>

      <PageHeader
        eyebrow={o.kindLabel}
        title={label}
        description={`Capital: ${o.capital}. Events monitored within administrative bounding box.`}
      />

      <div className="mt-2 flex items-center">
        <a
          href={urls.oblastFeed(locale, country, oblast)}
          className="font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
        >
          RSS feed →
        </a>
      </div>

      {/* ── Mini-map + KPI cards ─────────────────────────────────────────── */}
      <div className="mx-auto mt-6 max-w-5xl">
        <div className="grid gap-4 md:grid-cols-[1fr_300px]">
          <div>
            <MiniMap
              lat={oblastCenter.lat}
              lon={oblastCenter.lon}
              zoom={7}
              eventCount={eventCount}
              className="h-64 overflow-hidden rounded border border-border-subtle"
            />
          </div>
          <div className="space-y-3">
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Events (24h)</div>
              <div className="mt-1 text-2xl font-mono text-text-primary">{recentEvents.length}</div>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Avg danger</div>
              <div className="mt-1 text-2xl font-mono text-text-primary">{avgDanger}</div>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Total events</div>
              <div className="mt-1 text-2xl font-mono text-text-primary">{eventCount}</div>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Top class</div>
              <div className="mt-1 text-base font-mono text-text-primary">{topClasses[0]?.[0] ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <EventsPerHourSparkline events={events} hours={24} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-text-primary">Recent events</h2>
        {events.length === 0 ? (
          <div className="mt-3 rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No events in this oblast right now.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {events.slice(0, 10).map((e) => (
              <li key={e.eventId} className="px-4 py-3">
                <Link href={urls.event(locale, e.eventId)} className="block">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>{e.class}</span>
                    <span>·</span>
                    <span>{e.subclass}</span>
                    <span>·</span>
                    <span>{timeAgo(e.occurredAt, locale)}</span>
                  </div>
                  <div className="mt-1 text-sm text-text-primary">
                    {e.summary[locale] ?? e.summary.en}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Event activity time-series */}
      <section className="mx-auto mt-8 max-w-5xl">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Event activity (last 30 days)
        </h2>
        <EventTimeSeriesChart
          events={events.map((e) => ({ occurredAt: e.occurredAt, class: e.class }))}
          days={30}
        />
      </section>

      {/* Civilian safety summary */}
      {(() => {
        if (events.length === 0) return null;
        const civilian = byClass["civilian_alert"] ?? 0;
        const humanitarian = byClass["humanitarian"] ?? 0;
        const infra = byClass["infrastructure"] ?? 0;
        const military = byClass["military_action"] ?? 0;
        const highDanger = events.filter((e) => e.dangerScore >= 70).length;
        const parts: string[] = [];
        if (civilian > 0) parts.push(`${civilian} civilian alert${civilian === 1 ? "" : "s"}`);
        if (humanitarian > 0)
          parts.push(`${humanitarian} humanitarian event${humanitarian === 1 ? "" : "s"}`);
        if (infra > 0) parts.push(`${infra} infrastructure incident${infra === 1 ? "" : "s"}`);
        if (military > 0)
          parts.push(`${military} kinetic event${military === 1 ? "" : "s"}`);
        const mix = parts.length > 0 ? parts.join(", ") : `${events.length} events`;
        const tone =
          highDanger >= 3
            ? "border-red-500/40 bg-red-500/5"
            : highDanger >= 1
              ? "border-yellow-500/40 bg-yellow-500/5"
              : "border-border-subtle bg-bg-surface";
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">Civilian safety</h2>
            <div className={`mt-3 rounded border ${tone} p-4 text-sm text-text-secondary`}>
              <p>
                Aegis Lens has logged {mix} in {label} within the monitored window. Of these,{" "}
                <strong className="text-text-primary">{highDanger}</strong>{" "}
                {highDanger === 1 ? "incident is" : "incidents are"} at danger ≥ 70.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Not an official advisory — see {" "}
                <Link href={urls.methodology(locale)} className="text-accent hover:underline">
                  methodology
                </Link>{" "}
                for scoring caveats.
              </p>
            </div>
          </section>
        );
      })()}

      {/* Top sources covering this country */}
      {(() => {
        const sources = PUBLIC_SOURCES.filter(
          (s) => s.country.toLowerCase() === country.toLowerCase(),
        )
          .slice()
          .sort((a, b) => b.reliability - a.reliability)
          .slice(0, 6);
        if (sources.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">Top sources</h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Public OSINT sources covering {country.toUpperCase()}, ranked by reliability
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sources.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.source(locale, s.slug)}
                    className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <span>{s.name}</span>
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
        );
      })()}

      {/* Recent reports about this region (derived from cited events) */}
      {(() => {
        const oblastBboxKey = o.slug;
        const matching = listReports().filter((r) => {
          for (const id of r.citations) {
            const ev = eventById(id);
            if (!ev) continue;
            const ob = findOblast(ev.location.lon, ev.location.lat);
            if (ob && ob.slug === oblastBboxKey && ob.iso2 === country) return true;
          }
          return false;
        }).slice(0, 5);
        if (matching.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">Recent reports</h2>
            <ul className="mt-3 space-y-2">
              {matching.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.report(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {r.kind} · {new Date(r.publishedAt).toISOString().slice(0, 10)}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {r.title[locale] ?? r.title.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* Related investigations (matching this oblast slug) */}
      {(() => {
        const matching = listInvestigations()
          .filter((inv) => (inv.citedOblastSlugs ?? []).includes(o.slug))
          .slice(0, 4);
        if (matching.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">Related investigations</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {matching.map((inv) => (
                <li key={inv.slug}>
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
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
        );
      })()}

      {/* Cities in this oblast */}
      {(() => {
        const cities = listCities(country, oblast);
        if (cities.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">
              Cities ({cities.length})
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={
                      locale === "en"
                        ? `/regions/${country}/${oblast}/${city.slug}`
                        : `/${locale}/regions/${country}/${oblast}/${city.slug}`
                    }
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <div className="flex items-center justify-between">
                      <span>{city.name[locale] ?? city.name.en}</span>
                      {city.capital && (
                        <span className="font-mono text-[9px] uppercase text-accent">capital</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Other {o.kindLabel.toLowerCase()}s</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link
                  href={
                    locale === "en"
                      ? `/regions/${country}/${s.slug}`
                      : `/${locale}/regions/${country}/${s.slug}`
                  }
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  {name(s, locale)}
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
