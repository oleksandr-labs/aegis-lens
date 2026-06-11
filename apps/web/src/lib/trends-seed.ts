export type Trend = {
  slug: string;
  title: string;
  /** Short hook for index cards. */
  description: string;
  /** 1-line eyebrow time horizon ("Q2 2026", "winter 2025–26"). */
  horizon: string;
  tags: string[];
  /** Daily/weekly count series for the sparkline (most recent at end). */
  series: number[];
  /** ISO date the trend was first published. */
  publishedAt: string;
  /** ISO date the underlying data was last recomputed. */
  updatedAt: string;
  /** Pinned to the editorial-featured strip on the trends index. */
  featured?: boolean;
  /** Linked topic-class slug (drives /topics cross-link + RSS). */
  topicClass?: string;
  /** Linked threat slugs. */
  relatedThreatSlugs?: string[];
  /** Linked investigation slugs. */
  relatedInvestigationSlugs?: string[];
  /** Cited event IDs. */
  citedEventIds?: string[];
  /** ISO-2 country slugs most affected. */
  affectedCountries: string[];
  /** Body — 3-5 short prose sections. */
  sections: { heading: string; body: string }[];
  /** FAQ pairs. */
  faqs: { q: string; a: string }[];
  /**
   * Analyst commentary — short prose with strict citation discipline.
   * Each sentence ideally references either a citedEventId or a previous
   * publication. Rendered as a quote-styled block on the trend detail.
   */
  analystCommentary?: {
    analyst: string;
    /** ISO date the commentary was written. */
    writtenAt: string;
    /** 1–3 short paragraphs. */
    paragraphs: string[];
  };
};

