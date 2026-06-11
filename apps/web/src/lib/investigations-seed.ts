import type { Locale } from "@aegis/i18n-config";

export type InvestigationSection = {
  heading: string;
  body: string;
};

export type Investigation = {
  slug: string;
  title: string;
  date: string;
  analyst: string;
  /** Central research question this investigation answers. */
  question?: string;
  summary: string;
  tags: string[];
  /** Plain-English findings — 1-2 sentences each. */
  findings: string[];
  /** Known limitations, gaps, or disputes the investigation cannot resolve. */
  caveats?: string[];
  /** Named contributors beyond the lead analyst. */
  contributors?: string[];
  /** DataCite DOI assigned when formally published. Format: 10.XXXX/aegis.YYYY. */
  doi?: string;
  /** Sources cited (label + URL or domain). */
  sources: { label: string; url: string }[];
  /** Linked event IDs from the events seed (where applicable). */
  citedEventIds?: string[];
  /** Linked oblast slugs (admin-1). */
  citedOblastSlugs?: string[];
  sections: InvestigationSection[];
};

export const INVESTIGATIONS: Investigation[] = [
  {
    slug: "iran-russia-drone-supply-chain",
    title: "Iran–Russia drone supply chain",
    date: "2026-04-18",
    analyst: "M. Korol",
    doi: "10.57967/aegis.2026.0001",
    question:
      "Which corporate and logistical structures move Iranian UAV components to Russian assembly lines, and which nodes are most vulnerable to secondary sanctions?",
    summary:
      "Traces component flows, shipping manifests, and front-company structures behind Shahed-family UAV deliveries used in long-range strikes against Ukrainian infrastructure.",
    tags: ["UAV", "sanctions", "supply-chain", "Iran", "Russia"],
    citedEventIds: ["01HXKHARKIVDRONE001", "01HXSUMYDRONE001"],
    findings: [
      "At least 14 front companies registered in the UAE and Hong Kong acted as intermediaries for engine and microcontroller shipments between Q3 2024 and Q1 2026.",
      "Engine variants observed on recovered airframes match production-line markings from a single Iranian facility, suggesting consolidated manufacturing rather than distributed sourcing.",
      "Component-level sanctions evasion relies on three commodity codes (HS 8407, HS 8542, HS 8526) that remain under-enforced at intermediate transshipment points.",
    ],
    caveats: [
      "Bill-of-lading data is self-reported by shippers; deliberate mislabelling cannot be ruled out.",
      "The investigation covers Q3 2024 – Q1 2026; more recent supply-chain changes may not be reflected.",
      "Director-overlap evidence is drawn from public corporate registries; nominee structures may conceal ultimate beneficial owners.",
    ],
    contributors: ["S. Marchenko (sanctions law review)", "T. Adeyemi (trade-data analysis)"],
    sources: [
      { label: "Conflict Armament Research field reports", url: "https://www.conflictarm.com" },
      { label: "RUSI Open-Source Intelligence Programme", url: "https://www.rusi.org" },
      { label: "Bellingcat — drone component teardowns", url: "https://www.bellingcat.com" },
    ],
    sections: [
      {
        heading: "Methodology",
        body: "Cross-references publicly available bill-of-lading data from three commercial trade platforms with airframe recovery photos published by Ukrainian armed forces. Engine serial-prefix correlations corroborate single-source manufacturing.",
      },
      {
        heading: "Front-company structure",
        body: "Of 14 identified intermediaries, 9 were incorporated within an 11-month window in 2024 and share at least one common director across the cohort. Address overlap clusters around two business-services providers in the UAE.",
      },
      {
        heading: "Implications",
        body: "Targeted secondary sanctions against the two clusters of business-services providers would, on the evidence, disrupt the dominant transshipment pathway. Component-code enforcement at the three identified HS codes is a parallel intervention.",
      },
    ],
  },
  {
    slug: "crimea-bridge-infrastructure",
    title: "Crimea bridge infrastructure",
    date: "2026-03-29",
    analyst: "I. Bondar",
    question:
      "What is the current operational capacity of the Kerch Strait bridge for road and rail, and how quickly can Russia restore full pre-strike throughput?",
    summary:
      "Structural assessment of the Kerch Strait crossing combining satellite imagery, repair logistics, and Russian-language engineering disclosures since the 2022 strike.",
    tags: ["infrastructure", "imagery", "Crimea", "logistics"],
    caveats: [
      "Russian engineering disclosures are state-sourced and may overstate repair progress.",
      "Actual rail tonnage figures are not publicly confirmed; ferry AIS data serves as a proxy that may undercount unlisted vessels.",
    ],
    contributors: ["V. Lysenko (structural engineering review)"],
    findings: [
      "Roadway-deck repairs completed faster than rail-deck repairs in every observed cycle, indicating a structural prioritization of road throughput over rail.",
      "Ferry-replacement capacity for rail tonnage is constrained to ≤40% of pre-strike volume even at peak ferry utilization.",
      "Engineering disclosures suggest a planned third-lane reinforcement program that would harden the road deck against a repeat of the October 2022 incident.",
    ],
    sources: [
      { label: "Maxar / Planet imagery — public archive", url: "https://www.planet.com" },
      { label: "Russian Federation Marine Engineering Bureau press releases", url: "https://www.mib.spb.ru" },
      { label: "Institute for the Study of War — Crimea logistics", url: "https://www.understandingwar.org" },
    ],
    citedOblastSlugs: ["crimea"],
    sections: [
      {
        heading: "Imagery review",
        body: "Twenty-three high-resolution passes between October 2022 and March 2026 were classified for visible repair activity, scaffolding extent, and traffic recovery indicators. Repair cycles are inferred from scaffold-removal events.",
      },
      {
        heading: "Logistics modeling",
        body: "Rail tonnage estimates use a published 2021 baseline cross-referenced with Russian-side ferry-port AIS activity. Even at peak ferry deployment (8 simultaneous vessels), throughput plateaus well below pre-strike rail capacity.",
      },
    ],
  },
  {
    slug: "black-sea-magura-usv-operations",
    title: "Black Sea Magura USV operations",
    date: "2026-03-12",
    analyst: "T. Marchenko",
    question:
      "How have Ukrainian unmanned surface vessel sorties evolved in launch geography, payload, and attribution confidence since operations began?",
    summary:
      "Open-source reconstruction of unmanned surface vessel sorties against Russian naval assets, including launch geography, payload evolution, and attribution patterns.",
    tags: ["USV", "naval", "Black Sea", "OSINT"],
    caveats: [
      "Launch point clusters are inferred from sortie geometry; direct observation of launch events is not available from open sources.",
      "Gen-3 payload mass is estimated from waterline photography; access to recovered units has not been publicly confirmed.",
    ],
    contributors: ["P. Oleksiienko (maritime OSINT)", "K. Hassan (AIS data analysis)"],
    findings: [
      "Launch geometry has shifted progressively westward since mid-2024, expanding the operational envelope to the western Black Sea coast.",
      "Payload mass per sortie has roughly doubled across three platform generations while platform displacement has stayed within a narrow band.",
      "Attribution patterns combining MoD statements, recovered debris, and Telegram channel admissions produce a high-confidence attribution in ~70% of catalogued strikes.",
    ],
    sources: [
      { label: "Naval News — Black Sea coverage", url: "https://www.navalnews.com" },
      { label: "Ukrainian GUR public briefings", url: "https://gur.gov.ua" },
      { label: "H I Sutton — Covert Shores", url: "http://www.hisutton.com" },
    ],
    citedOblastSlugs: ["odesa-oblast"],
    sections: [
      {
        heading: "Platform generations",
        body: "Three generations are distinguishable by silhouette, payload mass, and sensor mast configuration. Gen-3 introduces a forward-looking IR sensor and improved seakeeping in sea state ≥4.",
      },
      {
        heading: "Operational geography",
        body: "Plotted launch points cluster initially east of the Dnipro mouth and later expand to multiple inferred launch areas along the western coast. Sortie radius implies range envelopes well in excess of early published estimates.",
      },
    ],
  },
  {
    slug: "wagner-group-africa-expansion",
    title: "Wagner Group Africa expansion",
    date: "2026-02-20",
    analyst: "K. Lysenko",
    summary:
      "Maps deployment footprints, mining concessions, and host-state contracts across Mali, Burkina Faso, and the Central African Republic after the 2023 leadership transition.",
    tags: ["Wagner", "Africa", "PMC", "influence"],
    findings: [
      "Post-2023 deployments are now consolidated under a successor brand structure but operational personnel show ≥60% continuity with pre-2023 footprints.",
      "Mining concessions track deployment locations with a lag of 6–18 months in every observed case.",
      "Host-state contracts published since 2024 standardize a fee structure that combines a fixed retainer with revenue-share over concession proceeds.",
    ],
    sources: [
      { label: "ACLED — Wagner / Africa Corps tracker", url: "https://acleddata.com" },
      { label: "All Eyes on Wagner project", url: "https://alleyesonwagner.org" },
      { label: "Center for Strategic and International Studies — Russia / Africa", url: "https://www.csis.org" },
    ],
    sections: [
      {
        heading: "Brand continuity",
        body: "Personnel lists reconstructed from leaked rosters, host-state press conferences, and social-media analysis show that the rebrand left field command structures substantially intact.",
      },
      {
        heading: "Concession overlay",
        body: "Geospatial overlay of deployment polygons against awarded extractive concessions reveals a strong spatial association, particularly for gold and uranium.",
      },
    ],
  },
  {
    slug: "mariupol-theatre-strike-accountability",
    title: "Mariupol theatre strike accountability",
    date: "2026-01-30",
    analyst: "O. Pavlenko",
    summary:
      "Four-year retrospective combining witness testimony, geolocated imagery, and intercepted communications to assess command responsibility for the March 2022 strike.",
    tags: ["accountability", "war-crimes", "Mariupol", "imagery"],
    citedEventIds: ["01HXDONETSKMIL001"],
    findings: [
      "Twelve corroborating witness statements place the strike within a 30-minute window consistent with the originally reported timing.",
      "Pattern-of-damage analysis is consistent with an air-delivered munition rather than artillery, narrowing the inventory of responsible units.",
      "Intercepted communications referenced in the public record place a candidate command chain in the operational area at the time of the strike.",
    ],
    sources: [
      { label: "Amnesty International — Mariupol report", url: "https://www.amnesty.org" },
      { label: "Associated Press investigation", url: "https://apnews.com" },
      { label: "Truth Hounds documentation", url: "https://truth-hounds.org" },
    ],
    citedOblastSlugs: ["donetsk-oblast"],
    sections: [
      {
        heading: "Witness corroboration",
        body: "Statements collected by three independent organizations were cross-checked for internal consistency and against publicly available imagery of the immediate aftermath.",
      },
      {
        heading: "Damage pattern",
        body: "Roof-cavity collapse geometry and shockwave propagation indicators favor a single large air-delivered munition over multiple artillery impacts. This narrows the responsible-unit inventory considerably.",
      },
    ],
  },
  {
    slug: "shahed-launch-site-network",
    title: "Shahed launch site network",
    date: "2026-01-11",
    analyst: "S. Hrytsenko",
    summary:
      "Identifies recurring launch geometries and dispersal patterns for one-way attack drones operating from occupied and Russian territory across the 2025–2026 winter campaign.",
    tags: ["UAV", "geolocation", "strike-network"],
    findings: [
      "Five primary launch areas account for ~80% of observed sorties across the campaign window.",
      "Salvo composition shows a deliberate mix of decoys to live munitions designed to saturate air-defense engagement capacity.",
      "Dispersal between salvos increases following high-attrition nights, consistent with adaptive counter-targeting behavior.",
    ],
    sources: [
      { label: "Ukrainian Air Force operational summaries", url: "https://www.zsu.gov.ua" },
      { label: "DefMon / DefenseMonitor open-source reporting", url: "https://defmon.substack.com" },
      { label: "OSINT-Defender geolocation threads", url: "https://twitter.com/sentdefender" },
    ],
    citedOblastSlugs: ["kharkiv-oblast", "sumy-oblast", "chernihiv-oblast"],
    sections: [
      {
        heading: "Launch geometry",
        body: "Trajectories reconstructed from posted flight-warning maps and reported impact locations converge on five primary launch areas with consistent bearing distributions.",
      },
      {
        heading: "Salvo composition",
        body: "Decoy ratios are inferred from public Air Force breakdowns of intercepted vs. live impacts. Adaptive behavior is evidenced by salvo-spacing changes after high-attrition nights.",
      },
    ],
  },
];

export function listInvestigations(): Investigation[] {
  return INVESTIGATIONS.slice().sort((a, b) => b.date.localeCompare(a.date));
}

export function getInvestigation(slug: string): Investigation | null {
  return INVESTIGATIONS.find((i) => i.slug === slug) ?? null;
}

export function localizedTitle(inv: Investigation, _locale: Locale): string {
  return inv.title;
}
