import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "OSINT methodology guide";
const DESCRIPTION =
  "How Aegis Lens collects, verifies, and publishes open-source intelligence — source tiers, the verification pipeline, geolocation standards, and editorial independence.";

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
    pathFor: (lc) => localePath(lc, "/docs/osint-guide"),
  });
}

const STEPS: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: "Signal collection",
    body: "Automated ingestors monitor ≥ 400 public channels across Telegram, X/Twitter, official ministry feeds, wire agencies (Reuters, AP, AFP), and satellite imagery catalogues. Collection is continuous; average latency from original post to ingest queue is < 90 seconds.",
  },
  {
    n: 2,
    title: "Deduplication & clustering",
    body: "Near-duplicate detection clusters reports of the same incident before any analyst review. Clustering uses a combination of geographic proximity (< 5 km), time window (< 4 hours), and semantic similarity on the extracted summary. Duplicate chains are collapsed into a single candidate event.",
  },
  {
    n: 3,
    title: "Initial triage",
    body: "An analyst (or AI-assisted pre-screen) assigns a preliminary class, location, and source tier to the candidate. Events with a single tier-3 or tier-4 source and no imagery are marked reported and held for corroboration before publication.",
  },
  {
    n: 4,
    title: "Geolocation",
    body: "Where location is not explicit, analysts attempt geolocation using Google Maps satellite, OpenStreetMap, Sentinel-2/Planet imagery, and tool-assisted shadow analysis (SunCalc). Precision level (exact / approximate / region / unknown) is recorded and reflected in the confidence score.",
  },
  {
    n: 5,
    title: "Source corroboration",
    body: "A second independent source from a different tier is required before an event advances from reported to corroborated. 'Independent' is strict: downstream republications of the same original post do not count. Imagery from a second satellite pass constitutes independent corroboration.",
  },
  {
    n: 6,
    title: "Verification",
    body: "Events are marked verified when corroborated content is cross-checked against primary evidence — geolocated imagery, official statement with specific detail, or direct audio/video with confirmed time and place. Verification is analyst-signed and time-stamped.",
  },
  {
    n: 7,
    title: "Publication & monitoring",
    body: "Published events are monitored for retraction requests, new contradictory evidence, or corrections from named sources. Retracted events are marked retracted (not deleted); the retraction reason and retracting source are logged in the record.",
  },
];

export default async function OsintGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

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
          Aegis Lens applies a structured OSINT methodology derived from established open-source
          intelligence tradecraft (Bellingcat, GIJN, ACLED) and adapted to the pace and threat
          environment of active conflict monitoring. This document describes what we do and, as
          importantly, what we do not do.
        </p>

        {/* ── Source tiers ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Source tiers</h2>
          <p className="mt-3">
            Every source in our directory is assigned a tier. Tier assignment is reviewed
            quarterly and revised on evidence of significant accuracy changes.
          </p>

          <div className="mt-5 space-y-4">
            {[
              {
                tier: "Tier 1 — Primary / authoritative",
                examples: "Reuters, AP, AFP, official ministry of defence channels, OSCE SMM, UN OCHA",
                criteria:
                  "Named editorial accountability, established correction policy, first-hand access, multi-decade track record. Used as anchor sources; a single Tier-1 report with corroborating imagery can reach corroborated state.",
              },
              {
                tier: "Tier 2 — Established regional / specialist",
                examples: "ISW, Meduza, Ukrinform, RUSI, established investigative outlets, BDA-specialist accounts",
                criteria:
                  "Named editorial team, visible correction history, specialist domain knowledge. Strong but requires at least one independent second source.",
              },
              {
                tier: "Tier 3 — Social / milblogger",
                examples: "Named Telegram milblogger channels, geolocated civilian posts, known conflict video accounts",
                criteria:
                  "Consistent posting history, verified subject-matter involvement, no commercial disinformation incentive. Two independent Tier-3 sources meet the corroboration bar if both show primary evidence.",
              },
              {
                tier: "Tier 4 — Unverifiable",
                examples: "Anonymous accounts, freshly-created channels, contested-origin posts",
                criteria:
                  "No track record. Not used as a sole source. Penalised in confidence calculation. May serve as a signal to investigate but never as evidence.",
              },
            ].map(({ tier, examples, criteria }) => (
              <div
                key={tier}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <p className="font-semibold text-text-primary">{tier}</p>
                <p className="mt-1 text-sm">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    Examples:{" "}
                  </span>
                  {examples}
                </p>
                <p className="mt-2 text-sm">{criteria}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7-step pipeline ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Verification pipeline</h2>
          <p className="mt-3">
            All events follow the same seven-step pipeline regardless of class or origin.
          </p>
          <ol className="mt-6 space-y-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated font-mono text-[11px] text-text-muted">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-text-primary">{s.title}</p>
                  <p className="mt-1 text-sm">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── What we do not use ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">What we do not use</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm">
            <li>
              <strong className="text-text-primary">Dark-web sources</strong> — unverifiable
              provenance, high disinformation risk.
            </li>
            <li>
              <strong className="text-text-primary">Subscription or paywalled data</strong> —
              unless the licence permits redistribution, which we disclose.
            </li>
            <li>
              <strong className="text-text-primary">AI-generated content</strong> as a primary
              source — AI may assist triage and translation but is never cited as source evidence.
            </li>
            <li>
              <strong className="text-text-primary">Single anonymous sources</strong> without
              corroborating primary evidence.
            </li>
            <li>
              <strong className="text-text-primary">Atrocity or casualty imagery</strong> from
              unverified accounts — published only where geolocated, consent-considered, and
              necessary for accountability documentation.
            </li>
          </ul>
        </section>

        {/* ── Geolocation standards ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Geolocation standards</h2>
          <p className="mt-3">
            We follow the Bellingcat geolocation standard: a claimed location is not published as
            "exact" unless at least two independent visual features are matched against
            authoritative map data (Google Maps, OpenStreetMap, Sentinel-2, or Planet
            imagery). Shadow-and-sun analysis (SunCalc / Suncalc.net) is used to corroborate
            claimed timestamps where applicable.
          </p>
          <p className="mt-3">
            Locations that cannot be geolocated are published with
            <code className="mx-1 font-mono text-text-primary">geoPrecision: region</code> or
            <code className="mx-1 font-mono text-text-primary">unknown</code> and a lower
            confidence score. We never fabricate or interpolate coordinates.
          </p>
        </section>

        {/* ── Editorial independence ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Editorial independence</h2>
          <p className="mt-3">
            No government, intelligence agency, or commercial partner has any influence over
            individual event publication decisions. Tier classifications and confidence scores are
            set by the editorial team independently of commercial relationships. Data-licensing
            partners receive the same feed as public consumers; they do not receive embargoed data
            or influence coverage.
          </p>
          <p className="mt-3">
            Corrections and retractions are published transparently; we do not silently delete
            events. If you believe a published event is incorrect, use the correction process
            described on the{" "}
            <Link className="text-text-primary underline" href={localePath(locale, "/legal/methodology")}>
              legal methodology page
            </Link>
            .
          </p>
        </section>

        <p className="mt-12">
          See also:{" "}
          <Link className="text-text-primary underline" href={localePath(locale, "/docs/confidence")}>
            confidence & danger scoring
          </Link>
          {" · "}
          <Link className="text-text-primary underline" href={localePath(locale, "/docs/schema")}>
            event schema
          </Link>
          {" · "}
          <Link className="text-text-primary underline" href={localePath(locale, "/sources")}>
            public sources directory
          </Link>
        </p>
      </article>
    </>
  );
}
