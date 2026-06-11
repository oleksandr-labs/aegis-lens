/**
 * Daily advisory ingest pipeline.
 *
 * Orchestrates: CERT-UA RSS + SSSCIP announcements + (lawful) MISP events →
 * enrich (sector tag, IOC extract, CVE xref) → canonical Aegis Events.
 *
 * CADENCE — RETROSPECTIVE FEED: this pipeline is designed to run ONCE PER DAY
 * (cron). Cyber advisories describe activity that occurred days/weeks earlier;
 * sub-daily polling adds load without freshness benefit. Each client also
 * self-throttles via canPoll() (CERT-UA 6h, SSSCIP 12h). DO NOT wire this into a
 * real-time loop.
 */

import type { CertAdvisory } from "./types";
import type { AegisEventV1 } from "../../../packages/event-schema/src/v1";
import { CertUaClient } from "./cert-client";
import { SsscipClient } from "./ssscip-client";
import { MispClient } from "./misp-client";
import { enrichAdvisory, advisoryToEvent } from "./adapter";

export interface IngestConfig {
  /** Use demo fixtures only — no network. */
  demoOnly?: boolean;
  /** MISP base URL + auth key (read from process.env at the call site). */
  mispBaseUrl?: string;
  mispAuthKey?: string;
  orgId?: string;
}

export interface IngestResult {
  fetchedAt: string;
  /** Enriched advisories (sector/IOC/CVE filled). */
  advisories: CertAdvisory[];
  /** Canonical events ready for the event DB / map layer. */
  events: AegisEventV1[];
  counts: {
    certUa: number;
    ssscip: number;
    misp: number;
    totalIocs: number;
    totalCves: number;
  };
  isDemo: boolean;
}

/** Recommended cron cadence — daily. Exposed for schedulers. */
export const INGEST_CRON = "0 5 * * *"; // 05:00 daily
export const INGEST_CADENCE_LABEL = {
  en: "Daily (retrospective — advisories lag the underlying activity by days)",
  uk: "Щоденно (ретроспективно — оповіщення відстають від подій на дні)",
};

export class AdvisoryIngestPipeline {
  private readonly cert: CertUaClient;
  private readonly ssscip: SsscipClient;
  private readonly misp: MispClient;
  private readonly demoOnly: boolean;
  private readonly orgId: string;

  constructor(config: IngestConfig = {}) {
    this.cert = new CertUaClient();
    this.ssscip = new SsscipClient();
    this.misp = new MispClient({ baseUrl: config.mispBaseUrl, authKey: config.mispAuthKey });
    this.demoOnly = config.demoOnly ?? false;
    this.orgId = config.orgId ?? "public";
  }

  async run(): Promise<IngestResult> {
    const fetchedAt = new Date().toISOString();

    const certAdvs = this.demoOnly ? this.cert.getDemoAdvisories() : await this.cert.getAdvisories();
    const ssscipAdvs = this.demoOnly ? this.ssscip.getDemoAnnouncements() : await this.ssscip.getAnnouncements();

    // MISP feeds contribute IOCs/intel; without lawful access we get TLP:CLEAR demo only.
    const mispEvents = this.demoOnly ? [] : await this.misp.getEvents();
    const mispIocs = this.misp.toIocs(mispEvents);

    const enriched = [...certAdvs, ...ssscipAdvs].map(enrichAdvisory);

    // Fold MISP-derived IOCs into a synthetic intel advisory if any survived TLP gating.
    if (mispIocs.length > 0) {
      enriched.push(
        enrichAdvisory({
          advisoryId: `MISP#${fetchedAt.slice(0, 10)}`,
          source: "misp",
          titleUk: "Індикатори компрометації з партнерських MISP-стрічок",
          titleEn: "Indicators of compromise from partner MISP feeds",
          bodyText: mispIocs.map((i) => i.value).join(" "),
          url: "https://www.misp-project.org",
          publishedAt: fetchedAt,
          severity: "medium",
          sectors: [],
          regions: ["UA-ALL"],
        }),
      );
    }

    const events = enriched.map((a) => advisoryToEvent(a, this.orgId));

    return {
      fetchedAt,
      advisories: enriched,
      events,
      counts: {
        certUa: certAdvs.length,
        ssscip: ssscipAdvs.length,
        misp: mispEvents.length,
        totalIocs: enriched.reduce((n, a) => n + (a.iocs?.length ?? 0), 0),
        totalCves: enriched.reduce((n, a) => n + (a.cveIds?.length ?? 0), 0),
      },
      isDemo: this.demoOnly || !this.misp.hasLawfulAccess,
    };
  }
}
