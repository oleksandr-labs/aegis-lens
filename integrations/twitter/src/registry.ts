/**
 * Curated X/Twitter account registry for conflict OSINT.
 *
 * Inclusion criteria:
 *   - Publicly verifiable identity (journalist, official, analyst, NGO)
 *   - Consistent conflict-related posting
 *   - ToS-compliant public account
 */

import type { XAccount } from "./types";

export const ACCOUNT_REGISTRY: XAccount[] = [
  // ── Ukrainian official ────────────────────────────────────────────────────
  {
    id: "394662337",
    username: "ZelenskyyUa",
    name: "Volodymyr Zelenskyy",
    description: "Official account of the President of Ukraine",
    location: "Kyiv, Ukraine",
    reliability: 5,
    region: "UA",
    topics: ["politics", "military", "humanitarian"],
    tos_verified_at: "2023-01-01",
  },
  {
    id: "1245268820163416067",
    username: "GeneralStaff_u",
    name: "General Staff of Ukraine",
    description: "Official General Staff of Ukraine Armed Forces",
    location: "Ukraine",
    reliability: 5,
    region: "UA",
    topics: ["military"],
    tos_verified_at: "2023-01-01",
  },
  // ── Ukrainian journalists / OSINT ────────────────────────────────────────
  {
    id: "1382788",
    username: "ChrisO_wiki",
    name: "ChrisO",
    description: "OSINT researcher covering Ukraine/Russia",
    reliability: 4,
    region: "UA",
    topics: ["military", "osint"],
    tos_verified_at: "2023-01-01",
  },
  {
    id: "3312365814",
    username: "RALee85",
    name: "Rob Lee",
    description: "Senior Fellow FPRI, PhD student KCL — Russia/Ukraine military analyst",
    reliability: 4,
    region: "UA",
    topics: ["military", "analysis"],
    tos_verified_at: "2023-01-01",
  },
  // ── International correspondents ─────────────────────────────────────────
  {
    id: "15053818",
    username: "Reuters",
    name: "Reuters",
    description: "Reuters News Agency",
    reliability: 5,
    region: "INT",
    topics: ["general", "conflict"],
    tos_verified_at: "2023-01-01",
  },
  {
    id: "428333",
    username: "AP",
    name: "The Associated Press",
    description: "AP breaking news",
    reliability: 5,
    region: "INT",
    topics: ["general", "conflict"],
    tos_verified_at: "2023-01-01",
  },
  // ── Monitoring organizations ──────────────────────────────────────────────
  {
    id: "2835032624",
    username: "OSINTdefender",
    name: "OSINTDefender",
    description: "Open Source Intelligence — conflict tracking",
    reliability: 3,
    region: "INT",
    topics: ["osint", "military"],
    tos_verified_at: "2023-01-01",
  },
  {
    id: "17469289",
    username: "IntelCrab",
    name: "Intel Crab",
    description: "Military & intelligence OSINT",
    reliability: 3,
    region: "UA",
    topics: ["osint", "military"],
    tos_verified_at: "2023-01-01",
  },
];

export class XAccountRegistryService {
  private readonly accounts = new Map<string, XAccount>(
    ACCOUNT_REGISTRY.map((a) => [a.username.toLowerCase(), a]),
  );

  getByUsername(username: string): XAccount | undefined {
    return this.accounts.get(username.toLowerCase());
  }

  byRegion(region: string): XAccount[] {
    return ACCOUNT_REGISTRY.filter(
      (a) => a.region === region || a.region === "INT",
    );
  }

  byTopic(topic: string): XAccount[] {
    return ACCOUNT_REGISTRY.filter((a) => a.topics.includes(topic));
  }

  getSourceWeight(username: string): number {
    const account = this.getByUsername(username);
    if (!account) return 0.3;
    return account.reliability / 5;
  }

  all(): XAccount[] {
    return ACCOUNT_REGISTRY;
  }
}
