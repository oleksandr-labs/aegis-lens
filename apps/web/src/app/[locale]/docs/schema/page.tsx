import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventsInCountry } from "@/lib/events-seed";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Event schema & taxonomy";
const DESCRIPTION =
  "Complete reference for the Aegis Lens event object — every field, type, enum value, and constraint — plus the full event-class taxonomy used for filtering and subscriptions.";

const PRE_CLASS =
  "rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre";

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
    pathFor: (lc) => localePath(lc, "/docs/schema"),
  });
}

const SCHEMA_FIELDS: [string, string, string][] = [
  ["eventId", "string", "Unique ULID identifier — stable, sortable by creation time."],
  ["class", "EventClass", "Primary classification. Controlled vocabulary; see taxonomy below."],
  ["subclass", "string | null", "Secondary classification within the class (e.g. 'drone', 'missile')."],
  ["severity", "0 – 5", "Tactical severity scale. Derived from dangerScore for UI display."],
  ["dangerScore", "0 – 100", "Civilian risk composite. Independent of confidence."],
  ["confidence", "0 – 1", "Verification certainty as a float. 1.0 = primary evidence confirmed."],
  [
    "verificationState",
    "enum",
    "One of: unverified · corroborated · verified · disputed · retracted.",
  ],
  ["occurredAt", "ISO 8601", "Best-estimate UTC timestamp of the incident occurrence."],
  ["reportedAt", "ISO 8601", "UTC timestamp when first reported to the feed."],
  ["ingestedAt", "ISO 8601", "UTC timestamp when ingested into the Aegis Lens database."],
  [
    "location",
    "object",
    "{ lat: number, lon: number, precisionM: number } — WGS-84 coordinates + accuracy radius.",
  ],
  ["summary", "object", "{ en: string, uk?: string } — Human-readable headline. EN always present."],
  ["sources", "SourceRef[]", "At least one source citation. See SourceRef object below."],
  ["media", "string[]", "Public CDN URLs for imagery or video associated with the event."],
  ["originalText", "string | null", "Raw source text before editorial processing, if retained."],
];

const VERIFY_STATES: [string, string][] = [
  ["unverified", "Single-source claim; not yet corroborated. Filtered from the public map by default."],
  [
    "corroborated",
    "Two or more independent sources, or one tier-1 source with primary evidence.",
  ],
  [
    "verified",
    "Corroborated and cross-checked against imagery, geolocation, or official acknowledgement.",
  ],
  ["disputed", "Sources disagree on material facts. Event remains visible with the dispute noted."],
  ["retracted", "Withdrawn. Returned only when explicitly requested via ?include_retracted=true."],
];

const ALL_CLASSES: { group: string; rows: [string, string][] }[] = [
  {
    group: "Kinetic / military",
    rows: [
      ["military_action", "Confirmed or reported kinetic engagement: strike, shelling, air raid."],
      ["airstrike", "Air-delivered munition impact — bomb, missile, cruise missile, or UAV strike."],
      ["artillery", "Ground-based indirect fire: howitzer, MLRS, or mortar."],
      ["drone_attack", "One-way attack UAV (Shahed-family, Lancet, FPV) impact or intercept."],
      ["ground_assault", "Infantry or armoured ground manoeuvre or contact engagement."],
      ["explosion", "Detonation of unclear origin; class is refined as reporting matures."],
    ],
  },
  {
    group: "Infrastructure",
    rows: [
      ["energy_attack", "Strike or disruption targeting power generation, transmission, or distribution."],
      ["water_attack", "Attack on water treatment, pumping, or distribution facilities."],
      ["transport_attack", "Strike or disruption to bridges, rail, ports, or road infrastructure."],
      ["telecom_attack", "Attack on internet exchange, mobile towers, or fibre backbone."],
      ["fuel_attack", "Strike on fuel depots, pipelines, or refineries."],
    ],
  },
  {
    group: "Cyber & information",
    rows: [
      ["cyber_attack", "Intrusion, data-breach, or destructive cyberattack on an identified target."],
      ["ddos", "Distributed denial-of-service attack on a named target."],
      ["disinformation", "Verified false-narrative campaign with documented attribution."],
      ["data_leak", "Public release or confirmed exfiltration of sensitive data."],
    ],
  },
  {
    group: "Maritime & aviation",
    rows: [
      [
        "maritime_incident",
        "Ship attack, seizure, drone boat strike, or deviation from declared route.",
      ],
      [
        "aviation_incident",
        "Aircraft interception, forced landing, airspace violation, or shootdown.",
      ],
    ],
  },
  {
    group: "Humanitarian & civilian",
    rows: [
      ["civilian_casualty", "Confirmed or credibly reported civilian death or injury."],
      ["displacement", "Mass population movement driven by conflict or threat."],
      ["humanitarian_access", "Aid corridor opened, blocked, or violated."],
      ["detention", "Arbitrary detention, filtration, or prisoner exchange event."],
      ["civilian_alert", "Official air-raid, evacuation, or shelter-in-place alert."],
    ],
  },
  {
    group: "Diplomatic & political",
    rows: [
      [
        "diplomatic_event",
        "Ceasefire, negotiation, or international statement with operational significance.",
      ],
      ["sanctions", "New sanctions designation or enforcement action."],
      ["legal_action", "Arrest warrant, court proceeding, or accountability mechanism update."],
      ["political", "Summit, vote, or policy decision with conflict-relevant impact."],
    ],
  },
  {
    group: "Environment & other",
    rows: [
      ["environmental", "Environmental event — fire, flood, or industrial incident — in a conflict zone."],
      ["humanitarian", "General humanitarian situation report without a specific sub-class."],
      ["maritime", "Maritime activity not meeting the incident threshold."],
      ["aviation", "Aviation activity or restriction not meeting the incident threshold."],
      ["cyber", "Cyber activity below the attack threshold (recon, scanning, credential leak)."],
    ],
  },
];

