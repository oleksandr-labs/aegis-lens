export type TrendDirection = "rising" | "falling" | "stable" | "new";

export type Trend = {
  slug: string;
  title: string;
  description: string;
  direction: TrendDirection;
  changePercent: number; // positive = rising, negative = falling
  timeframe: string; // e.g. "last 7 days"
  tags: string[];
  relatedEventClass: string;
  peakDate?: string;
  /** What's driving this trend — a short explanatory paragraph. */
  drivingFactors: string;
  /** Key stats displayed on the detail page. */
  stats: { label: string; value: string }[];
  /** Slugs of other trends to surface as related. */
  relatedTrendSlugs: string[];
};

export const TRENDS: Trend[] = [
  {
    slug: "drone-activity-surge-2026",
    title: "Drone Activity Surge",
    description:
      "Documented drone events increased 340% vs 7-day baseline across NE Ukraine.",
    direction: "rising",
    changePercent: 340,
    timeframe: "last 7 days",
    tags: ["drone", "military_action"],
    relatedEventClass: "military_action",
    peakDate: "2026-06-01",
    drivingFactors:
      "The surge is driven by a combination of expanded Shahed/Geran-2 production capacity and diversified launch corridors from Belgorod and Kursk regions. Multi-axis ingress tactics mean a larger share of salvos reach urban areas before interception. Air-defence resource exhaustion during peak nights creates windows exploited by follow-on missiles. Ukrainian EW adaptations lag by a reporting cycle, sustaining the elevated event rate.",
    stats: [
      { label: "Events (7d)", value: "247" },
      { label: "Change vs baseline", value: "+340%" },
      { label: "Primary region", value: "NE Ukraine" },
      { label: "Peak date", value: "2026-06-01" },
    ],
    relatedTrendSlugs: [
      "frontline-stabilization",
      "infrastructure-energy-targets",
      "cyberattacks-financial-sector",
    ],
  },
  {
    slug: "black-sea-maritime-normalization",
    title: "Black Sea Maritime Activity",
    description:
      "Commercial vessel traffic returning toward pre-conflict levels after corridor establishment.",
    direction: "falling",
    changePercent: -23,
    timeframe: "last 30 days",
    tags: ["maritime", "shipping"],
    relatedEventClass: "maritime",
    drivingFactors:
      "The UN-brokered grain corridor framework, while formally suspended, has been informally replaced by bilateral arrangements and NATO maritime presence that de-risk transits for neutral-flag vessels. Insurance underwriters have progressively revised war-risk premiums downward, unlocking commercial traffic that had been economically excluded. AIS-spoofing incidents continue but are no longer sufficient to deter bulk carriers on the Odesa–Istanbul run.",
    stats: [
      { label: "Events (30d)", value: "34" },
      { label: "Change vs baseline", value: "-23%" },
      { label: "Primary region", value: "Black Sea" },
      { label: "Active corridors", value: "2" },
    ],
    relatedTrendSlugs: [
      "drone-activity-surge-2026",
      "infrastructure-energy-targets",
      "frontline-stabilization",
    ],
  },
  {
    slug: "cyberattacks-financial-sector",
    title: "Financial Sector Cyber Targeting",
    description:
      "New wave of coordinated cyber operations targeting Ukrainian and EU banking infrastructure.",
    direction: "rising",
    changePercent: 87,
    timeframe: "last 14 days",
    tags: ["cyber", "financial"],
    relatedEventClass: "cyber",
    drivingFactors:
      "Threat actors linked to GRU and FSB-adjacent infrastructure have pivoted toward financial sector targets in a bid to amplify economic pressure alongside kinetic campaigns. SWIFT messaging-layer probes, DDoS campaigns against Ukrainian banking portals, and credential-harvesting spear-phishes targeting EU correspondent banks are running concurrently. The pattern mirrors the pre-invasion playbook from early 2022 but with more mature tooling and longer dwell times.",
    stats: [
      { label: "Events (14d)", value: "63" },
      { label: "Change vs baseline", value: "+87%" },
      { label: "Sectors targeted", value: "Banking, FinTech" },
      { label: "Attributed actors", value: "3" },
    ],
    relatedTrendSlugs: [
      "drone-activity-surge-2026",
      "infrastructure-energy-targets",
      "frontline-stabilization",
    ],
  },
  {
    slug: "infrastructure-energy-targets",
    title: "Energy Infrastructure Targeting",
    description:
      "Power grid and energy facility strikes tracking higher than any previous quarterly period.",
    direction: "rising",
    changePercent: 124,
    timeframe: "last 30 days",
    tags: ["infrastructure", "energy"],
    relatedEventClass: "infrastructure",
    drivingFactors:
      "Strategic strikes on 330 kV switching nodes are deliberately timed to maximise cascading failure across 2–4 oblasts per event. Transformer replacement lead times (now 18–24 months for custom high-voltage units) create a compounding vulnerability that standard repair throughput cannot offset. Combined missile-plus-drone raids exploit air-defence resource allocation windows; the kinetic pattern is documented in the Drone Activity Surge trend.",
    stats: [
      { label: "Events (30d)", value: "89" },
      { label: "Change vs baseline", value: "+124%" },
      { label: "Highest-impact target", value: "330 kV substations" },
      { label: "Oblasts affected", value: "12" },
    ],
    relatedTrendSlugs: [
      "drone-activity-surge-2026",
      "frontline-stabilization",
      "black-sea-maritime-normalization",
    ],
  },
  {
    slug: "frontline-stabilization",
    title: "Frontline Activity Stabilization",
    description:
      "Ground combat event frequency stabilizing after Q1 2026 escalation peak.",
    direction: "stable",
    changePercent: 2,
    timeframe: "last 7 days",
    tags: ["military", "frontline"],
    relatedEventClass: "military_action",
    drivingFactors:
      "Attrition on both sides has constrained offensive tempo to localised probing operations rather than sustained breakthrough attempts. Mud season reduced mechanised mobility across the eastern axis, though fighting in built-up areas in Donetsk oblast continues at high intensity. Both sides appear to be regenerating reserves and rotating units, suggesting stabilisation is operational rather than strategic.",
    stats: [
      { label: "Events (7d)", value: "312" },
      { label: "Change vs baseline", value: "+2%" },
      { label: "Active axes", value: "4" },
      { label: "Contested settlements", value: "23" },
    ],
    relatedTrendSlugs: [
      "drone-activity-surge-2026",
      "infrastructure-energy-targets",
      "cyberattacks-financial-sector",
    ],
  },
];

export function listTrends(): Trend[] {
  return TRENDS;
}

export function getTrend(slug: string): Trend | null {
  return TRENDS.find((t) => t.slug === slug) ?? null;
}
