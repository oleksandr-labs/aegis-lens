/**
 * Daily ingest of the ISW Russia Offensive Campaign Assessment text.
 *
 * Orchestrates: client fetch (RSS, polite cadence) → adapter (canonical event) →
 * entity extraction (KG enrichment, see entity-extraction.ts). Designed to be run
 * once per day by a scheduler; idempotent on `assessmentId` so re-runs are safe.
 *
 * No network/secrets needed: falls back to the bundled demo fixture (see client.ts).
 */

import type { AegisEventV1 } from "../../../packages/event-schema/src/v1";
import type { IswAssessment } from "./types";
import { IswClient, type IswClientConfig } from "./client";
import { assessmentToEvent, type IswAdapterOptions } from "./adapter";
import { extractEntities, type IswExtraction } from "./entity-extraction";

export interface DailyIngestResult {
  assessment: IswAssessment;
  event: AegisEventV1;
  extraction: IswExtraction;
  /** True if this assessmentId was already seen this run. */
  deduped: boolean;
}

export interface IswDailyIngestOptions extends IswAdapterOptions {
  client?: IswClientConfig;
}

export class IswDailyIngest {
  private readonly client: IswClient;
  private readonly seen = new Set<string>();

  constructor(private readonly options: IswDailyIngestOptions = {}) {
    this.client = new IswClient(options.client);
  }

  /** Ingest the latest N assessments (default 1 — today's). */
  async run(limit = 1): Promise<DailyIngestResult[]> {
    const assessments = await this.client.getLatestAssessments(limit);
    return assessments.map((a) => this.ingestOne(a));
  }

  /** Ingest a single already-fetched assessment (pure; testable). */
  ingestOne(assessment: IswAssessment): DailyIngestResult {
    const deduped = this.seen.has(assessment.assessmentId);
    this.seen.add(assessment.assessmentId);
    const event = assessmentToEvent(assessment, this.options);
    const extraction = extractEntities(assessment, event.eventId);
    return { assessment, event, extraction, deduped };
  }

  /** Whether a live fetch is currently allowed under the polite-cadence policy. */
  canFetchNow(): boolean {
    return this.client.canFetchNow();
  }
}
