/**
 * Curated Telegram channel registry.
 * Each entry documents provenance, language, regional focus, and reliability.
 *
 * DO NOT add channels without documenting their reliability score and verifying
 * that scraping is within Telegram ToS (public channels only).
 *
 * Reliability scale:
 *   5 — official government / military source
 *   4 — established verified journalist / outlet
 *   3 — community-verified OSINT channel
 *   2 — unverified but historically accurate
 *   1 — unverified, use with caution
 */

export interface ChannelEntry {
  /** Telegram username without @ */
  username: string;
  /** Human-readable name */
  display_name: Record<string, string>;
  /** BCP-47 primary language */
  language: string;
  /** ISO 3166-2 oblast codes, or ["UA"] for national, or ["ALL"] for multi-country */
  regions: string[];
  reliability: 1 | 2 | 3 | 4 | 5;
  /** Brief description of the source */
  description: string;
  /** Poll frequency in minutes */
  poll_cadence_min: number;
  /** Whether to also download media (images/video) */
  download_media: boolean;
  /** Date added, ISO-8601 */
  added_at: string;
  /** Whether this channel is currently active in the pipeline */
  active: boolean;
  /** Revoke if the channel owner objects or changes ToS stance */
  tos_verified_at?: string;
}

export const CHANNEL_REGISTRY: ChannelEntry[] = [
  // Official / Government
  {
    username: "GeneralStaff_ua",
    display_name: { en: "General Staff of Ukraine", uk: "Генеральний штаб ЗСУ" },
    language: "uk",
    regions: ["UA"],
    reliability: 5,
    description: "Official General Staff of the Armed Forces of Ukraine.",
    poll_cadence_min: 5,
    download_media: true,
    added_at: "2026-05-25",
    active: true,
  },
  {
    username: "dsns_ukraine",
    display_name: { en: "DSNS Ukraine (Emergency)", uk: "ДСНС України" },
    language: "uk",
    regions: ["UA"],
    reliability: 5,
    description: "State Emergency Service of Ukraine — fires, floods, incidents.",
    poll_cadence_min: 5,
    download_media: false,
    added_at: "2026-05-25",
    active: true,
  },
  {
    username: "Ukraine_Emergency",
    display_name: { en: "Ukraine Emergency (air raids)", uk: "Повітряна тривога Україна" },
    language: "uk",
    regions: ["UA"],
    reliability: 5,
    description: "Official air-raid alert broadcasts.",
    poll_cadence_min: 1,
    download_media: false,
    added_at: "2026-05-25",
    active: true,
  },

  // OSINT / Verified
  {
    username: "UkraineNow",
    display_name: { en: "Ukraine Now", uk: "Україна Зараз" },
    language: "uk",
    regions: ["UA"],
    reliability: 4,
    description: "Multi-source aggregator, Ukrainian language.",
    poll_cadence_min: 5,
    download_media: true,
    added_at: "2026-05-25",
    active: true,
  },
  {
    username: "osint_ua",
    display_name: { en: "OSINT UA", uk: "OSINT UA" },
    language: "uk",
    regions: ["UA"],
    reliability: 3,
    description: "Community OSINT aggregation.",
    poll_cadence_min: 10,
    download_media: true,
    added_at: "2026-05-25",
    active: true,
  },
  {
    username: "InformNapalm",
    display_name: { en: "InformNapalm", uk: "InformNapalm" },
    language: "uk",
    regions: ["UA"],
    reliability: 4,
    description: "Verified OSINT investigation group.",
    poll_cadence_min: 30,
    download_media: true,
    added_at: "2026-05-25",
    active: true,
  },
];

export class ChannelRegistryService {
  private readonly channels: Map<string, ChannelEntry>;

  constructor(entries: ChannelEntry[] = CHANNEL_REGISTRY) {
    this.channels = new Map(entries.map((e) => [e.username, e]));
  }

  getActive(): ChannelEntry[] {
    return [...this.channels.values()].filter((c) => c.active);
  }

  getByRegion(oblastCode: string): ChannelEntry[] {
    return this.getActive().filter(
      (c) => c.regions.includes("UA") || c.regions.includes("ALL") || c.regions.includes(oblastCode),
    );
  }

  get(username: string): ChannelEntry | undefined {
    return this.channels.get(username);
  }

  getSourceWeight(username: string): number {
    const entry = this.get(username);
    if (!entry) return 0.3;
    // Map reliability 1-5 to weight 0.3-0.95
    return 0.3 + (entry.reliability - 1) * (0.65 / 4);
  }

  revoke(username: string): void {
    const entry = this.channels.get(username);
    if (entry) {
      entry.active = false;
    }
  }
}
