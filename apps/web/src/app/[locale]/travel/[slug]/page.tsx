import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  CITY_RISK_DATA,
  RISK_CONFIG,
  EVACUATION_LABELS,
} from "@/lib/travel-risk-data";
import { eventsInBbox } from "@/lib/events-seed";

type Params = { locale: string; slug: string };

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const city of CITY_RISK_DATA) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: city.slug });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const city = CITY_RISK_DATA.find((c) => c.slug === slug);
  if (!city) return { robots: { index: false } };

  return buildMetadata({
    locale,
    title: `${city.name} Travel Safety Guide — Risk level ${RISK_LABELS[city.riskLevel]}`,
    description: `${city.recommendation} ${city.alertsLast24h} alerts in the last 24 hours. Emergency contacts, shelter info, and evacuation status for ${city.name}.`,
    pathFor: (lc) => localePath(lc, `/travel/${slug}`),
  });
}

// ---------------------------------------------------------------------------
// Proximity helper: find seed events within ~1 degree (~110 km) of the city
// ---------------------------------------------------------------------------

const PROXIMITY_DEG = 1.0;

function nearbyEvents(cityLat: number, cityLon: number) {
  return eventsInBbox([
    cityLon - PROXIMITY_DEG,
    cityLat - PROXIMITY_DEG,
    cityLon + PROXIMITY_DEG,
    cityLat + PROXIMITY_DEG,
  ]).slice(0, 5);
}

// ---------------------------------------------------------------------------
// Evacuation explanation copy
// ---------------------------------------------------------------------------

