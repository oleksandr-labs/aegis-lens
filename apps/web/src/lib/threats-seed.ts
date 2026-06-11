import type { Locale } from "@aegis/i18n-config";
import type { EventClass } from "@aegis/types";

type Localized = Partial<Record<Locale, string>> & { en: string };

export type ThreatSeed = {
  slug: string;
  name: Localized;
  category: "kinetic" | "infrastructure" | "cyber" | "maritime" | "aviation" | "humanitarian";
  /** Maps the threat to its dominant Aegis event class (for cross-linking topic feeds). */
  eventClass: EventClass;
  /** ISO2 country codes most directly affected. */
  affectedRegions: string[];
  /** Short tagline / SEO description. */
  summary: Localized;
  /** Civilian-facing mitigation (1–2 sentences). */
  civilianGuidance: Localized;
  /** Operator-facing (org / military / utility) mitigation. */
  operatorGuidance: Localized;
  /** Free-form tags for /tags cross-linking. */
  tags: string[];
  /** Linked seeded event IDs (where applicable). */
  citedEventIds?: string[];
  /** Linked equipment slugs. */
  relatedEquipmentSlugs?: string[];
  /** Long-form body sections. */
  sections: { heading: string; body: string }[];
  /**
   * Current severity on a 1–5 scale (1 = monitoring, 5 = critical).
   * Recomputed quarterly by the analyst team.
   */
  currentSeverity?: 1 | 2 | 3 | 4 | 5;
};

