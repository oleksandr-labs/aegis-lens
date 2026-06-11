export type MethodologyTopic = {
  slug: string;
  title: string;
  /** Eyebrow / short qualifier. */
  eyebrow: string;
  oneLiner: string;
  /** Long-form body sections. */
  sections: { heading: string; body: string }[];
  /** Cross-links to other Aegis surfaces. */
  seeAlso: { label: string; href: string }[];
  tags: string[];
  /** Honest limitations of the current approach — what it doesn't and can't do. */
  limitations: string[];
  /** Version history — each entry is "vN — YYYY-MM-DD — what changed". */
  versionHistory: { version: string; date: string; change: string }[];
};

export const METHODOLOGY_TOPICS: MethodologyTopic[] = [
  {
    slug: "source-tiering",
    title: "Source tiering",
    eyebrow: "How we rank where information comes from",
    oneLiner:
      "Aegis Lens classifies every source into Tier 1 / Tier 2 / Tier 3 by independence, accountability, and historical accuracy.",
    sections: [
      {
        heading: "Tier 1 — primary, accountable",
        body: "Official organizations publishing under their own name with editorial process and legal accountability. Government statements, official military releases, wire-service reporting with bylines. Heavy weight on confidence computation.",
      },
      {
        heading: "Tier 2 — reputable, semi-accountable",
        body: "Established outlets and named analysts with verifiable track record but lighter editorial oversight. Independent journalism with multi-year history of corroborated work. Moderate weight; rises with consistent accuracy.",
      },
      {
        heading: "Tier 3 — social and amplifier",
        body: "Pseudonymous channels, social-media accounts, aggregators that re-share without original reporting. Lowest default weight; can be promoted by sustained accurate history. Always treated as a lead until corroborated.",
      },
      {
        heading: "How tiers map to confidence",
        body: "Confidence is not a tier sum — it's a function over tier-weighted independent sources, corroboration window, and verification state. See /scoring/confidence.",
      },
    ],
    seeAlso: [
      { label: "Reliability score", href: "/scoring/reliability" },
      { label: "Confidence score", href: "/scoring/confidence" },
      { label: "Sources directory", href: "/sources" },
    ],
    tags: ["sources", "methodology", "tiering"],
    limitations: [
      "Tier assignment is editorial. We rate sources on independence + accountability + history; we do not certify factual accuracy on every claim.",
      "Reliability score moves slowly. A new source starts at 0.50 and needs published claims to converge — it is not a substitute for human judgement on first encounter.",
      "Coverage gaps in low-resource languages remain: under-represented languages have thinner source benches and therefore wider confidence intervals.",
    ],
    versionHistory: [
      {
        version: "v1.0",
        date: "2025-09-01",
        change: "Initial three-tier model published. Tier weights frozen for the first quarter to gather calibration data.",
      },
      {
        version: "v1.1",
        date: "2026-01-20",
        change: "Adjusted Tier 3 weighting after the 2025–26 winter campaign — pseudonymous-account weight reduced; consistent-accuracy-history reward increased.",
      },
    ],
  },
  {
    slug: "verification",
    title: "Verification workflow",
    eyebrow: "The seven checks every claim passes",
    oneLiner:
      "Provenance, timing, location, content, attribution, language, and corroboration — the seven independent checks Aegis Lens runs before a claim becomes a published event.",
    sections: [
      {
        heading: "Provenance",
        body: "Who posted it first? Reposts and aggregator surfaces don't count as the source. Tracing provenance is the cheapest discriminator between a real signal and noise.",
      },
      {
        heading: "Timing",
        body: "EXIF is a hint, not a fact. Shadow azimuth, weather conditions, background broadcast timing, platform-level upload timestamps — combined, they narrow to a workable window.",
      },
      {
        heading: "Location",
        body: "Geolocate before believing any caption. Anchor objects + street-level imagery + satellite cross-reference. We treat self-declared location as untested until independently confirmed.",
      },
      {
        heading: "Content integrity",
        body: "Reverse image search, prior-appearance check, re-encoding artifact detection. Synthetic-media detection is improving but not yet decisive — we lean on behavioral signals (cross-channel confirmation) over forensics during fast-moving events.",
      },
      {
        heading: "Attribution",
        body: "Who did this, with what confidence? We separate the *observed* event from the *attributed* actor. Confidence on the act can be high while attribution is still 'unattributed' or 'low'.",
      },
      {
        heading: "Language",
        body: "Cross-language sources are weighted independently; same-language reposts collapse into one. This avoids inflating corroboration just because a story was translated.",
      },
      {
        heading: "Corroboration",
        body: "Two independent sources is evidence. Three is a finding. We publish below three on lower-confidence labels and revise upward as more comes in.",
      },
    ],
    seeAlso: [
      { label: "Confidence score", href: "/scoring/confidence" },
      { label: "Verifying social-media footage", href: "/guides/verifying-social-media-footage" },
      { label: "Methodology hub", href: "/methodology" },
    ],
    tags: ["verification", "methodology", "corroboration"],
    limitations: [
      "Synthetic-media detection is improving but not decisive. We currently lean on behavioural signals (cross-channel confirmation) over forensic detection during fast-moving events.",
      "Provenance tracing fails when the earliest verifiable upload is itself a re-share; we mark such events at lower confidence rather than guess at the true origin.",
      "The seven-check workflow is run by humans. Throughput is constrained by analyst availability, not technology.",
    ],
    versionHistory: [
      {
        version: "v1.0",
        date: "2025-09-01",
        change: "Original five-check workflow published.",
      },
      {
        version: "v2.0",
        date: "2026-02-12",
        change: "Expanded to seven checks — added Attribution and Language checks after audit by a partner outlet revealed under-weighting of both.",
      },
    ],
  },
  {
    slug: "geolocation",
    title: "Geolocation precision",
    eyebrow: "How we record where an event happened",
    oneLiner:
      "Every event carries lat/lon and a precision-in-meters field. The precision is honest — we publish it even when it's coarse.",
    sections: [
      {
        heading: "Precision classes",
        body: "Aegis Lens records geolocation precision as a meters-radius circle, not a categorical label. 'precisionM: 500' means 'within 500 m'. We don't round to a fictitious lat/lon resolution.",
      },
      {
        heading: "What drives precision",
        body: "Best case: a single overhead image with visible anchor objects + street-level cross-check yields ~50 m. Typical case: oblast-level claim corroborated by directional reporting yields a city-centroid placement with a multi-km circle.",
      },
      {
        heading: "When we don't publish a location",
        body: "If the best available geo-information is country-level only, we don't fabricate finer placement. The event still publishes; the map placement may be omitted or shown as a country centroid with a large circle.",
      },
    ],
    seeAlso: [
      { label: "Geolocating a photograph (guide)", href: "/guides/geolocating-a-photograph" },
      { label: "Reading satellite imagery (guide)", href: "/guides/reading-satellite-imagery" },
      { label: "Map", href: "/map" },
    ],
    tags: ["geolocation", "geospatial", "precision"],
    limitations: [
      "We publish precision honestly. When the best available signal is country-level only, we don't fabricate finer placement — the map may show a country centroid with a wide circle.",
      "Geolocation is human-driven for now. ML-assisted suggestions exist internally but every published geolocation is reviewed by an analyst.",
      "Night-time / cloud-obscured imagery is a structural blind spot. SAR helps; consumer-grade optical doesn't.",
    ],
    versionHistory: [
      {
        version: "v1.0",
        date: "2025-09-15",
        change: "Initial precision-in-meters field replacing the old categorical accuracy bucket.",
      },
      {
        version: "v1.1",
        date: "2026-04-10",
        change: "Documented non-publication cases (country-only signal). Reviewed against an external audit of 200 events.",
      },
    ],
  },
  {
    slug: "scoring",
    title: "Scoring overview",
    eyebrow: "The four numbers attached to every event",
    oneLiner:
      "Every Aegis Lens event surfaces four calibrated scores: confidence, danger, anomaly, reliability. Each has its own explainer page and reproducible formula.",
    sections: [
      {
        heading: "Why four scores",
        body: "Confidence answers 'how sure are we?'. Danger answers 'how bad is this?'. Anomaly answers 'is this unusual?'. Reliability is the per-source prior that feeds confidence. Different questions, different math, all published.",
      },
      {
        heading: "Calibration philosophy",
        body: "Scores are calibrated against past observed outcomes, not per-incident analyst guesses. A danger of 75 means events scored at that level have historically required civilian shelter response.",
      },
      {
        heading: "Auditability",
        body: "Inputs to every score are listed on the respective explainer page. The OpenAPI spec exposes the raw fields. Reproducibility of derived scores from raw fields is part of what we publish.",
      },
    ],
    seeAlso: [
      { label: "Confidence score", href: "/scoring/confidence" },
      { label: "Danger score", href: "/scoring/danger" },
      { label: "Anomaly score", href: "/scoring/anomaly" },
      { label: "Reliability score", href: "/scoring/reliability" },
    ],
    tags: ["scoring", "methodology", "calibration"],
    limitations: [
      "Calibration windows are rolling. Scores derived in periods of unusual event composition (e.g. a sustained mass-casualty wave) will lag for a few cycles until the calibration set catches up.",
      "Danger combines disparate signals. A `danger: 75` event in winter and one in summer are calibrated against different baseline cohorts; cross-season comparisons need explicit care.",
      "We do not score individual humans. Confidence / danger / anomaly / reliability apply to events and sources, never to named persons.",
    ],
    versionHistory: [
      {
        version: "v1.0",
        date: "2025-09-01",
        change: "Initial four-score model: confidence, danger, anomaly, reliability.",
      },
      {
        version: "v1.1",
        date: "2026-01-05",
        change: "Confidence recomputation cadence reduced from 1h to 15min; latency notes added to docs.",
      },
      {
        version: "v1.2",
        date: "2026-05-12",
        change: "Danger model recalibrated against full winter-campaign outcome data. Score distributions otherwise unchanged.",
      },
    ],
  },
  {
    slug: "ethics",
    title: "Editorial ethics",
    eyebrow: "What we will and won't publish",
    oneLiner:
      "Open-source intelligence carries real ethical weight. Aegis Lens publishes facts, suppresses identifying details where they harm civilians, and treats sources as accountable adults.",
    sections: [
      {
        heading: "Civilian safety first",
        body: "We do not publish granular live-location data on individual civilians, refugees, or non-combatants. Aggregate event data near civilian areas is published; identifying details are not.",
      },
      {
        heading: "Attribution discipline",
        body: "We name organisations and named units. We do not name individual rank-and-file unless they have publicly identified themselves and the context is clearly material to the finding.",
      },
      {
        heading: "Corrections culture",
        body: "We publish corrections at /trust/corrections with original-vs-corrected diffs. Retraction is a normal editorial event, not a reputation crisis to be hidden.",
      },
      {
        heading: "Adversarial use",
        body: "Aegis Lens output is publicly available and we accept that means adversaries can read it too. We don't gate event timing; we do publish aggregate signal before granular geolocation when civilians could be harmed by the inverse.",
      },
    ],
    seeAlso: [
      { label: "Corrections log", href: "/trust/corrections" },
      { label: "Data policy", href: "/trust/data-policy" },
      { label: "Transparency", href: "/trust/transparency" },
    ],
    tags: ["ethics", "methodology", "editorial"],
    limitations: [
      "Ethics is editorial. Reasonable analysts disagree on edge cases — the policy below is what Aegis Lens enforces, not a universal claim.",
      "Adversarial use is real and we accept that the data is publicly readable. We don't gate timing; we do suppress identifying civilian details where their release would do harm.",
      "Speed and ethics trade off in fast-moving events. Where they conflict, we choose the slower-but-rights-respecting path.",
    ],
    versionHistory: [
      {
        version: "v1.0",
        date: "2025-09-01",
        change: "Initial editorial-ethics policy published.",
      },
      {
        version: "v1.1",
        date: "2026-03-22",
        change: "Added explicit civilian-safety section after community feedback on a granular-location finding.",
      },
    ],
  },
];

export function listMethodologyTopics(): MethodologyTopic[] {
  return METHODOLOGY_TOPICS.slice();
}

export function getMethodologyTopic(slug: string): MethodologyTopic | null {
  return METHODOLOGY_TOPICS.find((t) => t.slug === slug) ?? null;
}
