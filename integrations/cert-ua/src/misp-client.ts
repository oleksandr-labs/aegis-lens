/**
 * Client for MISP / StateWatch threat-intelligence feeds.
 *
 * MISP (Malware Information Sharing Platform) is the de-facto standard for
 * structured threat-intel exchange. CERT-UA operates a MISP instance and shares
 * selected events with vetted partners. "StateWatch"-style feeds are similar
 * partner-distributed indicator feeds.
 *
 * ⚠️ LAWFUL ACCESS ONLY. MISP feeds are gated by:
 *   - Membership / partnership agreement with the sharing community.
 *   - An API auth key (read from process.env.MISP_AUTH_KEY — NEVER hardcoded).
 *   - Traffic Light Protocol (TLP) sharing tags that govern republication:
 *       TLP:RED   — do NOT republish or store beyond intended recipients.
 *       TLP:AMBER — limited internal distribution; NOT for the public map.
 *       TLP:GREEN — community distribution; may inform analysis, attribute source.
 *       TLP:CLEAR/WHITE — public; may be republished with attribution.
 *   This client ENFORCES TLP at the boundary: by default it drops TLP:RED/AMBER
 *   events from any public-facing output. See COMPLIANCE.md.
 *
 * Without an auth key + base URL this client serves a small public-tier demo
 * fixture (TLP:CLEAR) so the package is usable offline.
 */

import type { MispEvent, Ioc, IocType } from "./types";

export interface MispClientConfig {
  baseUrl?: string;
  /** Read from process.env.MISP_AUTH_KEY at the call site; do not pass literals. */
  authKey?: string;
  timeoutMs?: number;
  /**
   * Maximum TLP level permitted in OUTPUT. Default "green" — anything more
   * restrictive (amber/red) is filtered out so it never reaches the public map.
   */
  maxPublishableTlp?: MispEvent["tlp"];
}

const TLP_ORDER: Record<MispEvent["tlp"], number> = {
  clear: 0,
  white: 0,
  green: 1,
  amber: 2,
  red: 3,
};

// ── DEMO fixture (TLP:CLEAR only — safe to ship) ────────────────────────────────

export const DEMO_MISP_EVENTS: MispEvent[] = [
  {
    uuid: "demo-misp-0001",
    info: "Gamaredon phishing infrastructure — UA government targeting",
    date: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),
    threat_level_id: "1",
    analysis: "2",
    tlp: "clear",
    Attribute: [
      { uuid: "a1", type: "domain", category: "Network activity", value: "gov-ua-mail.net", to_ids: true, comment: "Phishing domain" },
      { uuid: "a2", type: "ip-dst", category: "Network activity", value: "91.218.114.32", to_ids: true, comment: "C2" },
      { uuid: "a3", type: "sha256", category: "Payload delivery", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", to_ids: true },
    ],
  },
];

// ── MISP attribute type → our IocType ───────────────────────────────────────────

const MISP_TYPE_TO_IOC: Record<string, IocType> = {
  "ip-src": "ipv4",
  "ip-dst": "ipv4",
  "ip-src|port": "ipv4",
  "ip-dst|port": "ipv4",
  domain: "domain",
  hostname: "domain",
  url: "url",
  md5: "md5",
  sha1: "sha1",
  sha256: "sha256",
  "email-src": "email",
  "email-dst": "email",
  vulnerability: "cve",
};

export class MispClient {
  private readonly baseUrl?: string;
  private readonly authKey?: string;
  private readonly timeoutMs: number;
  private readonly maxTlp: number;

  constructor(config: MispClientConfig = {}) {
    this.baseUrl = config.baseUrl;
    this.authKey = config.authKey;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.maxTlp = TLP_ORDER[config.maxPublishableTlp ?? "green"];
  }

  get hasLawfulAccess(): boolean {
    return Boolean(this.baseUrl && this.authKey);
  }

  /**
   * Fetch recent MISP events. Without lawful access (baseUrl+authKey) returns the
   * public TLP:CLEAR demo fixture. Output is ALWAYS TLP-filtered.
   */
  async getEvents(): Promise<MispEvent[]> {
    if (!this.hasLawfulAccess) {
      return this.filterByTlp(DEMO_MISP_EVENTS);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/events/restSearch`, {
        method: "POST",
        headers: {
          Authorization: this.authKey!,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ returnFormat: "json", limit: 100, published: true }),
        signal: controller.signal,
      });
      if (!res.ok) return this.filterByTlp(DEMO_MISP_EVENTS);
      const json = (await res.json()) as { response?: Array<{ Event: MispEvent }> };
      const events = (json.response ?? []).map((r) => r.Event);
      return this.filterByTlp(events);
    } catch {
      return this.filterByTlp(DEMO_MISP_EVENTS);
    } finally {
      clearTimeout(timer);
    }
  }

  /** Drop events whose TLP exceeds the configured publishable level. */
  filterByTlp(events: MispEvent[]): MispEvent[] {
    return events.filter((e) => TLP_ORDER[e.tlp] <= this.maxTlp);
  }

  /** Flatten MISP attributes (across publishable events) into typed IOCs. */
  toIocs(events: MispEvent[]): Ioc[] {
    const iocs: Ioc[] = [];
    for (const ev of this.filterByTlp(events)) {
      for (const attr of ev.Attribute ?? []) {
        const type = MISP_TYPE_TO_IOC[attr.type];
        if (!type) continue;
        iocs.push({
          type,
          value: attr.type === "vulnerability" ? attr.value.toUpperCase() : attr.value.toLowerCase(),
          context: attr.comment,
        });
      }
    }
    return iocs;
  }
}