export const THREATS: ThreatSeed[] = [
  {
    slug: "shahed-strikes",
    currentSeverity: 5,
    name: { en: "Shahed-family one-way attack drones" },
    category: "kinetic",
    eventClass: "military_action",
    affectedRegions: ["ua"],
    summary: {
      en: "Iranian-origin one-way attack UAVs (Shahed-131/136 and Russian Geran-2 variants) used in mass salvos against Ukrainian energy infrastructure and population centers.",
    },
    civilianGuidance: {
      en: "Heed air-raid alerts in any oblast under active raid warning. Maintain a 36-hour shelter kit (water, light, power bank) given typical multi-wave salvo timing. Stay clear of windows and exterior walls during the alert window.",
    },
    operatorGuidance: {
      en: "Energy operators: harden critical substations with passive blast mitigation and disperse spares. Air-defense operators: prioritize layered intercept (EW + small-calibre + missile) over single-layer designs given high salvo counts.",
    },
    tags: ["UAV", "shahed", "energy", "salvo"],
    citedEventIds: ["01HXKHARKIVDRONE001", "01HXSUMYDRONE001"],
    relatedEquipmentSlugs: ["shahed-136"],
    sections: [
      {
        heading: "Threat profile",
        body: "Shahed-family UAVs are slow (≈180 km/h cruise), low-altitude, propeller-driven loitering munitions with warheads in the 30–50 kg class. Their value is salvo economics: dozens or hundreds in a single night force defenders to allocate scarce missile inventories against cheap drones.",
      },
      {
        heading: "Observed adaptations",
        body: "Across the 2025–2026 winter campaign, observed launch geometry shifted west; salvo composition increased decoy ratios; trajectories diversified to complicate fixed-arc air defenses. See the Shahed launch site network investigation for detailed reconstruction.",
      },
      {
        heading: "Methodology",
        body: "Aegis Lens correlates Air Force operational summaries with civilian-reported impact points, geolocated debris photographs, and acoustic detection grids. See `/methodology` for the full scoring rubric.",
      },
    ],
  },
  {
    slug: "energy-grid-attacks",
    currentSeverity: 5,
    name: { en: "Energy-grid attacks" },
    category: "infrastructure",
    eventClass: "infrastructure",
    affectedRegions: ["ua"],
    summary: {
      en: "Coordinated strikes against substations, transformers, switching nodes, and thermal generation — designed to inflict cascading blackouts during high-demand months.",
    },
    civilianGuidance: {
      en: "Maintain alternate heating, water, and phone-charging capacity for at least 72 hours during winter months. Identify nearest warming center via local authorities (Точка незламності / city portals).",
    },
    operatorGuidance: {
      en: "Pre-position spare transformer fleet. Implement n-1 / n-2 redundancy on inter-tie substations. Coordinate cross-border restoration agreements (ENTSO-E synchronization) before incidents, not after.",
    },
    tags: ["energy", "substations", "infrastructure", "winter"],
    citedEventIds: ["01HXKHERSONINFRA001", "01HXMYKINFRA001"],
    relatedEquipmentSlugs: [],
    sections: [
      {
        heading: "Threat profile",
        body: "Grid attacks pursue cascading effects: a single high-voltage substation taken offline can shed loads across multiple oblasts. Adversary doctrine now targets repair throughput as much as initial capacity — striking the same nodes after partial restoration.",
      },
      {
        heading: "Resilience indicators",
        body: "Recovery time, percent-load-served, and the ratio of repaired-to-reattacked nodes are the three metrics that best track real resilience. Public dashboards rarely surface the third.",
      },
    ],
  },
  {
    slug: "long-range-missile-strikes",
    currentSeverity: 4,
    name: { en: "Long-range cruise + ballistic missile strikes" },
    category: "kinetic",
    eventClass: "military_action",
    affectedRegions: ["ua", "pl"],
    summary: {
      en: "Kalibr, Iskander, Kinzhal, and Kh-101/555 class strikes against deep-rear targets — command nodes, logistics hubs, energy, and population centers.",
    },
    civilianGuidance: {
      en: "Multi-wave alerts often pair drones with later missile waves. Continue sheltering after the first wave passes; the second wave is the killer.",
    },
    operatorGuidance: {
      en: "Critical-node hardening must assume both subsonic cruise + hypersonic-glide threats. Decoy infrastructure (radar masts, illumination, geographic dispersion of value targets) measurably degrades adversary salvo planning.",
    },
    tags: ["missile", "kinzhal", "iskander", "kalibr"],
    citedEventIds: ["01HXKYIVALERT001", "01HXDNIPRO001"],
    sections: [
      {
        heading: "Threat profile",
        body: "Long-range strikes are the most expensive per-munition threat in the adversary inventory; the constraint is salvo capacity, not range. Tracking expended-vs-produced ratios is the leading indicator of campaign sustainability.",
      },
    ],
  },
  {
    slug: "civilian-cyber-attacks",
    currentSeverity: 3,
    name: { en: "Civilian-facing cyber attacks" },
    category: "cyber",
    eventClass: "cyber",
    affectedRegions: ["ua", "pl", "de"],
    summary: {
      en: "Coordinated cyber operations against telecoms, banking, government portals, and media — designed to erode public trust and disrupt routine life during kinetic escalation windows.",
    },
    civilianGuidance: {
      en: "Maintain offline copies of identity documents. Enable SMS-fallback or app-based 2FA on banking and government accounts. Treat unsolicited SMS / messenger contact during crisis windows as hostile until proven otherwise.",
    },
    operatorGuidance: {
      en: "Segment OT networks from corporate IT. Test backup restoration quarterly under realistic time pressure. Have an out-of-band comms plan (signal of last resort) for executives.",
    },
    tags: ["cyber", "ransomware", "wiper", "phishing"],
    citedEventIds: ["01HXLVIVCYBER001", "01HXKYIVCYBER001"],
    sections: [
      {
        heading: "Threat profile",
        body: "Civilian cyber attacks blend in with criminal noise. The state-sponsored vs. cybercrime line is procedural, not technical — same families, different operators.",
      },
    ],
  },
  {
    slug: "ais-spoofing",
    currentSeverity: 3,
    name: { en: "AIS spoofing & dark-fleet operations" },
    category: "maritime",
    eventClass: "maritime",
    affectedRegions: ["ua"],
    summary: {
      en: "Vessels falsifying AIS transponder data, switching off transponders, or co-locating with cover vessels to evade sanctions enforcement and cargo tracking.",
    },
    civilianGuidance: {
      en: "Not directly civilian-facing. Coastal communities should refer to local maritime authority advisories during exercises.",
    },
    operatorGuidance: {
      en: "Combine AIS feed with overhead SAR + RF geolocation to catch spoofing. Investment in commercial-SAR cadence over the Black Sea pays for itself within a quarter.",
    },
    tags: ["AIS", "dark-fleet", "maritime", "sanctions"],
    citedEventIds: ["01HXBLKSEAMAR001"],
    sections: [
      {
        heading: "Threat profile",
        body: "AIS spoofing is structural: the protocol is unauthenticated by design. The detection burden falls entirely on consumers of the feed.",
      },
    ],
  },
  {
    slug: "humanitarian-corridor-attacks",
    currentSeverity: 4,
    name: { en: "Humanitarian corridor attacks" },
    category: "humanitarian",
    eventClass: "humanitarian",
    affectedRegions: ["ua"],
    summary: {
      en: "Strikes against announced evacuation corridors, aid convoys, and humanitarian assembly points — a pattern Aegis Lens treats as a high-confidence indicator of impending escalation.",
    },
    civilianGuidance: {
      en: "Treat corridor announcements as advisory, not safe. Cross-reference any published corridor with multiple independent humanitarian operators before traveling.",
    },
    operatorGuidance: {
      en: "Humanitarian operators should publish corridor timings through pre-coordinated channels, not ad-hoc. Pre-position medical evacuation capacity rather than reactive surge.",
    },
    tags: ["humanitarian", "corridor", "war-crimes", "civilians"],
    citedEventIds: ["01HXPLBORDERHUM001"],
    sections: [
      {
        heading: "Threat profile",
        body: "The pattern of corridor strikes is well-documented and, on the available evidence, deliberate. International humanitarian law analysis is the province of legal investigators; the open-source signal is the strike pattern itself.",
      },
    ],
  },
  {
    slug: "civil-aviation-spillover",
    currentSeverity: 2,
    name: { en: "Civil aviation spillover incidents" },
    category: "aviation",
    eventClass: "aviation",
    affectedRegions: ["ua", "pl", "de"],
    summary: {
      en: "Drone-fragment falls, missile-debris incursions, and GPS-spoofing affecting civilian airspace in border-adjacent EU states.",
    },
    civilianGuidance: {
      en: "Trust official aviation authority guidance (PANSA / DFS / Eurocontrol). Flight-tracking sites show route-level effects but do not include classified diversions.",
    },
    operatorGuidance: {
      en: "Carriers operating near the eastern EU border should pre-plan divert fuel, GPS-jamming alternate procedures, and crew briefing updates ahead of each operating day.",
    },
    tags: ["aviation", "gps-spoofing", "border", "civil-aviation"],
    citedEventIds: ["01HXCHERNIHIVAVI001"],
    sections: [
      {
        heading: "Threat profile",
        body: "GPS jamming and spoofing in the eastern EU border zone is now routine background. Operators have adapted; the public has not been told the full extent.",
      },
    ],
  },
  {
    slug: "synthetic-media-disinformation",
    currentSeverity: 3,
    name: { en: "Synthetic media disinformation" },
    category: "cyber",
    eventClass: "cyber",
    affectedRegions: ["ua", "pl", "de"],
    summary: {
      en: "Audio, video, and image deepfakes of officials, weaponized through messenger and short-video platforms to seed panic, fake surrender orders, or fabricated atrocity claims.",
    },
    civilianGuidance: {
      en: "If a viral clip claims an extraordinary thing (surrender, evacuation order, leader-resignation), wait 30 minutes and confirm through ≥2 official channels before acting or amplifying.",
    },
    operatorGuidance: {
      en: "Comms teams should have pre-drafted denial templates and a one-click verified-identity post on every official account. Speed matters more than polish during a deepfake event.",
    },
    tags: ["disinformation", "deepfake", "synthetic-media", "comms"],
    sections: [
      {
        heading: "Threat profile",
        body: "Detection lags creation by 12–18 months on average. Behavioral defense (cross-channel confirmation, latency) outperforms technical defense (forensics) at the moment of crisis.",
      },
    ],
  },
];

export function listThreats(): ThreatSeed[] {
  return THREATS.slice().sort((a, b) => a.name.en.localeCompare(b.name.en));
}

export function getThreat(slug: string): ThreatSeed | null {
  return THREATS.find((t) => t.slug === slug) ?? null;
}

export function threatsByRegion(iso2: string): ThreatSeed[] {
  return THREATS.filter((t) =>
    t.affectedRegions.some((r) => r.toLowerCase() === iso2.toLowerCase()),
  );
}