const EVACUATION_EXPLAINER: Record<string, string> = {
  not_recommended:
    "No evacuation order is in effect. Residents are advised to remain prepared and follow official alerts.",
  voluntary:
    "Voluntary evacuation is in effect. Residents, especially vulnerable groups, are encouraged to relocate to safer areas.",
  mandatory:
    "Mandatory evacuation is in effect. All residents are ordered to leave the affected area immediately. Comply with directions from Ukrainian security forces.",
  completed:
    "Evacuation of this area has been completed. Access is restricted. Do not attempt to enter.",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function TravelCityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const city = CITY_RISK_DATA.find((c) => c.slug === slug);
  if (!city) notFound();

  const cfg = RISK_CONFIG[city.riskLevel];
  const nearby = nearbyEvents(city.lat, city.lon);
  const relatedCities = CITY_RISK_DATA.filter(
    (c) => c.slug !== city.slug && c.riskLevel === city.riskLevel,
  );

  const popFormatted = city.population.toLocaleString("en-GB");
  const googleMapsSearch = `https://www.google.com/maps/search/air+raid+shelter+${encodeURIComponent(city.name)}+Ukraine`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: city.name,
    description: city.recommendation,
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lon,
    },
    url: `${SITE.url}${localePath(locale, `/travel/${city.slug}`)}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Travel Safety Guide"
        title={city.name}
        description={`${city.oblast} — Real-time safety guide for travellers and residents.`}
      />

      <article className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        {/* Hero: city meta + risk badge */}
        <section className={`rounded border ${cfg.border} ${cfg.bg} p-5`}>
          <div className="flex flex-wrap items-start gap-6">
            {/* Risk badge */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Risk level
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-sm font-semibold ${cfg.color} ${cfg.bg} ${cfg.border}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {cfg.label}
              </span>
            </div>

            {/* Population */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Population
              </p>
              <p className="font-mono text-sm text-text-secondary">{popFormatted}</p>
            </div>

            {/* Oblast */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Oblast
              </p>
              <p className="font-mono text-sm text-text-secondary">{city.oblast}</p>
            </div>

            {/* Ukrainian name */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Ukrainian
              </p>
              <p className="font-mono text-sm text-text-secondary">{city.ukrainianName}</p>
            </div>
          </div>

          {/* Danger score bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Danger score
              </span>
              <span className={`font-mono text-lg font-semibold ${cfg.color}`}>
                {city.dangerScore} / 100
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-base overflow-hidden">
              <div
                className={`h-full rounded-full ${cfg.bg.replace("/10", "/50")}`}
                style={{ width: `${city.dangerScore}%` }}
              />
            </div>
          </div>

          {/* Alerts row */}
          <div className="mt-4 flex items-center gap-6 text-xs font-mono">
            <span className="text-text-muted">
              Alerts (24h):{" "}
              <strong className={cfg.color}>{city.alertsLast24h}</strong>
            </span>
            <span className="text-text-muted">
              Shelters: <strong className="text-text-secondary">{city.shelterCount.toLocaleString("en-GB")}</strong>
            </span>
            <span className="text-text-muted">
              Last updated: <strong className="text-text-secondary">{city.lastUpdated}</strong>
            </span>
          </div>
        </section>

        {/* Official recommendation */}
        <section
          className={`rounded border ${cfg.border} ${cfg.bg} p-5`}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
            Official recommendation
          </p>
          <p className={`text-base font-medium ${cfg.color}`}>{city.recommendation}</p>
        </section>

        {/* Key risks */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Key risks</h2>
          <ul className="space-y-2">
            {city.keyRisks.map((risk) => (
              <li
                key={risk}
                className="flex items-start gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-2.5"
              >
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${cfg.bg.replace("/10", "")} border ${cfg.border}`} />
                <span className="text-sm text-text-secondary">{risk}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Evacuation status */}
        <section className="rounded border border-border-subtle bg-bg-surface p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Evacuation status</h2>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`rounded border px-3 py-1 font-mono text-xs font-semibold ${
                city.evacuationStatus === "mandatory"
                  ? "border-red-400/40 bg-red-400/10 text-red-400"
                  : city.evacuationStatus === "voluntary"
                  ? "border-orange-400/40 bg-orange-400/10 text-orange-400"
                  : city.evacuationStatus === "completed"
                  ? "border-gray-400/40 bg-gray-400/10 text-gray-400"
                  : "border-green-400/40 bg-green-400/10 text-green-400"
              }`}
            >
              {EVACUATION_LABELS[city.evacuationStatus]}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {EVACUATION_EXPLAINER[city.evacuationStatus]}
          </p>
        </section>

        {/* Emergency contacts */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Emergency contacts</h2>
          <div className="overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {city.emergencyContacts.map((ec, i) => (
                  <tr
                    key={ec.number}
                    className={`border-t border-border-subtle ${
                      i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
                    }`}
                  >
                    <td className="px-4 py-2.5 text-text-secondary">{ec.name}</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`tel:${ec.number}`}
                        className="font-mono text-accent hover:underline"
                      >
                        {ec.number}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Shelter information */}
        <section className="rounded border border-border-subtle bg-bg-surface p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Air raid shelter information</h2>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Registered shelters
              </p>
              <p className="text-3xl font-semibold font-mono text-text-primary">
                {city.shelterCount.toLocaleString("en-GB")}
              </p>
              <p className="mt-1 text-xs text-text-muted">in {city.name} city area</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={googleMapsSearch}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-border-default px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent text-center"
              >
                Air raid shelter map &#8599;
              </a>
              <a
                href="https://www.dsns.gov.ua/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-border-default px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent text-center"
              >
                ДСНС official shelters &#8599;
              </a>
            </div>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Shelter count is indicative. For the authoritative registered shelter list, consult
            the ДСНС official resource. When an air raid alert sounds, seek the nearest shelter
            immediately.
          </p>
        </section>

        {/* Nearby verified events */}
        {nearby.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              Last verified events in {city.name}
            </h2>
            <ul className="space-y-2">
              {nearby.map((ev) => {
                const hoursAgo = Math.round(
                  (Date.now() - new Date(ev.occurredAt).getTime()) / 3_600_000,
                );
                const timeLabel = hoursAgo < 1 ? "< 1h ago" : `${hoursAgo}h ago`;
                return (
                  <li
                    key={ev.eventId}
                    className="flex items-start gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-3"
                  >
                    <span className="shrink-0 font-mono text-[10px] text-text-muted pt-0.5 w-14">
                      {timeLabel}
                    </span>
                    <span className="text-sm text-text-secondary">{ev.summary.en}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-text-muted">
              Events are synthetic illustrative data. For verified real-time events, see{" "}
              <Link href={localePath(locale, "/dashboard")} className="text-accent hover:underline">
                the Aegis Lens dashboard
              </Link>
              .
            </p>
          </section>
        )}

        {/* Quick action links */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href={googleMapsSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border-default bg-bg-surface px-4 py-3 text-center font-mono text-xs text-text-secondary hover:border-accent hover:text-accent"
          >
            Air raid shelter map &#8599;
          </a>
          <Link
            href={`${localePath(locale, "/alerts")}?region=${city.slug}`}
            className="rounded border border-border-default bg-bg-surface px-4 py-3 text-center font-mono text-xs text-text-secondary hover:border-accent hover:text-accent"
          >
            Subscribe to alerts for {city.name}
          </Link>
          <a
            href="https://www.gov.ua/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border-default bg-bg-surface px-4 py-3 text-center font-mono text-xs text-text-secondary hover:border-accent hover:text-accent"
          >
            Official travel advisory (gov.ua) &#8599;
          </a>
        </section>

        {/* Subscribe CTA */}
        <section className="rounded border border-accent/20 bg-accent/5 p-5">
          <h2 className="text-base font-semibold text-text-primary">
            Subscribe to alerts for {city.name}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Get real-time notifications when the alert level changes or a new event is verified
            in this city.
          </p>
          <Link
            href={`${localePath(locale, "/alerts")}?region=${city.slug}`}
            className="mt-3 inline-block rounded bg-accent px-4 py-2 font-mono text-sm text-bg-base hover:bg-accent/90"
          >
            Set up city alerts &rarr;
          </Link>
        </section>

        {/* Related cities (same risk level) */}
        {relatedCities.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">
              Other cities with {cfg.label.toLowerCase()} risk
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {relatedCities.map((c) => {
                const rcfg = RISK_CONFIG[c.riskLevel];
                return (
                  <li key={c.slug}>
                    <Link
                      href={localePath(locale, `/travel/${c.slug}`)}
                      className={`flex items-center gap-2 rounded border ${rcfg.border} bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${rcfg.bg.replace("/10", "")} border ${rcfg.border}`} />
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* All cities link */}
        <div className="pt-2">
          <Link
            href={localePath(locale, "/travel")}
            className="font-mono text-xs text-accent hover:underline"
          >
            &larr; Back to Ukraine City Safety Index
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="rounded border border-border-subtle bg-bg-surface/50 p-4 text-xs text-text-muted">
          <strong className="text-text-secondary">Disclaimer:</strong>{" "}
          This information is for awareness only and is based on synthetic illustrative data.
          Always follow official guidance from Ukrainian authorities, ДСНС, and local military
          administrations. Aegis Lens does not replace official emergency services or evacuation
          instructions.
        </div>

      </article>
    </>
  );
}
