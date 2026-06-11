/**
 * Saved search persistence: store named searches, execute on demand or scheduled.
 */

import type { SearchQuery, SearchResult } from "./types";

export interface SavedSearch {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  query: SearchQuery;
  description?: string;
  isShared: boolean;
  schedule?: {
    intervalHours: number;
    lastRunAt?: string;
    nextRunAt?: string;
  };
  resultCount?: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearchStore {
  create(search: Omit<SavedSearch, "id" | "createdAt" | "updatedAt">): Promise<SavedSearch>;
  update(id: string, patch: Partial<Pick<SavedSearch, "name" | "query" | "description" | "isShared" | "schedule">>): Promise<SavedSearch | null>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<SavedSearch | null>;
  listByUser(orgId: string, userId: string): Promise<SavedSearch[]>;
  listDue(before: Date): Promise<SavedSearch[]>;
  recordRun(id: string, resultCount: number): Promise<void>;
}

export class InMemorySavedSearchStore implements SavedSearchStore {
  private readonly searches = new Map<string, SavedSearch>();

  async create(search: Omit<SavedSearch, "id" | "createdAt" | "updatedAt">): Promise<SavedSearch> {
    const now = new Date().toISOString();
    const created: SavedSearch = { ...search, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.searches.set(created.id, created);
    return { ...created };
  }

  async update(id: string, patch: Partial<Pick<SavedSearch, "name" | "query" | "description" | "isShared" | "schedule">>): Promise<SavedSearch | null> {
    const existing = this.searches.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.searches.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.searches.delete(id);
  }

  async getById(id: string): Promise<SavedSearch | null> {
    return this.searches.get(id) ?? null;
  }

  async listByUser(orgId: string, userId: string): Promise<SavedSearch[]> {
    return [...this.searches.values()].filter(
      (s) => s.orgId === orgId && (s.userId === userId || s.isShared),
    );
  }

  async listDue(before: Date): Promise<SavedSearch[]> {
    return [...this.searches.values()].filter(
      (s) => s.schedule?.nextRunAt && new Date(s.schedule.nextRunAt) <= before,
    );
  }

  async recordRun(id: string, resultCount: number): Promise<void> {
    const search = this.searches.get(id);
    if (!search) return;
    const now = new Date().toISOString();
    const patch: Partial<SavedSearch> = { resultCount, lastRunAt: now, updatedAt: now };
    if (search.schedule) {
      const nextRun = new Date(
        Date.now() + search.schedule.intervalHours * 3_600_000,
      );
      patch.schedule = { ...search.schedule, lastRunAt: now, nextRunAt: nextRun.toISOString() };
    }
    Object.assign(search, patch);
  }
}

export class SavedSearchExecutor {
  constructor(
    private readonly store: SavedSearchStore,
    private readonly executeFn: (query: SearchQuery) => Promise<SearchResult>,
  ) {}

  async runById(id: string): Promise<SearchResult | null> {
    const saved = await this.store.getById(id);
    if (!saved) return null;

    const result = await this.executeFn(saved.query);
    await this.store.recordRun(id, result.total);
    return result;
  }

  async runDue(): Promise<{ id: string; name: string; resultCount: number }[]> {
    const due = await this.store.listDue(new Date());
    const results: { id: string; name: string; resultCount: number }[] = [];

    for (const search of due) {
      try {
        const result = await this.executeFn(search.query);
        await this.store.recordRun(search.id, result.total);
        results.push({ id: search.id, name: search.name, resultCount: result.total });
      } catch {
        // Skip on error — will retry next schedule cycle
      }
    }

    return results;
  }
}