export default async function SchemaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Grab the first UA event as the live example
  const exampleEvent = eventsInCountry("ua")[0] ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    author: { "@type": "Organization", name: "Aegis Lens" },
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Docs" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-10 text-text-secondary">
        <p>
          This page documents the canonical shape of every object returned by the Aegis Lens API
          and displayed on the live map. All field names are stable — breaking changes follow the
          deprecation policy in the API reference.
        </p>

        {/* ── Event object ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Event object</h2>
          <p className="mt-3">
            The Event is the atomic unit of the feed. Every other object either references events
            or aggregates them.
          </p>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated">
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Field
                  </th>
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {SCHEMA_FIELDS.map(([field, type, desc]) => (
                  <tr key={field} className="bg-bg-surface">
                    <td className="w-36 px-4 py-2 font-mono text-[11px] text-text-primary align-top">
                      {field}
                    </td>
                    <td className="w-36 px-4 py-2 font-mono text-[10px] text-text-muted align-top whitespace-nowrap">
                      {type}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Live example ── */}
        {exampleEvent && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-text-primary">Live example</h2>
            <p className="mt-3">
              Real event object from <code className="font-mono text-[11px] text-text-primary">eventsInCountry(&quot;ua&quot;)[0]</code> — synthetic
              seed data illustrating the canonical shape:
            </p>
            <pre className={`mt-4 ${PRE_CLASS}`}>
              <code>{JSON.stringify(exampleEvent, null, 2)}</code>
            </pre>
          </section>
        )}

        {/* ── Verification states ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Verification states</h2>
          <p className="mt-3">
            <code className="font-mono text-[11px] text-text-primary">verificationState</code> tracks
            the editorial status of each event. The value rises as more evidence arrives and can
            fall to <code className="font-mono text-[11px] text-text-primary">disputed</code> or{" "}
            <code className="font-mono text-[11px] text-text-primary">retracted</code> if reporting
            changes.
          </p>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border-subtle">
                {VERIFY_STATES.map(([val, desc]) => (
                  <tr key={val} className="bg-bg-surface">
                    <td className="w-40 px-4 py-2 font-mono text-[11px] text-text-primary align-top">
                      {val}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Event-class taxonomy ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Event-class taxonomy</h2>
          <p className="mt-3">
            <code className="font-mono text-[11px] text-text-primary">class</code> is a controlled
            vocabulary used for filtering, subscriptions, and feed routing. Every event has exactly
            one class. The <code className="font-mono text-[11px] text-text-primary">subclass</code>{" "}
            field provides optional secondary precision within the class.
          </p>
          <div className="mt-6 space-y-8">
            {ALL_CLASSES.map(({ group, rows }) => (
              <div key={group}>
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {group}
                </h3>
                <div className="mt-2 overflow-x-auto rounded border border-border-subtle">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border-subtle">
                      {rows.map(([cls, desc]) => (
                        <tr key={cls} className="bg-bg-surface">
                          <td className="w-44 px-4 py-2 font-mono text-[11px] text-text-primary align-top">
                            {cls}
                          </td>
                          <td className="px-4 py-2 text-text-secondary">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SourceRef ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">SourceRef object</h2>
          <p className="mt-3">
            Each event carries at least one source citation. The{" "}
            <code className="font-mono text-[11px] text-text-primary">sources</code> array contains
            SourceRef objects:
          </p>
          <pre className={`mt-4 ${PRE_CLASS}`}>{`{
  "url":         string | null,   // direct URL to the specific post or page cited
  "archiveUrl":  string | null,   // Wayback Machine copy if archived
  "fetchedAt":   ISO8601,         // when we retrieved this source
  "language":    string,          // BCP-47 language tag of the source content
  "contentHash": string           // SHA-256 of the raw source content at fetch time
}`}</pre>
        </section>

        {/* ── LocalizedString ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Summary / LocalizedString</h2>
          <p className="mt-3">
            The <code className="font-mono text-[11px] text-text-primary">summary</code> field is a
            locale map rather than a bare string. The{" "}
            <code className="font-mono text-[11px] text-text-primary">en</code> key is always
            present; other locales appear only where a translation has been produced.
          </p>
          <pre className={`mt-4 ${PRE_CLASS}`}>{`{
  "en": "Strike on Zaporizhzhia thermal power plant",
  "uk": "Удар по Запорізькій тепловій електростанції"
}`}</pre>
        </section>

        <p className="mt-12">
          For full query parameter reference, see the{" "}
          <Link className="text-text-primary underline underline-offset-2" href={localePath(locale, "/docs/api")}>
            API reference
          </Link>
          . For scoring detail, see{" "}
          <Link
            className="text-text-primary underline underline-offset-2"
            href={localePath(locale, "/docs/confidence")}
          >
            confidence &amp; danger scoring
          </Link>
          .
        </p>
      </article>
    </>
  );
}
