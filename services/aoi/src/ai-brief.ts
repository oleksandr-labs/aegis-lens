/**
 * AOI-specific AI briefs.
 *
 * Generates and queues short AI-written intelligence summaries for each AOI,
 * triggered on a daily schedule or on significant new events.
 *
 * Production: backed by GPT-4o with source citations; enterprise/pro tier
 * only.  Community users get a delayed, un-cited summary.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN implementation notes */
export const AOI_BRIEF_NOTES_EN = [
  "GPT-backed: production briefs use GPT-4o with a structured prompt; inject top-N events as context + AOI metadata",
  "source-cited: every claim in the summary must link to an ingested source event (event_id); hallucination guard via retrieval-augmented generation",
  "enterprise-pro-tier: on-event briefs are enterprise-only; daily scheduled briefs available on pro+; community tier receives weekly digests only",
] as const;

/** UA нотатки щодо реалізації */
export const AOI_BRIEF_NOTES_UK = [
  "GPT-backed: виробничі брифінги використовують GPT-4o зі структурованим промптом; як контекст подаються найважливіші події та метадані AOI",
  "source-cited: кожне твердження у зведенні повинно посилатися на подію з ingested-джерела (event_id); захист від галюцинацій через RAG",
  "enterprise-pro-tier: брифінги по події — лише для enterprise; щоденні за розкладом — для pro+; community-рівень отримує лише тижневі дайджести",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** What triggered this brief */
export type AOIBriefTrigger = "scheduled_daily" | "on_event" | "manual";

/** A generated intelligence brief for one AOI */
export interface AOIBrief {
  briefId: string;
  aoiId: string;
  trigger: AOIBriefTrigger;
  /** English summary (1-3 paragraphs) */
  summary: string;
  /** Ukrainian summary */
  summaryUk: string;
  /** Number of events used to generate the brief */
  eventCount: number;
  /** Top event IDs or short descriptions cited in the brief */
  topEvents: string[];
  /** ISO-8601 generation timestamp */
  generatedAt: string;
}

/** Per-AOI briefing configuration */
export interface AOIBriefConfig {
  aoiId: string;
  /** Which trigger types are active for this AOI */
  triggerTypes: AOIBriefTrigger[];
  /** Delivery channels: 'email', 'push', 'webhook', etc. */
  deliveryChannels: string[];
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

interface QueuedBrief {
  aoiId: string;
  trigger: AOIBriefTrigger;
  config: AOIBriefConfig;
  scheduledAt: string;
  result?: AOIBrief;
}

/**
 * In-memory AOI brief queue.
 *
 * Production should use a durable job queue (BullMQ / pg-boss) and call the
 * LLM API asynchronously with retry logic.
 */
export class AOIBriefQueue {
  private readonly queue: QueuedBrief[] = [];
  private readonly briefs = new Map<string, AOIBrief[]>();

  /**
   * Schedule a brief generation for an AOI.
   * Returns the scheduled job index.
   */
  schedule(aoiId: string, config: AOIBriefConfig, trigger: AOIBriefTrigger = "scheduled_daily"): void {
    if (!config.enabled) return;
    if (!config.triggerTypes.includes(trigger)) return;
    this.queue.push({ aoiId, trigger, config, scheduledAt: new Date().toISOString() });
  }

  /**
   * Generate (stub) a brief for an AOI.
   *
   * In production this calls the LLM API.  Here it returns a placeholder
   * brief so the interface is exercisable without credentials.
   */
  generate(aoiId: string, trigger: AOIBriefTrigger): AOIBrief {
    const brief: AOIBrief = {
      briefId: `brief_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      aoiId,
      trigger,
      summary:
        `[STUB] No live events available for AOI ${aoiId}. ` +
        "Production brief generation requires LLM integration (see AOI_BRIEF_NOTES_EN[0]).",
      summaryUk:
        `[STUB] Немає живих подій для AOI ${aoiId}. ` +
        "Виробнича генерація брифінгів потребує інтеграції з LLM (див. AOI_BRIEF_NOTES_UK[0]).",
      eventCount: 0,
      topEvents: [],
      generatedAt: new Date().toISOString(),
    };

    const existing = this.briefs.get(aoiId) ?? [];
    existing.unshift(brief);
    this.briefs.set(aoiId, existing);

    return brief;
  }

  /** List all generated briefs for an AOI, newest first */
  list(aoiId: string): AOIBrief[] {
    return this.briefs.get(aoiId) ?? [];
  }

  /** Drain pending scheduled jobs (returns AOI IDs to process) */
  drainPending(): QueuedBrief[] {
    return this.queue.splice(0, this.queue.length);
  }
}

/** Module-level singleton */
export const aoiBriefQueue = new AOIBriefQueue();
