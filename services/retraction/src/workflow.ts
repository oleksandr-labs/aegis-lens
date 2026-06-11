/**
 * Retraction workflow.
 *
 * Principles (Bellingcat model):
 *   - Never quietly delete — always retract publicly
 *   - Every retraction links to a reason + replacement if applicable
 *   - Notify all subscribers who received the original event
 *   - Propagate to downstream: reports, cases, exports, alerts
 *   - Maintain a public corrections log
 */

import type {
  RetractionRecord,
  RetractState,
  DownstreamRef,
  RetractionNotification,
} from "./types";

export interface RetractionStore {
  create(record: RetractionRecord): Promise<void>;
  update(id: string, patch: Partial<RetractionRecord>): Promise<void>;
  getById(id: string): Promise<RetractionRecord | null>;
  getByEventId(eventId: string): Promise<RetractionRecord | null>;
  list(limit?: number, offset?: number): Promise<RetractionRecord[]>;
}

export interface DownstreamPropagator {
  /** Mark a downstream artifact as citing a retracted event */
  flagAsCitingRetraction(ref: DownstreamRef, retractionId: string): Promise<void>;
}

export interface SubscriberNotifier {
  getSubscribersForEvent(eventId: string): Promise<string[]>;
  sendRetractionNotification(notification: RetractionNotification): Promise<void>;
}

export interface SearchIndexUpdater {
  /** Remove or tombstone a retracted event from search indexes */
  retractFromIndex(eventId: string, retractionId: string): Promise<void>;
}

export class RetractionWorkflow {
  constructor(
    private readonly store: RetractionStore,
    private readonly propagator?: DownstreamPropagator,
    private readonly notifier?: SubscriberNotifier,
    private readonly searchIndex?: SearchIndexUpdater,
  ) {}

  async retract(opts: {
    eventId: string;
    state: RetractState;
    reason: string;
    retractedBy: string;
    correctionSummary?: { en: string; uk?: string };
    replacementEventId?: string;
    downstreamRefs?: DownstreamRef[];
    originalSummary?: string;
  }): Promise<RetractionRecord> {
    // Check for existing retraction
    const existing = await this.store.getByEventId(opts.eventId);
    if (existing) {
      throw new Error(`Event ${opts.eventId} is already ${existing.state}.`);
    }

    const record: RetractionRecord = {
      id: crypto.randomUUID(),
      eventId: opts.eventId,
      state: opts.state,
      reason: opts.reason,
      correctionSummary: opts.correctionSummary,
      replacementEventId: opts.replacementEventId,
      retractedBy: opts.retractedBy,
      retractedAt: new Date().toISOString(),
      downstreamRefs: opts.downstreamRefs ?? [],
      notificationsSent: false,
      publiclyVisible: true,
    };

    await this.store.create(record);

    // Propagate to downstream references
    if (this.propagator && record.downstreamRefs.length > 0) {
      await Promise.allSettled(
        record.downstreamRefs.map((ref) =>
          this.propagator!.flagAsCitingRetraction(ref, record.id),
        ),
      );
    }

    // Update search index (tombstone, not delete)
    if (this.searchIndex) {
      await this.searchIndex.retractFromIndex(opts.eventId, record.id).catch(() => null);
    }

    // Notify subscribers
    if (this.notifier) {
      await this.sendNotifications(record, opts.originalSummary ?? "");
    }

    return record;
  }

  private async sendNotifications(
    record: RetractionRecord,
    originalSummary: string,
  ): Promise<void> {
    if (!this.notifier) return;

    try {
      const subscribers = await this.notifier.getSubscribersForEvent(record.eventId);
      await Promise.allSettled(
        subscribers.map((recipientId) =>
          this.notifier!.sendRetractionNotification({
            retractionId: record.id,
            eventId: record.eventId,
            recipientId,
            channel: "email",
            state: record.state,
            originalSummary,
            correctionSummary: record.correctionSummary?.en,
            sentAt: new Date().toISOString(),
          }),
        ),
      );

      await this.store.update(record.id, {
        notificationsSent: true,
        notificationsSentAt: new Date().toISOString(),
      });
    } catch {
      // Don't fail the retraction if notifications fail
    }
  }

  /** Get public corrections log for transparency page */
  async getPublicLog(limit = 50, offset = 0): Promise<RetractionRecord[]> {
    const all = await this.store.list(limit, offset);
    return all.filter((r) => r.publiclyVisible);
  }
}

export class InMemoryRetractionStore implements RetractionStore {
  private readonly records = new Map<string, RetractionRecord>();

  async create(record: RetractionRecord): Promise<void> {
    this.records.set(record.id, { ...record });
  }

  async update(id: string, patch: Partial<RetractionRecord>): Promise<void> {
    const existing = this.records.get(id);
    if (existing) Object.assign(existing, patch);
  }

  async getById(id: string): Promise<RetractionRecord | null> {
    return this.records.get(id) ?? null;
  }

  async getByEventId(eventId: string): Promise<RetractionRecord | null> {
    for (const record of this.records.values()) {
      if (record.eventId === eventId) return { ...record };
    }
    return null;
  }

  async list(limit = 50, offset = 0): Promise<RetractionRecord[]> {
    return [...this.records.values()]
      .sort((a, b) => b.retractedAt.localeCompare(a.retractedAt))
      .slice(offset, offset + limit);
  }
}
