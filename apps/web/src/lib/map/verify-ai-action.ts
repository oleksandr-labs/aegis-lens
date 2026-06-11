/**
 * "Verify with AI" action — re-run geolocation / object detection checks.
 * Дія «Перевірка за допомогою ШІ» — повторний запуск геолокації / виявлення об'єктів.
 *
 * Enterprise-tier feature. Rate limited to 10 jobs per hour per org.
 * Jobs are queued and polled via GET /api/v1/verify/ai-recheck/<jobId>.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type VerifyAICheck =
  | 'geolocation'
  | 'object_detection'
  | 'deepfake'
  | 'confidence_recompute';

export type VerifyAIJobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface VerifyAIRequest {
  eventId: string;
  /** Which checks to re-run. At least one required. */
  checks: VerifyAICheck[];
}

export interface VerifyAIJob {
  jobId: string;
  eventId: string;
  checks: VerifyAICheck[];
  status: VerifyAIJobStatus;
  /** Per-check results populated when status === 'done'. */
  results?: Record<string, unknown>;
  createdAt: string;
}

// ── Endpoint helper ───────────────────────────────────────────────────────────

/**
 * Return the API endpoint for AI re-check jobs.
 * Повернути ендпоїнт API для завдань повторної перевірки ШІ.
 */
export function buildVerifyAIEndpoint(): string {
  return '/api/v1/verify/ai-recheck';
}

// ── Queue class ───────────────────────────────────────────────────────────────

class VerifyAIQueue {
  private jobs = new Map<string, VerifyAIJob>();
  private seq = 0;

  /** Enqueue a new AI verify job. */
  enqueue(request: VerifyAIRequest): VerifyAIJob {
    const jobId = `vai-${++this.seq}-${Date.now()}`;
    const job: VerifyAIJob = {
      jobId,
      eventId: request.eventId,
      checks: request.checks,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, job);
    return job;
  }

  /** Update job status and results. */
  update(
    jobId: string,
    patch: Partial<Pick<VerifyAIJob, 'status' | 'results'>>,
  ): VerifyAIJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    Object.assign(job, patch);
    return job;
  }

  /** Get a job by ID. */
  get(jobId: string): VerifyAIJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List jobs for a specific event. */
  listByEvent(eventId: string): VerifyAIJob[] {
    return [...this.jobs.values()]
      .filter((j) => j.eventId === eventId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

/** Singleton queue instance. */
export const verifyAIQueue = new VerifyAIQueue();

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const VERIFY_AI_NOTES_EN: Record<string, string> = {
  'enterprise-tier-only':
    'The "Verify with AI" button is gated behind the enterprise subscription tier. ' +
    'Check the credits-wallet tier in middleware before exposing the button in the inspector UI.',
  'rate-limit-10-per-hour':
    'Each organisation is limited to 10 AI re-check jobs per hour. ' +
    'Enforce via the rate-limit middleware keyed on orgId. ' +
    'Return 429 with Retry-After when the limit is exceeded.',
};

export const VERIFY_AI_NOTES_UK: Record<string, string> = {
  'enterprise-tier-only':
    'Кнопка «Перевірка за допомогою ШІ» доступна лише в корпоративному рівні підписки. ' +
    'Перевіряйте рівень credits-wallet у middleware перед відображенням кнопки в UI інспектора.',
  'rate-limit-10-per-hour':
    'Кожна організація обмежена 10 завданнями повторної перевірки ШІ на годину. ' +
    'Застосовуйте через middleware обмеження швидкості з ключем orgId. ' +
    'Повертайте 429 з Retry-After при перевищенні ліміту.',
};
