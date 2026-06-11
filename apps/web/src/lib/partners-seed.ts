export type PartnerTier = "strategic" | "implementation" | "osint-research";

export type Partner = {
  slug: string;
  name: string;
  tier: PartnerTier;
  /** One-line positioning. */
  oneLiner: string;
  /** What they bring to the joint engagement. */
  expertise: string;
  /** Engagement model + ideal customer description. */
  engagementModel: string;
  /** 3–5 representative outcomes / capabilities. */
  outcomes: string[];
  /** Co-marketing assets that exist (or "planned"). */
  assets: { label: string; status: "ready" | "planned" }[];
  /** Industries served. */
  industries: string[];
  /** Regions served. */
  regions: string[];
  /** Tag slugs for /tags. */
  tags: string[];
};

export const PARTNERS: Partner[] = [
  {
    slug: "northstar-defense-consulting",
    name: "Northstar Defense Consulting",
    tier: "strategic",
    oneLiner:
      "Strategic defense consultancy with deep NATO-aligned analyst networks across Eastern Europe.",
    expertise:
      "Open-source analyst staff augmentation, briefing-grade synthesis, and procurement support for European MoDs and intelligence services.",
    engagementModel:
      "Multi-quarter engagements with embedded analyst teams; Aegis Lens platform integration delivered as part of the workstream.",
    outcomes: [
      "Replaced three legacy feeds in a single EU ministry with a unified API-backed pipeline.",
      "Trained 24 analysts on the verification + scoring methodology with measurable retraction-rate drop.",
      "Authored procurement-grade methodology documentation accepted by two ministry audit functions.",
    ],
    assets: [
      { label: "Joint solution brief (PDF)", status: "ready" },
      { label: "Customer references", status: "ready" },
      { label: "Co-branded webinar series", status: "planned" },
    ],
    industries: ["Defense", "Government"],
    regions: ["EU"],
    tags: ["defense", "government", "consulting"],
  },
  {
    slug: "open-newsroom-collective",
    name: "Open Newsroom Collective",
    tier: "osint-research",
    oneLiner:
      "Investigative-journalism collective specializing in OSINT, geolocation, and accountability reporting.",
    expertise:
      "Geolocation, verification, long-form investigation, and editorial training. Track record on cross-border accountability investigations.",
    engagementModel:
      "Per-investigation engagements with shared bylines, plus newsroom training packages. Free tier of Aegis Lens API included.",
    outcomes: [
      "12 jointly published investigations across humanitarian-corridor, energy-grid, and sanctions-evasion topics.",
      "Trained 80+ working journalists on the seven-check verification workflow.",
      "Co-developed the synthetic-media disinformation detection playbook used in Sprint 2.9.",
    ],
    assets: [
      { label: "Joint investigation showcase", status: "ready" },
      { label: "Verification training curriculum", status: "ready" },
    ],
    industries: ["Journalism", "Research"],
    regions: ["EU", "UA"],
    tags: ["journalism", "investigation", "verification"],
  },
  {
    slug: "civitas-humanitarian-systems",
    name: "Civitas Humanitarian Systems",
    tier: "implementation",
    oneLiner:
      "Implementation partner for humanitarian NGOs — operationalizes Aegis Lens signals into pre-positioning workflows.",
    expertise:
      "Operational integration for evacuation, medical logistics, and shelter pre-positioning. Strong field-engineering practice.",
    engagementModel:
      "6–12 week implementation projects with handover to NGO ops teams. Long-running support contracts available.",
    outcomes: [
      "Cut activation lead time from reactive to 36-hour advance pre-position in 70% of activations.",
      "Reduced per-event response cost by 28% for one regional NGO.",
      "Integrated webhook delivery into three NGO incident-management platforms.",
    ],
    assets: [
      { label: "NGO implementation playbook", status: "ready" },
      { label: "Webhook integration cookbook", status: "ready" },
      { label: "Pre-positioning case study", status: "ready" },
    ],
    industries: ["Humanitarian"],
    regions: ["UA", "EU"],
    tags: ["humanitarian", "ngo", "implementation"],
  },
  {
    slug: "harbor-bridge-financial-intelligence",
    name: "Harbor Bridge Financial Intelligence",
    tier: "implementation",
    oneLiner:
      "Implementation partner for financial-services compliance — sanctions evasion, maritime, and supply-chain risk.",
    expertise:
      "Counterparty resolution, sanctions-evasion network mapping, AIS-spoofing detection, and integration with KYC/AML stacks.",
    engagementModel:
      "Enrichment-as-a-service plus implementation engagements for in-house screening teams.",
    outcomes: [
      "Caught 11 counterparties showing AIS-spoofing-correlated activity in a global bank's first Q with the integration.",
      "Reduced false-positive rate on enhanced due diligence by 31% via Aegis Lens signal pre-screening.",
      "Pre-built integrations for two enterprise screening platforms.",
    ],
    assets: [
      { label: "Sanctions-evasion playbook", status: "ready" },
      { label: "Bank compliance case study", status: "ready" },
      { label: "AML enrichment connector", status: "planned" },
    ],
    industries: ["Finance"],
    regions: ["EU", "US"],
    tags: ["finance", "sanctions", "compliance"],
  },
  {
    slug: "panoptic-geospatial",
    name: "Panoptic Geospatial",
    tier: "strategic",
    oneLiner:
      "Strategic geospatial partner combining commercial satellite imagery analytics with Aegis Lens event data.",
    expertise:
      "Commercial-imagery tasking, change detection, BDA workflows, and energy-grid resilience modeling.",
    engagementModel:
      "Joint solutions on imagery + event-data products; pass-through licensing of commercial imagery providers.",
    outcomes: [
      "Energy-grid resilience model used by a regional utility through the 2025–26 winter.",
      "Pre-strike vs post-strike imagery pairing automated for any event in the Aegis Lens corpus.",
      "Joint dashboards for two governmental customers.",
    ],
    assets: [
      { label: "Energy-grid solution brief", status: "ready" },
      { label: "Imagery + events joint demo", status: "planned" },
    ],
    industries: ["Defense", "Energy", "Government"],
    regions: ["EU", "UA"],
    tags: ["geospatial", "imagery", "infrastructure"],
  },
];

export function listPartners(): Partner[] {
  return PARTNERS.slice().sort((a, b) => {
    const order: Record<PartnerTier, number> = {
      strategic: 0,
      implementation: 1,
      "osint-research": 2,
    };
    if (order[a.tier] !== order[b.tier]) return order[a.tier] - order[b.tier];
    return a.name.localeCompare(b.name);
  });
}

export function getPartner(slug: string): Partner | null {
  return PARTNERS.find((p) => p.slug === slug) ?? null;
}

export const PARTNER_TIER_LABEL: Record<PartnerTier, string> = {
  strategic: "Strategic",
  implementation: "Implementation",
  "osint-research": "OSINT research",
};
