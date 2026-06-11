/**
 * Report delivery — multi-channel fan-out (email, Slack, Telegram, API pull).
 *
 * Доставка звітів — багатоканальний fan-out (email, Slack, Telegram, API pull).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportDeliveryChannel = "email" | "slack" | "telegram" | "api_pull";

export interface ReportDeliveryConfig {
  reportId: string;
  channels: ReportDeliveryChannel[];
  recipientUserIds: string[];
  /** UTC hour (0–23) for scheduled delivery; omit for on_publish / manual */
  scheduleUtcHour?: number;
  triggerType: "on_publish" | "scheduled" | "manual";
}

export interface ReportDeliveryJob {
  jobId: string;
  config: ReportDeliveryConfig;
  status: "queued" | "delivering" | "done" | "failed";
  deliveredTo: ReportDeliveryChannel[];
  failedChannels: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

export class ReportDeliveryQueue {
  private readonly jobs = new Map<string, ReportDeliveryJob>();
  private jobCounter = 0;

  /**
   * Enqueues a new delivery job for a report.
   * Ставить нове завдання доставки у чергу для звіту.
   */
  enqueue(config: ReportDeliveryConfig): ReportDeliveryJob {
    const jobId = `rdj_${Date.now()}_${++this.jobCounter}`;
    const now   = new Date().toISOString();
    const job: ReportDeliveryJob = {
      jobId,
      config,
      status:         "queued",
      deliveredTo:    [],
      failedChannels: [],
      createdAt:      now,
      updatedAt:      now,
    };
    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Updates the status and channel results for a delivery job.
   * Оновлює статус і результати каналів для завдання доставки.
   */
  update(
    jobId: string,
    patch: Partial<Pick<ReportDeliveryJob, "status" | "deliveredTo" | "failedChannels">>,
  ): ReportDeliveryJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    Object.assign(job, patch, { updatedAt: new Date().toISOString() });
    return job;
  }

  /** Returns a job by ID */
  get(jobId: string): ReportDeliveryJob | undefined {
    return this.jobs.get(jobId);
  }

  /** Lists all queued jobs for a report */
  listForReport(reportId: string): ReportDeliveryJob[] {
    return Array.from(this.jobs.values()).filter(
      (j) => j.config.reportId === reportId,
    );
  }
}

/** Module-level singleton */
export const reportDeliveryQueue = new ReportDeliveryQueue();

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const DELIVERY_NOTES_EN: string[] = [
  "multi-channel-fan-out: on triggerType 'on_publish', the publish handler calls reportDeliveryQueue.enqueue() once per report; a background worker fans out to all configured channels concurrently, recording success/failure per channel in ReportDeliveryJob.",
  "enterprise-api-pull-endpoint: the 'api_pull' channel type enables enterprise users to GET the latest published report for a subscription via /api/v1/reports/:id/deliver (authenticated by API key); no push is sent — the job is marked done once the endpoint is polled.",
];

export const DELIVERY_NOTES_UK: string[] = [
  "multi-channel-fan-out: при triggerType 'on_publish' обробник публікації викликає reportDeliveryQueue.enqueue() один раз на звіт; фоновий воркер розсилає паралельно всіма налаштованими каналами, записуючи успіх/невдачу по кожному каналу в ReportDeliveryJob.",
  "enterprise-api-pull-endpoint: тип каналу 'api_pull' дозволяє корпоративним користувачам отримати останній опублікований звіт підписки через GET /api/v1/reports/:id/deliver (автентифікація за API-ключем); push не надсилається — завдання позначається виконаним після опитування ендпоінту.",
];
