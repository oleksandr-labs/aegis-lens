import type { Transition } from "./state-machine";

export interface AuditEntry {
  event_id: string;
  transition: Transition;
  confidence_before: number;
  confidence_after: number;
  source_count: number;
}

export interface AuditStore {
  append(entry: AuditEntry): Promise<void>;
  getForEvent(eventId: string): Promise<AuditEntry[]>;
}

/** In-memory audit log for tests. Replace with append-only DB table in production. */
export class InMemoryAuditStore implements AuditStore {
  private readonly log: AuditEntry[] = [];

  async append(entry: AuditEntry): Promise<void> {
    this.log.push(entry);
  }

  async getForEvent(eventId: string): Promise<AuditEntry[]> {
    return this.log.filter((e) => e.event_id === eventId);
  }
}
