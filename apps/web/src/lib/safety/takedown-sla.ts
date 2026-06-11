'use server';

/**
 * Takedown SLA — track and enforce per-violation content removal requests.
 *
 * All takedown requests must be actioned within TAKEDOWN_SLA_HOURS.
 * The assertTakedownSla helper throws if the deadline has passed without action.
 *
 * Відстеження та виконання SLA для запитів на видалення контенту.
 */

// ── TakedownStatus ────────────────────────────────────────────────────────────

export type TakedownStatus =
  | "pending"
  | "processing"
  | "actioned"
  | "appealed"
  | "rejected";

// ── SLA constant ──────────────────────────────────────────────────────────────

/**
 * Maximum hours from request submission to actioned status.
 *
 * Максимальна кількість годин від подання запиту до виконання.
 */
export const TAKEDOWN_SLA_HOURS = 24;

// ── TakedownRequest ───────────────────────────────────────────────────────────

export interface TakedownRequest {
  id: string;
  /** Content being targeted for takedown */
  contentId: string;
  contentType: "event" | "image" | "report" | "comment" | "profile";
  /** ID of the user/reporter who filed the request */
  reportedBy: string;
  /** Reason category for the takedown */
  reason:
    | "doxxing"
    | "pii-exposure"
    | "harassment"
    | "hate-speech"
    | "misinformation"
    | "other";
  status: TakedownStatus;
  /** ISO timestamp when the request was submitted */
  submittedAt: string;
  /** ISO SLA deadline */
  slaDeadline: string;
  /** ISO timestamp when status moved to actioned/rejected */
  actionedAt: string | null;
  /** Moderator who processed this request */
  actionedBy: string | null;
  /** Notes added by the moderator */
  notes: string | null;
}

// ── TakedownStore ─────────────────────────────────────────────────────────────

/**
 * Singleton store for takedown requests.
 *
 * Синглтон-сховище запитів на видалення контенту.
 */
export class TakedownStore {
  private static instance: TakedownStore;
  private readonly requests = new Map<string, TakedownRequest>();
  private counter = 0;

  private constructor() {}

  static getInstance(): TakedownStore {
    if (!TakedownStore.instance) {
      TakedownStore.instance = new TakedownStore();
    }
    return TakedownStore.instance;
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Submit a new takedown request. SLA deadline is set automatically.
   *
   * Подати новий запит на видалення. SLA-дедлайн встановлюється автоматично.
   */
  submit(
    contentId: string,
    contentType: TakedownRequest["contentType"],
    reportedBy: string,
    reason: TakedownRequest["reason"],
  ): TakedownRequest {
    const id = `tkdn-${++this.counter}`;
    const now = new Date();
    const slaMs = TAKEDOWN_SLA_HOURS * 60 * 60 * 1000;
    const request: TakedownRequest = {
      id,
      contentId,
      contentType,
      reportedBy,
      reason,
      status: "pending",
      submittedAt: now.toISOString(),
      slaDeadline: new Date(now.getTime() + slaMs).toISOString(),
      actionedAt: null,
      actionedBy: null,
      notes: null,
    };
    this.requests.set(id, request);
    return request;
  }

  /**
   * Update the status of a takedown request.
   *
   * Оновити статус запиту на видалення.
   */
  updateStatus(
    id: string,
    status: TakedownStatus,
    actionedBy: string,
    notes?: string,
  ): boolean {
    const req = this.requests.get(id);
    if (!req) return false;
    req.status = status;
    if (status === "actioned" || status === "rejected") {
      req.actionedAt = new Date().toISOString();
      req.actionedBy = actionedBy;
      req.notes = notes ?? null;
    }
    return true;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  get(id: string): TakedownRequest | undefined {
    return this.requests.get(id);
  }

  getPending(): TakedownRequest[] {
    return Array.from(this.requests.values()).filter(
      (r) => r.status === "pending" || r.status === "processing",
    );
  }

  getOverdue(): TakedownRequest[] {
    const now = Date.now();
    return Array.from(this.requests.values()).filter(
      (r) =>
        (r.status === "pending" || r.status === "processing") &&
        new Date(r.slaDeadline).getTime() < now,
    );
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const takedownStore = TakedownStore.getInstance();

// ── assertTakedownSla ─────────────────────────────────────────────────────────

/**
 * Throw if a request's SLA has been breached without actioning.
 * Call from monitoring jobs to surface SLA violations.
 *
 * Кидає помилку якщо SLA прострочено без дії. Викликати з моніторинг-джобів.
 */
export function assertTakedownSla(request: TakedownRequest): void {
  if (request.status === "actioned" || request.status === "rejected") return;

  const now = Date.now();
  const deadline = new Date(request.slaDeadline).getTime();

  if (now > deadline) {
    const overdueMins = Math.round((now - deadline) / 60_000);
    throw new Error(
      `[takedown-sla] Request ${request.id} is overdue by ${overdueMins} minutes. ` +
        `SLA is ${TAKEDOWN_SLA_HOURS}h. Current status: ${request.status}. ` +
        `Запит ${request.id} прострочено на ${overdueMins} хвилин.`,
    );
  }
}
