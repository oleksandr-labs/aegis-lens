import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "OSINT Methodology & Data-Use Policy";
const DESCRIPTION =
  "How Aegis Lens collects, verifies, scores, and publishes open-source intelligence — including source tiers, confidence scoring, danger scoring, editorial review, and permissible use of our data.";
const LAST_UPDATED = "2026-05-24";

const lp = (lc: Locale) =>
  lc === "en" ? "/legal/methodology" : `/${lc}/legal/methodology`;

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
    pathFor: lp,
  });
}

export default async function MethodologyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: locale,
        url: `https://aegislens.io${lp(locale)}`,
        dateModified: LAST_UPDATED,
        publisher: { "@type": "Organization", name: "Aegis Lens" },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Where does Aegis Lens get its event data?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Aegis Lens aggregates open-source data from Telegram channels, wire services (Reuters, AP, Ukrinform), official government briefings, satellite imagery (Sentinel-1/2, NASA FIRMS), and OSINT community reports. All sources are assigned a reliability tier (1–4) used in confidence scoring.",
            },
          },
          {
            "@type": "Question",
            name: "What does the confidence score mean?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Confidence (0–100) is a calibrated probability that an event is factually accurate and correctly located. It is computed from source count, source tier, corroboration rate, imagery confirmation, and analyst review. Events below 30 are hidden from the public map by default.",
            },
          },
          {
            "@type": "Question",
            name: "Can I republish Aegis Lens event data?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Public event data is available under CC-BY-4.0. You may use it freely with attribution. Bulk commercial redistribution requires a data licence agreement. See section 7 of this policy.",
            },
          },
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
      <PageHeader eyebrow="Legal" title={TITLE} description={DESCRIPTION} />

      <Prose>
        <p className="font-mono text-xs text-text-muted">
          Last updated: {LAST_UPDATED} · Effective immediately upon publication
        </p>

        <h2>1. Overview</h2>
        <p>
          Aegis Lens is an open-source intelligence (OSINT) platform. We collect publicly
          available information, process it through a structured verification pipeline, and publish
          confidence-scored event data. This document describes our collection methodology,
          editorial standards, scoring algorithms, and the terms under which third parties may
          use our data.
        </p>
        <p>
          Nothing in this document is legal advice. For specific questions about data licensing,
          contact <a href="mailto:data@aegislens.io">data@aegislens.io</a>.
        </p>

        <h2>2. Source collection</h2>
        <h3>2.1 Source types</h3>
        <p>
          We ingest information from the following categories of open source:
        </p>
        <ul>
          <li>
            <strong>Tier 1 — Institutional wire services:</strong> Reuters, Associated Press,
            AFP, Ukrinform, Interfax-Ukraine, official Ukrainian government and military
            accounts, and verified international media with named bylines.
          </li>
          <li>
            <strong>Tier 2 — Established regional media:</strong> National broadcasters
            (Suspilne, UA:Pershyi), established online news outlets with editorial standards,
            and confirmed NGO communications (UNHCR, OCHA, ICRC).
          </li>
          <li>
            <strong>Tier 3 — Social and Telegram sources:</strong> Verified regional Telegram
            channels with consistent track records, geolocated citizen reports, and OSINT
            community analyses. Each is scored individually; channels with a history of
            inaccuracy are downweighted.
          </li>
          <li>
            <strong>Tier 4 — Satellite and sensor data:</strong> Sentinel-1 SAR coherence
            change, Sentinel-2 optical imagery (10 m resolution), NASA FIRMS near-real-time
            fire detection (375 m, VIIRS), and Planet Labs imagery where publicly available.
            Sensor data is treated as corroborating evidence, not as a primary event source.
          </li>
        </ul>

        <h3>2.2 What we do not use</h3>
        <p>
          We do not use data that requires breaking into non-public systems, interception of
          communications, or other activities prohibited under applicable law. We do not pay
          sources. We do not embed with armed parties or accept embargoed military briefings
          that would require us to withhold or delay publication of safety-relevant information.
        </p>

        <h2>3. Event verification pipeline</h2>
        <ol>
          <li>
            <strong>Ingestion:</strong> Raw reports are ingested continuously. Duplicate detection
            runs a fuzzy match on location, time, and event class. Near-duplicates are merged
            into a single event with all contributing sources listed.
          </li>
          <li>
            <strong>Geolocation:</strong> Each event is assigned a location (lat/lon) with an
            accuracy label: <em>exact</em> (within 100 m, imagery-confirmed),{" "}
            <em>district</em> (within 5 km), <em>city</em> (within 25 km), or{" "}
            <em>region</em> (oblast-level). Analysts cross-reference anchor objects, road
            markings, and shadow angles using SunCalc and OpenStreetMap.
          </li>
          <li>
            <strong>Timestamp verification:</strong> Timestamps are verified against shadow
            direction, metadata, and cross-source consistency. If the original source timestamp
            differs materially from derived estimates, both are recorded.
          </li>
          <li>
            <strong>Corroboration:</strong> Events are held in an{" "}
            <em>unverified</em> state until at least one independent source from a different
            tier confirms the core facts. Events with three or more independent corroborations
            advance to <em>corroborated</em> status.
          </li>
          <li>
            <strong>Scoring:</strong> Confidence and danger scores are computed (see Section 4).
          </li>
          <li>
            <strong>Publication:</strong> Events with confidence ≥ 30 are published to the
            public map. Events below 30 are retained in the database but marked{" "}
            <em>unverified</em> and excluded from the default API response.
          </li>
          <li>
            <strong>Correction and retraction:</strong> If new information contradicts a
            published event, the event is updated with a correction note. If the event is
            found to be entirely false, it is retracted — not deleted — and the retraction
            is logged in the event record and our changelog.
          </li>
        </ol>

        <h2>4. Scoring methodology</h2>
        <h3>4.1 Confidence score (0–100)</h3>
        <p>
          Confidence is a calibrated probability that the event occurred as described and was
          correctly located. It is computed from:
        </p>
        <ul>
          <li>Number of independent sources (logarithmic: each additional source adds less)</li>
          <li>Weighted source tier (Tier 1 sources contribute more than Tier 3)</li>
          <li>Corroboration breadth (sources from distinct channels / countries)</li>
          <li>Imagery or sensor confirmation (+10 to +20 points)</li>
          <li>Analyst review (manual override can raise or lower by ±15)</li>
        </ul>
        <p>
          Scores are calibrated against a hold-out set of events verified after the fact by
          authoritative sources (e.g., official casualty reports, post-battle damage assessments).
          We publish calibration statistics quarterly.
        </p>

        <h3>4.2 Danger score (0–100)</h3>
        <p>
          Danger measures the estimated risk to life and infrastructure that a published event
          represents. It is independent of confidence (a highly confident low-danger event scores
          high on confidence, low on danger). Inputs:
        </p>
        <ul>
          <li>Event class: kinetic (highest), infrastructure, cyber, information (lowest)</li>
          <li>Event subclass: ballistic missile strike vs. small-arms fire, etc.</li>
          <li>Proximity to civilian population centres (census data, OSM building density)</li>
          <li>Weapon yield estimate where available</li>
          <li>Reported casualty count (preliminary)</li>
        </ul>
        <p>
          Danger scores are used by subscribers to set alert thresholds. They are explicitly not
          a prediction of future events — they describe the estimated harm of the recorded event.
        </p>

        <h2>5. Correction and retraction policy</h2>
        <p>
          We correct errors as quickly as possible and document corrections transparently.
          Corrections are visible on the event page and in the API response via the{" "}
          <code>corrections[]</code> field. Events are never silently deleted. If you believe an
          event contains an error, report it to{" "}
          <a href="mailto:data@aegislens.io">data@aegislens.io</a> with the event ID and
          evidence. We aim to respond within 48 hours and, if the correction is confirmed,
          update within 24 additional hours.
        </p>

        <h2>6. Editorial independence</h2>
        <p>
          Aegis Lens editorial and data decisions are made independently of commercial
          relationships, political pressure, and user requests that would require us to suppress,
          misrepresent, or delay factually supported information. No advertiser, investor, or
          government has review rights over our data publications. We comply with legally mandated
          takedowns only after review by counsel, and we publish a transparency report of all
          such requests annually.
        </p>

        <h2>7. Data-use policy</h2>
        <h3>7.1 Public data (CC-BY-4.0)</h3>
        <p>
          Events, regions, glossary terms, and equipment data marked as public on our datasets
          page are published under the{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Creative Commons Attribution 4.0 International
          </a>{" "}
          (CC-BY-4.0) licence. You may:
        </p>
        <ul>
          <li>Copy, distribute, and transmit the data</li>
          <li>Adapt the data (transform, build upon)</li>
          <li>Use the data for commercial and non-commercial purposes</li>
        </ul>
        <p>
          <strong>Attribution required:</strong> "Source: Aegis Lens (aegislens.io), CC-BY-4.0"
          or equivalent prominent credit.
        </p>

        <h3>7.2 Prohibited uses</h3>
        <p>
          Regardless of licence, you may not use Aegis Lens data to:
        </p>
        <ul>
          <li>Target individuals for violence or persecution</li>
          <li>Generate content that glorifies or encourages war crimes</li>
          <li>Train AI models for the purpose of targeting, deception, or disinformation</li>
          <li>Re-publish under a licence that removes attribution requirements</li>
        </ul>
        <p>
          We reserve the right to terminate API access for users who violate these terms. See
          our <Link href={localePath(locale, "/legal/aup")}>Acceptable Use Policy</Link> for
          the full list of prohibited activities.
        </p>

        <h3>7.3 Bulk commercial redistribution</h3>
        <p>
          If you plan to commercially resell or integrate our data as a core component of a
          competing product, a data licence agreement is required. Contact{" "}
          <a href="mailto:data@aegislens.io">data@aegislens.io</a>.
        </p>

        <h2>8. AI-training policy</h2>
        <p>
          You may use publicly available Aegis Lens data to train AI models for{" "}
          <strong>research, journalism, and defensive OSINT applications</strong>. You may not
          use our data to train models whose primary commercial function competes directly with
          Aegis Lens without a written licence. Crawling our platform beyond the rate limits
          specified in <Link href={localePath(locale, "/docs/rate-limits")}>our docs</Link>{" "}
          is prohibited.
        </p>
        <p>
          Reputable AI indexing crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended,
          OAI-SearchBot) are allowed to index publicly available pages for retrieval purposes.
          Crawlers that do not respect <code>Crawl-delay</code> or which appear designed for
          bulk training ingestion may be blocked without notice.
        </p>

        <h2>9. Contact</h2>
        <p>
          Data methodology questions: <a href="mailto:data@aegislens.io">data@aegislens.io</a>
          <br />
          Correction requests: same address, subject line "Correction: [event ID]"
          <br />
          Data licensing: <a href="mailto:data@aegislens.io">data@aegislens.io</a>
          <br />
          Legal notices: <a href="mailto:legal@aegislens.io">legal@aegislens.io</a>
        </p>

        <hr />
        <p>
          Related policies:{" "}
          <Link href={localePath(locale, "/legal/disputed-area")}>
            Disputed-area display policy
          </Link>{" "}
          ·{" "}
          <Link href={localePath(locale, "/legal/aup")}>Acceptable Use Policy</Link> ·{" "}
          <Link href={localePath(locale, "/legal/privacy")}>Privacy Policy</Link>
        </p>
      </Prose>
    </>
  );
}
