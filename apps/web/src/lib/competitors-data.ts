export type CompetitorFeatureRow = {
  feature: string;
  aegis: boolean | string;
  competitor: boolean | string;
};

export type Competitor = {
  slug: string;
  name: string;
  description: string;
  founded: string;
  pricing: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  features: CompetitorFeatureRow[];
};

export const COMPETITORS: Competitor[] = [
  {
    slug: "palantir",
    name: "Palantir Gotham",
    description: "Enterprise intelligence platform for government and defense.",
    founded: "2003",
    pricing: "$500K+ annually",
    targetAudience: "Government, defense contractors, intelligence agencies",
    strengths: [
      "Deep government integration",
      "Powerful data fusion",
      "Battle-tested in defense",
    ],
    weaknesses: [
      "Extremely expensive",
      "Complex to deploy",
      "Not designed for OSINT",
      "No open-source data by default",
      "Closed ecosystem",
    ],
    features: [
      { feature: "Real-time conflict map", aegis: true, competitor: false },
      { feature: "AI Copilot (chat)", aegis: true, competitor: "Limited" },
      { feature: "OSINT data sources", aegis: "15+ curated", competitor: "Requires integration" },
      { feature: "Free tier", aegis: true, competitor: false },
      { feature: "Open API", aegis: true, competitor: "Enterprise only" },
      { feature: "Conflict-specific features", aegis: true, competitor: false },
      { feature: "Setup time", aegis: "Minutes", competitor: "Months" },
      { feature: "Min. contract", aegis: "$0 (free tier)", competitor: "$500K+" },
    ],
  },
  {
    slug: "liveuamap",
    name: "LiveUAmap",
    description: "Real-time conflict map with news aggregation.",
    founded: "2014",
    pricing: "Free (ads)",
    targetAudience: "General public, journalists, civilians",
    strengths: ["Free and accessible", "Real-time updates", "Simple UI"],
    weaknesses: [
      "No confidence scoring",
      "No AI analysis",
      "No API",
      "Limited verification",
      "No export",
    ],
    features: [
      { feature: "Real-time conflict map", aegis: true, competitor: true },
      { feature: "AI Copilot", aegis: true, competitor: false },
      { feature: "Confidence scoring", aegis: true, competitor: false },
      { feature: "API access", aegis: true, competitor: false },
      { feature: "Export (CSV/GeoJSON)", aegis: true, competitor: false },
      { feature: "Verification pipeline", aegis: true, competitor: false },
      { feature: "Alert rules", aegis: true, competitor: false },
      { feature: "Custom AOIs", aegis: true, competitor: false },
    ],
  },
  {
    slug: "dataminr",
    name: "Dataminr",
    description: "AI-powered real-time event detection from public data streams.",
    founded: "2009",
    pricing: "Enterprise pricing only",
    targetAudience: "Enterprise, newsrooms, financial firms",
    strengths: ["Fast alerts", "Twitter/X coverage", "Financial sector focus"],
    weaknesses: [
      "No conflict-specific intelligence",
      "No map visualization",
      "Very expensive",
      "No OSINT curation",
    ],
    features: [
      { feature: "Conflict map", aegis: true, competitor: false },
      { feature: "AI Copilot", aegis: true, competitor: false },
      { feature: "Real-time alerts", aegis: true, competitor: true },
      { feature: "OSINT verification", aegis: true, competitor: false },
      { feature: "Free tier", aegis: true, competitor: false },
      { feature: "Confidence scoring", aegis: true, competitor: "Basic" },
      { feature: "Case files", aegis: true, competitor: false },
    ],
  },
  {
    slug: "bellingcat",
    name: "Bellingcat Investigation Kit",
    description: "OSINT tools and community for investigative journalism.",
    founded: "2014",
    pricing: "Free tools, paid training",
    targetAudience: "Investigative journalists, researchers",
    strengths: [
      "Best-in-class OSINT community",
      "Rigorous methodology",
      "Free tools",
    ],
    weaknesses: [
      "No real-time monitoring",
      "Manual workflow only",
      "No API",
      "No alerting system",
    ],
    features: [
      { feature: "Real-time monitoring", aegis: true, competitor: false },
      { feature: "Automated verification", aegis: true, competitor: false },
      { feature: "Alert rules", aegis: true, competitor: false },
      { feature: "API access", aegis: true, competitor: false },
      { feature: "OSINT methodology", aegis: true, competitor: true },
      { feature: "Community", aegis: "Growing", competitor: "Established" },
      { feature: "Price", aegis: "Free tier", competitor: "Free" },
    ],
  },
];

export const VERDICTS: Record<string, string> = {
  palantir:
    "Palantir is more powerful for classified intelligence; Aegis Lens is dramatically more affordable and purpose-built for OSINT conflict monitoring.",
  liveuamap:
    "Aegis Lens adds AI verification, confidence scoring, and a full API that LiveUAmap lacks.",
  dataminr:
    "Dataminr excels at social media monitoring; Aegis Lens provides OSINT-verified conflict intelligence with a free tier.",
  bellingcat:
    "Bellingcat provides manual OSINT tools; Aegis Lens automates the pipeline with real-time monitoring and alerting.",
};

export const AEGIS_WHY: Record<string, string[]> = {
  palantir: [
    "Deploy in minutes, not months — no procurement cycle required.",
    "Free tier with full API access; transparent, self-serve pricing.",
    "Purpose-built for OSINT conflict monitoring with 15+ curated sources.",
  ],
  liveuamap: [
    "Confidence scoring and source verification on every event.",
    "Full structured API and bulk export (CSV/GeoJSON) for analysts and researchers.",
    "Custom AOIs, alert rules, and AI Copilot for deeper analysis.",
  ],
  dataminr: [
    "OSINT-verified conflict intelligence, not raw social-media signal.",
    "Free tier and transparent pricing — no enterprise-only paywall.",
    "Conflict-specific taxonomy, case files, and map visualization.",
  ],
  bellingcat: [
    "Real-time automated monitoring replaces manual search workflows.",
    "Alerting system with email, webhook, and Telegram delivery.",
    "Structured API and export for machine-readable, citable data.",
  ],
};

export function getCompetitorData(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

export function getVerdict(slug: string): string {
  return VERDICTS[slug] ?? "Aegis Lens provides a free, API-first alternative with OSINT-verified conflict intelligence.";
}

export function getAegisWhy(slug: string): string[] {
  return AEGIS_WHY[slug] ?? [
    "Free tier with full API access.",
    "Purpose-built OSINT conflict intelligence.",
    "Real-time monitoring with confidence scoring.",
  ];
}