export const TRENDS: Trend[] = [
  {
    slug: "drone-swarm-activity-q2-2026",
    featured: true,
    title: "Drone swarm activity, Q2 2026",
    description:
      "Concurrent one-way attack drone launches per night have climbed sharply since March. Average pack size now exceeds 30 vehicles, with multi-axis ingress becoming the norm.",
    horizon: "Q2 2026",
    tags: ["UAV", "swarm", "strike-tempo"],
    series: [14, 18, 17, 22, 21, 26, 31, 29, 34, 38, 41, 44],
    publishedAt: "2026-04-12",
    updatedAt: "2026-05-22",
    topicClass: "military_action",
    relatedThreatSlugs: ["shahed-strikes"],
    relatedInvestigationSlugs: ["shahed-launch-site-network", "iran-russia-drone-supply-chain"],
    affectedCountries: ["ua"],
    citedEventIds: ["01HXKHARKIVDRONE001", "01HXSUMYDRONE001"],
    sections: [
      {
        heading: "Headline shift",
        body: "Between March and May 2026, average nightly Shahed-class launches more than doubled. Multi-axis ingress (≥3 simultaneous arrival vectors) is now observed on roughly 70% of nights with active raids.",
      },
      {
        heading: "What changed",
        body: "Two factors are doing most of the work: launch geography diversified westward, and salvo composition now mixes decoys and live munitions at ratios calibrated against the previous month's intercept rate.",
      },
      {
        heading: "Implications",
        body: "Per-engagement air-defense costs are climbing while intercept rates hold steady — a strain point that won't be visible in headline percentages.",
      },
    ],
    faqs: [
      {
        q: "Is the trend purely Iranian-supplied airframes?",
        a: "No. The Geran-2 (Russian-built Shahed variant) is now a larger share than imports. Production-line markings on recovered airframes corroborate this shift.",
      },
      {
        q: "Why does the series keep climbing?",
        a: "Adversary doctrine treats salvo size as the lever; defenders treat per-engagement cost as theirs. The asymmetry favors larger salvos until air defense composition changes.",
      },
    ],
    analystCommentary: {
      analyst: "S. Hrytsenko",
      writtenAt: "2026-05-20",
      paragraphs: [
        "The most underappreciated number in this series is not the salvo count but the *cost-asymmetry* curve [01HXKHARKIVDRONE001, 01HXSUMYDRONE001]. Air-defense allocation per intercepted drone has not fallen in proportion to launch volume — meaning the defender's per-attack cost is climbing faster than the attacker's. That's the variable to watch into Q3.",
        "Our investigation [shahed-launch-site-network] argued that five launch areas account for ~80% of sorties. If that distribution holds, targeted disruption of even one area would compress the curve meaningfully. If it doesn't, expect the series to keep climbing along its current slope.",
      ],
    },
  },
  {
    slug: "substation-targeting-frequency",
    featured: true,
    title: "Substation targeting frequency",
    description:
      "High-voltage substations are being struck at roughly twice the rate of the previous winter campaign. Repair lead times and transformer inventories are visibly stressed.",
    horizon: "Winter 2025–26",
    tags: ["energy", "infrastructure", "grid"],
    series: [6, 5, 8, 7, 9, 11, 10, 13, 15, 14, 17, 19],
    publishedAt: "2026-01-30",
    updatedAt: "2026-05-18",
    topicClass: "infrastructure",
    relatedThreatSlugs: ["energy-grid-attacks", "long-range-missile-strikes"],
    affectedCountries: ["ua"],
    citedEventIds: ["01HXKHERSONINFRA001", "01HXMYKINFRA001"],
    sections: [
      {
        heading: "Strike rate",
        body: "Confirmed strikes against high-voltage substations are running at roughly double the 2024–25 winter pace. The most-hit class is 330 kV switching nodes.",
      },
      {
        heading: "Repair throughput",
        body: "Repair completion rates have not kept pace. Transformer inventories at the operator level are the binding constraint, not workforce.",
      },
      {
        heading: "Cascading effects",
        body: "When a single 330 kV node goes down, load-shed events can ripple across 2–4 oblasts within 90 minutes depending on grid topology and demand.",
      },
    ],
    faqs: [
      {
        q: "Is this driven by drones or missiles?",
        a: "Both. Drone saturation forces air-defense allocation; missiles arrive in the resulting gap. The combined-strike pattern is the operational innovation, not either weapon alone.",
      },
    ],
    analystCommentary: {
      analyst: "I. Bondar",
      writtenAt: "2026-05-18",
      paragraphs: [
        "The repair-throughput constraint [01HXKHERSONINFRA001, 01HXMYKINFRA001] is the metric that matters more than the strike count. Two oblasts can absorb a similar number of substation hits and present very different civilian outcomes depending on transformer-inventory depth.",
        "Cross-border restoration agreements paid off where pre-coordinated; absent pre-coordination, recovery times stretched well beyond the underlying technical work. That's an organisational variable, not a kinetic one.",
      ],
    },
  },
  {
    slug: "maritime-ais-spoofing-incidents",
    title: "Maritime AIS spoofing incidents",
    description:
      "Reports of falsified vessel identifiers in the Black Sea and eastern Mediterranean have roughly tripled year-on-year. Most clusters correlate with sanctioned tanker movements.",
    horizon: "12-month rolling",
    tags: ["maritime", "AIS", "sanctions-evasion"],
    series: [3, 4, 4, 6, 7, 6, 9, 11, 10, 13, 15, 16],
    publishedAt: "2026-03-04",
    updatedAt: "2026-05-15",
    topicClass: "maritime",
    relatedThreatSlugs: ["ais-spoofing"],
    relatedInvestigationSlugs: ["black-sea-magura-usv-operations"],
    affectedCountries: ["ua"],
    sections: [
      {
        heading: "Observed pattern",
        body: "AIS-identifier falsification clusters are concentrated around two corridors: the Kerch Strait approach and the eastern Mediterranean transshipment band south of Cyprus.",
      },
      {
        heading: "Why now",
        body: "Sanctions enforcement increased the cost of dark-fleet operation; spoofed identities are the cheapest available evasion. The technique is not new — the *volume* is.",
      },
    ],
    faqs: [
      {
        q: "How is spoofing detected?",
        a: "Cross-referencing AIS with overhead SAR + RF geolocation. Either alone is unreliable; the combination is the workable detection stack.",
      },
    ],
    analystCommentary: {
      analyst: "T. Marchenko",
      writtenAt: "2026-05-15",
      paragraphs: [
        "The trend is structural, not cyclic. AIS is unauthenticated by design [black-sea-magura-usv-operations references the broader maritime detection stack], so detection cost falls entirely on consumers of the feed. Detection budgets that depend solely on AIS will keep missing.",
        "Where investment in commercial-SAR cadence over the western Black Sea has materially improved attribution, the spoofing rate hasn't dropped — it has *displaced* to corridors with thinner overhead coverage. That's worth tracking explicitly.",
      ],
    },
  },
  {
    slug: "cyber-tempo-around-elections",
    title: "Cyber tempo around elections",
    description:
      "Phishing and credential-theft campaigns aimed at electoral infrastructure tick up in the eight weeks before scheduled votes. Volume currently outpaces the 2024 baseline.",
    horizon: "Rolling, election-relative",
    tags: ["cyber", "elections", "influence"],
    series: [5, 6, 5, 7, 9, 12, 15, 18, 22, 27, 31, 33],
    publishedAt: "2026-02-21",
    updatedAt: "2026-05-10",
    topicClass: "cyber",
    relatedThreatSlugs: ["civilian-cyber-attacks", "synthetic-media-disinformation"],
    affectedCountries: ["ua", "pl", "de"],
    sections: [
      {
        heading: "Eight-week window",
        body: "The reliable signal is the eight-week pre-vote ramp. Volume during this window has run 30–60% above same-period baselines for the past three election cycles tracked.",
      },
      {
        heading: "Composition",
        body: "Phishing dominates, but credential-stuffing and supply-chain compromise are now meaningful tails. Synthetic-media disinformation appears as a complementary track, not a substitute.",
      },
    ],
    faqs: [
      {
        q: "Does this apply equally to all countries?",
        a: "No. Magnitudes differ; the shape (eight-week ramp + composition mix) is consistent enough to use as a planning anchor.",
      },
    ],
    analystCommentary: {
      analyst: "K. Lysenko",
      writtenAt: "2026-05-10",
      paragraphs: [
        "The eight-week ramp is the planning anchor that survives jurisdiction differences. It held across three cycles tracked; it would be surprising if it broke for the next.",
        "Synthetic-media disinformation [synthetic-media-disinformation] now appears as a complementary track to credential-theft campaigns rather than a substitute. Treat the two as separate streams when budgeting analyst time.",
      ],
    },
  },
  {
    slug: "ew-countermeasure-proliferation",
    title: "EW countermeasure proliferation",
    description:
      "Front-line units on both sides report rapid iteration of electronic-warfare jamming and counter-drone systems. Vendor diversity is widening and effective ranges are growing.",
    horizon: "Rolling 12-month",
    tags: ["EW", "counter-UAS", "innovation"],
    series: [8, 9, 11, 10, 12, 14, 13, 16, 18, 17, 20, 23],
    publishedAt: "2026-02-08",
    updatedAt: "2026-05-12",
    topicClass: "military_action",
    relatedThreatSlugs: ["shahed-strikes", "civil-aviation-spillover"],
    affectedCountries: ["ua"],
    sections: [
      {
        heading: "Vendor diversity",
        body: "Ukrainian-supplied counter-UAS jammers (Kvertus, Bukovel, Anvis) now coexist with NATO-supplied systems. Iteration cadence is measured in months, not years.",
      },
      {
        heading: "Effect on civil aviation",
        body: "GPS jamming and spoofing in the eastern-EU border zone are now structural background. Carriers in the band have adapted; the public-disclosure picture lags.",
      },
    ],
    faqs: [
      {
        q: "Is the EW count the right measure?",
        a: "It's the available measure. Effectiveness is harder to track open-source. Use it as a proxy for activity, not for outcome.",
      },
    ],
    analystCommentary: {
      analyst: "M. Korol",
      writtenAt: "2026-05-12",
      paragraphs: [
        "Vendor diversity is the leading indicator we'd watch into Q3 — not the EW count itself. Iteration cadence over 12 months has been measured in months, not years; the platforms that survive past three iterations are the ones to track.",
        "Civil-aviation spillover [civil-aviation-spillover] is no longer an edge-case; treat it as structural background and budget operations accordingly.",
      ],
    },
  },
];

export function listTrends(): Trend[] {
  return TRENDS.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTrend(slug: string): Trend | null {
  return TRENDS.find((t) => t.slug === slug) ?? null;
}
