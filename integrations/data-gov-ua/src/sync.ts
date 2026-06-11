/**
 * Periodic dataset sync (Task 6).
 *
 * Each source refreshes at a different cadence, so the sync layer declares a
 * per-source schedule and a single `runSync` entry point an external scheduler
 * (cron / queue worker) calls. The sync is METADATA-oriented: it refreshes the
 * data.gov.ua catalog, the Texty investigation catalog, and (on demand) the
 * registry/procurement facts for a watchlist of ЄДРПОУ codes. It never bulk
 * mirrors the multi-GB EDR dumps — only resource URLs + the resolved facts for
 * entities we actually surface.
 *
 * Cadence rationale (see COMPLIANCE.md crawler discipline):
 *   - data.gov.ua EDR catalog: daily (the EDR open dump updates ~daily).
 *   - addresses / infrastructure catalog: weekly (changes slowly).
 *   - Texty datasets: weekly (new investigations are infrequent).
 *   - Prozorro procurement: daily for watched entities (tenders move fast).
 *   - Registry enrichment (OpenDataBot/YouControl): on-demand + weekly refresh
 *     (proprietary quota-limited; don't poll aggressively).
 */

import type {
  DataGovDataset,
  TextyDataset,
  CompanyRecord,
  ProcurementTender,
  DataGovTopic,
} from "./types";
import { DataGovClient } from "./data-gov-client";
import { TextyClient } from "./texty-client";
import { ProzorroClient } from "./prozorro-client";
import { resolveMany } from "./edr-resolver";

export type SyncCadence = "daily" | "weekly" | "on-demand";

export interface SyncSchedule {
  source:
    | "data-gov-edr"
    | "data-gov-catalog"
    | "texty"
    | "prozorro"
    | "registry-enrichment";
  cadence: SyncCadence;
  description: { en: string; uk: string };
}

/** Declarative schedule — an external cron maps these to its own timers. */
export const SYNC_SCHEDULE: SyncSchedule[] = [
  {
    source: "data-gov-edr",
    cadence: "daily",
    description: {
      en: "Refresh data.gov.ua EDR catalog (registry dump updates ~daily).",
      uk: "Оновлення каталогу ЄДР на data.gov.ua (дамп реєстру оновлюється ~щодня).",
    },
  },
  {
    source: "data-gov-catalog",
    cadence: "weekly",
    description: {
      en: "Refresh address + infrastructure catalogs (change slowly).",
      uk: "Оновлення каталогів адрес та інфраструктури (змінюються повільно).",
    },
  },
  {
    source: "texty",
    cadence: "weekly",
    description: {
      en: "Refresh Texty.org.ua data-journalism dataset catalog.",
      uk: "Оновлення каталогу датасетів дата-журналістики Texty.org.ua.",
    },
  },
  {
    source: "prozorro",
    cadence: "daily",
    description: {
      en: "Refresh Prozorro procurement footprint for watched entities.",
      uk: "Оновлення закупівельної активності Prozorro для відстежуваних суб'єктів.",
    },
  },
  {
    source: "registry-enrichment",
    cadence: "weekly",
    description: {
      en: "Refresh OpenDataBot/YouControl enrichment for watched entities (quota-limited).",
      uk: "Оновлення збагачення OpenDataBot/YouControl для відстежуваних суб'єктів (з квотою).",
    },
  },
];

export interface SyncInput {
  /** ЄДРПОУ codes we actively surface (drives registry + procurement sync). */
  watchlistEdrpou?: string[];
  /** Which sources to run this pass (default: all due). */
  sources?: Array<SyncSchedule["source"]>;
  /** Injected clients (tests / shared instances). */
  dataGov?: DataGovClient;
  texty?: TextyClient;
  prozorro?: ProzorroClient;
}

export interface SyncResult {
  startedAt: string;
  finishedAt: string;
  catalog: { datasets: DataGovDataset[]; byTopic: Record<DataGovTopic, number> };
  textyDatasets: TextyDataset[];
  companies: CompanyRecord[];
  procurement: ProcurementTender[];
  stats: {
    datasetsDiscovered: number;
    textyDiscovered: number;
    companiesResolved: number;
    tendersFetched: number;
  };
}

function topicCounts(datasets: DataGovDataset[]): Record<DataGovTopic, number> {
  const c: Record<DataGovTopic, number> = {
    edr: 0, addresses: 0, infrastructure: 0, budget: 0, transport: 0, other: 0,
  };
  for (const d of datasets) c[d.topic]++;
  return c;
}

/**
 * Run one sync pass. Designed to be idempotent and safe to call from any
 * scheduler; all underlying clients degrade to demo data without secrets.
 */
export async function runSync(input: SyncInput = {}): Promise<SyncResult> {
  const startedAt = new Date().toISOString();
  const wanted = new Set(input.sources ?? SYNC_SCHEDULE.map((s) => s.source));

  const dataGov = input.dataGov ?? new DataGovClient();
  const texty = input.texty ?? new TextyClient();
  const prozorro = input.prozorro ?? new ProzorroClient();
  const watch = input.watchlistEdrpou ?? [];

  const datasets =
    wanted.has("data-gov-edr") || wanted.has("data-gov-catalog")
      ? await dataGov.searchDatasets({ rows: 50 })
      : [];

  const textyDatasets = wanted.has("texty") ? await texty.listDatasets() : [];

  const companies =
    wanted.has("registry-enrichment") && watch.length
      ? await resolveMany(watch)
      : [];

  const procurement: ProcurementTender[] = [];
  if (wanted.has("prozorro") && watch.length) {
    for (const code of watch) {
      procurement.push(...(await prozorro.tendersForEdrpou(code)));
    }
  }

  const finishedAt = new Date().toISOString();
  return {
    startedAt,
    finishedAt,
    catalog: { datasets, byTopic: topicCounts(datasets) },
    textyDatasets,
    companies,
    procurement,
    stats: {
      datasetsDiscovered: datasets.length,
      textyDiscovered: textyDatasets.length,
      companiesResolved: companies.length,
      tendersFetched: procurement.length,
    },
  };
}
