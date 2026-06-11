import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Methodology";
const DESCRIPTION =
  "How Aegis Lens collects, deduplicates, geolocates, scores, verifies, and publishes conflict and security data — from raw source ingestion to a published event on the public map.";

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
    pathFor: (lc) => localePath(lc, "/methodology"),
  });
}

const PIPELINE_STEPS = [
  { id: 1, label: "Ingest", short: "Raw source data enters the staging queue" },
  { id: 2, label: "Deduplicate", short: "Near-duplicate reports collapsed" },
  { id: 3, label: "Geolocate", short: "Coordinates extracted and verified" },
  { id: 4, label: "Classify", short: "Event type and severity assigned" },
  { id: 5, label: "Score", short: "Confidence + danger scores computed" },
  { id: 6, label: "Publish", short: "Human review gate; event goes live" },
];

export default async function MethodologyPage({
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
      <PageHeader eyebrow="Reference" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-12 text-text-secondary">

        {/* ── 1. Overview ── */}
        <section id="overview">
          <h2 className="text-2xl font-semibold text-text-primary">1. Overview</h2>
          <p className="mt-3">
            This document describes the end-to-end process by which Aegis Lens transforms raw
            open-source intelligence into structured, georeferenced conflict events on the public
            map. The methodology covers six linked stages: source ingestion, deduplication,
            geolocation, classification, confidence and danger scoring, and human review. It is
            a living document — updated whenever a stage is materially changed, with a dated entry
            added to the corrections log.
          </p>
          <p className="mt-3">
            Our primary design constraint is <strong className="text-text-primary">epistemic
            honesty</strong>: every event carries an explicit confidence score and geolocation
            accuracy class so that analysts know exactly how much weight to place on it. We
            publish uncertainty rather than hiding it.
          </p>
        </section>

        {/* ── Visual pipeline ── */}
        <section id="pipeline-diagram" className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-4">
            Verification pipeline
          </h3>
          {/* Horizontal stepper — wraps on small screens */}
          <div className="flex flex-wrap items-stretch gap-0">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-stretch">
                {/* Step box */}
                <div className="flex flex-col items-center justify-center rounded border border-border-subtle bg-bg-surface px-4 py-3 text-center w-28">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                    Step {step.id}
                  </span>
                  <span className="mt-1 text-sm font-semibold text-accent">{step.label}</span>
                  <span className="mt-1 text-[10px] text-text-muted leading-snug">{step.short}</span>
                </div>
                {/* Arrow connector (hidden after last) */}
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="flex items-center px-1 text-text-muted text-lg select-none">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. Source ingestion ── */}
        <section id="ingestion" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">2. Source ingestion</h2>
          <p className="mt-3">
            Aegis Lens continuously pulls from a curated corpus of open sources. Each source is
            assigned to one of three tiers (see{" "}
            <a
              href={localePath(locale, "/methodology#tiering")}
              className="text-accent underline-offset-2 hover:underline"
            >
              Source tiering
            </a>
            ) which governs its weight in downstream scoring.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              {
                label: "Collection mechanisms",
                detail:
                  "RSS/Atom feeds, authenticated REST APIs, Telegram MTProto adapters, and periodic HTTP crawlers. All crawlers respect robots.txt and honour Crawl-Delay directives. Rate limits are set conservatively — we never exhaust a source's API quota.",
              },
              {
                label: "Robots.txt compliance",
                detail:
                  "All HTTP crawlers check robots.txt before first request and re-check every 24 hours. Disallowed paths are never crawled. Where a Crawl-Delay is specified it is honoured with a 10% safety margin.",
              },
              {
                label: "Content extraction",
                detail:
                  "Raw HTML is parsed with a trafilatura-based pipeline for main-content extraction. Social media posts are parsed via official APIs or approved scraping methods. OCR (Tesseract + PaddleOCR) is applied to embedded images where text may contain location or event data.",
              },
              {
                label: "Entity extraction",
                detail:
                  "A fine-tuned NER model extracts locations, organizations, weapons systems, casualty figures, and timestamps from each report. Extracted entities feed deduplication clustering and geolocation.",
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-sm"
              >
                <span className="font-semibold text-text-primary">{item.label}. </span>
                {item.detail}
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. Deduplication ── */}
        <section id="deduplication" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">3. Deduplication</h2>
          <p className="mt-3">
            The same event is typically reported by dozens of sources within minutes. We collapse
            these into a single canonical event record using a three-layer deduplication stack:
          </p>
          <ol className="mt-4 space-y-3 list-none pl-0">
            {[
              {
                n: "3.1",
                label: "Perceptual hashing (imagery)",
                detail:
                  "All extracted images are hashed with pHash. Images with a Hamming distance below 8 are treated as duplicates. This catches re-cropped, compressed, or watermarked reposts of the same original photograph.",
              },
              {
                n: "3.2",
                label: "Semantic similarity (text)",
                detail:
                  "Candidate reports within a configurable time window (±4 hours by default) and spatial window (±50 km) are embedded with a bi-encoder model. Cosine similarity above 0.88 triggers a merge candidate — a human or AI review decides whether to collapse.",
              },
              {
                n: "3.3",
                label: "Timestamp + entity matching",
                detail:
                  "Reports sharing an exact or near-exact timestamp, location entity, and event-class label are automatically clustered regardless of semantic similarity score. This catches brief wire-service flashes that share few words with the full-text follow-up.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-sm"
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-accent mb-1">
                  {step.n} — {step.label}
                </div>
                {step.detail}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm">
            Each source that contributed to a merged event is retained in the event record as an
            independent corroborating signal. Collapsing does not remove provenance.
          </p>
        </section>

        {/* ── 4. Geolocation ── */}
        <section id="geolocation" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">4. Geolocation</h2>
          <p className="mt-3">
            We use a three-step pipeline to assign geographic coordinates to every event:
          </p>
          <ol className="mt-4 space-y-3 list-none pl-0">
            {[
              {
                n: "4.1",
                label: "NLP extraction",
                detail:
                  "The NER model extracts location mentions (city, street, landmark, raion, oblast). Ambiguous toponyms are resolved via a priority list: Ukraine-specific gazetteers first, then Nominatim/Overpass API, then general geocoders.",
              },
              {
                n: "4.2",
                label: "Geocoder resolution",
                detail:
                  "Extracted place names are sent to a locally hosted Nominatim instance (refreshed weekly from OSM Ukraine extract). Results are ranked by administrative level and relevance; the best candidate is selected and tagged with a preliminary accuracy class.",
              },
              {
                n: "4.3",
                label: "Visual geolocation",
                detail:
                  "For events that include imagery, YOLOv8 detects landmarks, infrastructure, and terrain features. A vector database of geolocated reference images is queried for visual nearest neighbours. When a visual match is found with high confidence it can upgrade the accuracy class (e.g. district → street).",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-sm"
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-accent mb-1">
                  {step.n} — {step.label}
                </div>
                {step.detail}
              </li>
            ))}
          </ol>

          <h3 className="mt-6 text-base font-semibold text-text-primary">
            Geolocation accuracy classes
          </h3>
          <p className="mt-2 text-sm">
            Every event carries an accuracy class that determines how it is rendered on the map
            and how much it contributes to the confidence score.
          </p>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  {["Class", "Radius", "Typical evidence", "Confidence contribution"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg-surface">
                {[
                  { cls: "exact", radius: "≤ 100 m", evidence: "EXIF, named address, verified landmark", contrib: "Full (20/20)" },
                  { cls: "street", radius: "≤ 500 m", evidence: "Named street, eyewitness landmark", contrib: "High (15/20)" },
                  { cls: "district", radius: "≤ 3 km", evidence: "Named neighbourhood or district", contrib: "Medium (10/20)" },
                  { cls: "city", radius: "City polygon", evidence: "Named settlement only", contrib: "Low (5/20)" },
                  { cls: "region", radius: "Oblast polygon", evidence: "Oblast mentioned only", contrib: "Minimal (2/20)" },
                ].map((row) => (
                  <tr key={row.cls} className="hover:bg-bg-elevated">
                    <td className="px-4 py-3 font-mono text-accent">{row.cls}</td>
                    <td className="px-4 py-3 text-text-primary">{row.radius}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.evidence}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{row.contrib}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5. Verification pipeline ── */}
        <section id="verification" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">
            5. Verification pipeline
          </h2>
          <p className="mt-3">
            After deduplication and geolocation, each candidate event passes through six
            successive verification gates. Failure at any gate blocks publication until the
            issue is resolved.
          </p>
          <ol className="mt-5 space-y-3 list-none pl-0">
            {[
              {
                n: "Step 1",
                label: "Source tier check",
                detail:
                  "The event must have at least one Tier 1 source, or at least two independent Tier 2/3 sources. Independence is verified by checking source ownership, editorial chain, and known copy-paste relationships.",
              },
              {
                n: "Step 2",
                label: "Timestamp plausibility",
                detail:
                  "The reported event timestamp is checked against the source publication time, known source posting patterns, and satellite overpass schedules where applicable. Events with implausible timestamps are flagged for manual review.",
              },
              {
                n: "Step 3",
                label: "Geolocation sanity check",
                detail:
                  "Coordinates are validated against the source's claimed location text. A geocoded result that is more than 50 km from the nearest extracted place name is flagged. Geolocation is independently re-attempted using a second geocoder.",
              },
              {
                n: "Step 4",
                label: "AI classification review",
                detail:
                  "Mistral 7B (self-hosted) reviews the event text and assigned class for consistency. Disagreements between the automated classifier and the AI review trigger a held-out queue for human review.",
              },
              {
                n: "Step 5",
                label: "Confidence threshold gate",
                detail:
                  "Events with a computed confidence score below 35 are not published to the public feed. They remain in a staging store and may be promoted if additional sources attach.",
              },
              {
                n: "Step 6",
                label: "Human review (selective)",
                detail:
                  "All high-severity events (danger score ≥ 70) and all events flagged in Steps 1–5 receive mandatory human review before publication. Low-severity events may be auto-published above confidence 65, but are sampled at 10% for quality audit.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="font-mono text-xs uppercase tracking-widest text-accent">
                  {step.n} — {step.label}
                </div>
                <p className="mt-2 text-sm">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 6. Confidence scoring ── */}
        <section id="confidence" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">6. Confidence scoring</h2>
          <p className="mt-3">
            Each published event carries a confidence score on a{" "}
            <strong className="text-text-primary">0–100</strong> integer scale. The score is
            recomputed whenever a new source attaches to the event.
          </p>

          {/* Formula block */}
          <div className="mt-5 rounded border border-border-subtle bg-bg-elevated px-5 py-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted mb-2">
              Formula
            </p>
            <p className="font-mono text-sm text-text-primary leading-relaxed">
              Confidence = (SQ × 0.40) + (CB × 0.30) + (GEO × 0.20) + (TP × 0.10)
            </p>
            <p className="mt-2 text-xs text-text-muted">
              Each component is normalised to 0–100 before weighting. Final score is rounded to
              the nearest integer and clamped to [0, 100].
            </p>
          </div>

          {/* Weight table */}
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr>
                  {["Component", "Symbol", "Weight", "Description"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg-surface">
                {[
                  {
                    comp: "Source quality",
                    sym: "SQ",
                    weight: "40%",
                    desc: "Weighted mean of contributing source tiers (Tier 1 = 100, Tier 2 = 70, Tier 3 = 40), with diminishing returns for additional same-tier sources.",
                  },
                  {
                    comp: "Corroboration",
                    sym: "CB",
                    weight: "30%",
                    desc: "Number of independent sources corroborating the event, capped at 5 (logarithmic scale). Sources in the same editorial chain do not count as independent.",
                  },
                  {
                    comp: "Geolocation precision",
                    sym: "GEO",
                    weight: "20%",
                    desc: "Accuracy class score: exact 100, street 75, district 50, city 25, region 10.",
                  },
                  {
                    comp: "Temporal proximity",
                    sym: "TP",
                    weight: "10%",
                    desc: "Time between earliest source publication and the event timestamp. Decays from 100 (≤ 30 min) to 0 (> 72 h) following an exponential decay function.",
                  },
                ].map((row) => (
                  <tr key={row.sym} className="hover:bg-bg-elevated">
                    <td className="px-4 py-3 font-medium text-text-primary">{row.comp}</td>
                    <td className="px-4 py-3 font-mono text-accent">{row.sym}</td>
                    <td className="px-4 py-3 font-mono text-text-primary">{row.weight}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm">
            Bands used in the UI:{" "}
            <span className="font-mono text-text-primary">80–100</span> high,{" "}
            <span className="font-mono text-text-primary">50–79</span> medium,{" "}
            <span className="font-mono text-text-primary">0–49</span> low.
          </p>
        </section>

        {/* ── 7. Danger scoring ── */}
        <section id="danger" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">7. Danger scoring</h2>
          <p className="mt-3">
            Danger is a 0–100 estimate of immediate threat to civilians in the vicinity of the
            event at the time of publication. It is{" "}
            <strong className="text-text-primary">independent of confidence</strong>: a
            low-confidence report of a major strike carries a high danger score until disproven.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  {["Factor", "Weight", "Notes"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg-surface">
                {[
                  {
                    factor: "Event class severity",
                    weight: "35%",
                    note: "Baseline per class — missile strike > glide bomb > artillery > small-arms fire > drone sighting.",
                  },
                  {
                    factor: "Population exposure",
                    weight: "25%",
                    note: "Resident population within a class-dependent radius (100 m for precision munitions, 5 km for area fires) from the geolocation centroid.",
                  },
                  {
                    factor: "Recency",
                    weight: "20%",
                    note: "Decays toward zero over a class-specific half-life: 15 min for kinetic events, 6 h for infrastructure damage, 48 h for cyber/electronic.",
                  },
                  {
                    factor: "Critical infrastructure proximity",
                    weight: "15%",
                    note: "Power, water, hospitals, transport hubs, and fuel depots within 2 km of the event centroid. Scored by category weight.",
                  },
                  {
                    factor: "Repeat activity",
                    weight: "5%",
                    note: "Density of corroborated events in the same 10 km cell over the past 24 hours, normalised to the historical baseline for that cell.",
                  },
                ].map((row) => (
                  <tr key={row.factor} className="hover:bg-bg-elevated">
                    <td className="px-4 py-3 text-text-primary">{row.factor}</td>
                    <td className="px-4 py-3 font-mono text-accent">{row.weight}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 8. Human review (HITL) ── */}
        <section id="human-review" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">8. Human review (HITL)</h2>
          <p className="mt-3">
            Human-in-the-loop (HITL) review is a hard requirement for specific event classes.
            Analysts are drawn from a standing team with verified regional expertise.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              {
                label: "Mandatory HITL triggers",
                detail:
                  "Any event with danger score ≥ 70; any event with an attribution claim; any event flagged during automated verification; all events sourced exclusively from Tier 3.",
              },
              {
                label: "Two-reviewer rule",
                detail:
                  'For a Corroborated status to be assigned, two independent analysts must both approve the event. Disagreement triggers a third reviewer or escalation to the editorial lead. This rule is non-negotiable and cannot be overridden by confidence score.',
              },
              {
                label: "Analyst independence",
                detail:
                  "The two reviewers assigned to an event must not share the same primary source region and must not be the same person who ingested the original report. Conflict-of-interest declarations are required for events touching analysts' home regions.",
              },
              {
                label: "Review documentation",
                detail:
                  "Each human review action is logged with the analyst ID (anonymised in external audit exports), timestamp, decision, and optional note. This log is available via the audit history API endpoint.",
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-sm"
              >
                <span className="font-semibold text-text-primary">{item.label}. </span>
                {item.detail}
              </li>
            ))}
          </ul>
        </section>

        {/* ── 9. Retractions ── */}
        <section id="retractions" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">9. Retractions</h2>
          <p className="mt-3">
            When a published event is discovered to be erroneous, we follow a strict retraction
            protocol to ensure full transparency:
          </p>
          <ol className="mt-4 space-y-3 list-none pl-0">
            {[
              {
                n: "9.1",
                label: "Discovery",
                detail:
                  "Errors may be discovered by the internal quality-audit team, by community reports (via corrections@aegislens.io), or by cross-reference with an authoritative Tier 1 source that contradicts the published event.",
              },
              {
                n: "9.2",
                label: "Hold",
                detail:
                  "The event is immediately flagged with a Disputed marker visible to all users and API consumers. No further automated confidence upgrades are applied during review.",
              },
              {
                n: "9.3",
                label: "Investigation",
                detail:
                  "Two analysts independently evaluate the evidence. If both confirm the error, the event is marked Retracted. If only one confirms it, a third analyst is called.",
              },
              {
                n: "9.4",
                label: "Retraction record",
                detail:
                  "The event is marked Retracted with the original content preserved and the correction text appended. A new entry is created in the public corrections log with the original text, the correction, and the source that triggered the change.",
              },
              {
                n: "9.5",
                label: "Source re-evaluation",
                detail:
                  "If the error originated from a specific source, that source's reliability score is updated and its tier assignment is reviewed. Three confirmed errors from a single source trigger automatic downgrade review.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="font-mono text-xs uppercase tracking-widest text-accent">
                  {step.n} — {step.label}
                </div>
                <p className="mt-2 text-sm">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 10. Source tiering ── */}
        <section id="tiering" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">10. Source tiering</h2>
          <p className="mt-3">
            Every source is assigned to one of three tiers. Tier determines the default weight a
            source contributes to corroboration and confidence scoring. Tiering is reviewed
            quarterly and after any major incident of demonstrated inaccuracy.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated text-left">
                  {["Tier", "Examples", "Criteria"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-bg-surface">
                {[
                  {
                    tier: "Tier 1",
                    examples:
                      "Official government statements, military spokespeople, accredited wire services (Reuters, AP, AFP), national emergency services.",
                    criteria:
                      "Verifiable institutional identity, public accountability, editorial standards, historical correction record.",
                  },
                  {
                    tier: "Tier 2",
                    examples:
                      "Established national and regional outlets, recognised OSINT collectives, long-running monitor accounts with verified track records.",
                    criteria:
                      "Stable byline or organisational presence, demonstrable methodology, prior corroboration rate above 0.7 against Tier 1.",
                  },
                  {
                    tier: "Tier 3",
                    examples:
                      "Eyewitness social posts, local Telegram channels, anonymous accounts, raw sensor feeds.",
                    criteria:
                      "Useful as leading signals; never sufficient alone for publication of a high-severity event.",
                  },
                ].map((row) => (
                  <tr key={row.tier} className="hover:bg-bg-elevated align-top">
                    <td className="px-4 py-3 font-mono text-accent">{row.tier}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.examples}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.criteria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. Limitations ── */}
        <section id="limitations" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">11. Limitations</h2>
          <p className="mt-3">
            Transparency requires honest acknowledgement of what we do not do and where gaps
            exist. The following are known limitations of the current system:
          </p>
          <ul className="mt-4 space-y-3">
            {[
              {
                label: "No ground truth access",
                detail:
                  "We work entirely with open-source material. We cannot verify events that are not reported by any accessible source, and we cannot correct geolocations that have no imagery or landmark reference.",
              },
              {
                label: "Language coverage gap",
                detail:
                  "NER and semantic models perform best in Ukrainian, Russian, and English. Coverage in Polish, Romanian, and other regional languages is partial and may result in higher duplicate rates or missed entity extractions.",
              },
              {
                label: "Near-real-time lag",
                detail:
                  "Verification gates introduce latency. High-severity events may take 15–45 minutes from first source publication to appear on the public map. We prioritise accuracy over speed.",
              },
              {
                label: "Tier 1 source bias",
                detail:
                  "Official sources are given higher trust by design. This means events that authorities decline to confirm may be suppressed relative to ground truth. We partially mitigate this through weighted Tier 3 corroboration.",
              },
              {
                label: "No predictive capability",
                detail:
                  "Aegis Lens is a historical and near-real-time record. We do not predict future events, trajectories, or outcomes. Danger scores reflect conditions at time of publication, not future risk.",
              },
              {
                label: "Imagery geolocation uncertainty",
                detail:
                  "Visual geolocation depends on identifiable landmarks. Events in featureless terrain, at night, or with heavily obscured imagery may receive only a district- or city-level geolocation class despite having associated photographs.",
              },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-sm"
              >
                <span className="font-semibold text-text-primary">{item.label}. </span>
                <span className="text-text-secondary">{item.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Corrections and audit ── */}
        <section id="audit" className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Corrections and audit</h2>
          <p className="mt-3">
            Every event retains the full list of contributing source URLs, the timestamp of first
            ingestion, and the timestamp of last recomputation. Retractions and source
            downgrades trigger a recomputation pass; affected events display a correction marker
            and the previous values remain accessible through the audit history endpoint. All
            publicly documented corrections appear in the{" "}
            <a
              href={localePath(locale, "/trust/corrections")}
              className="text-accent underline-offset-2 hover:underline"
            >
              corrections log
            </a>
            .
          </p>
        </section>
      </article>
    </>
  );
}
