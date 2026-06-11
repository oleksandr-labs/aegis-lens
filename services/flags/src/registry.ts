/**
 * Feature flag registry: CRUD + audit log + sunset warnings.
 */

import type { FeatureFlag, FlagChangeEvent, EvaluationContext, EvaluationResult } from "./types";
import { evaluateFlag } from "./evaluator";

const SUNSET_WARNING_DAYS = 90;

export interface FlagStore {
  getAll(): Promise<FeatureFlag[]>;
  getByKey(key: string): Promise<FeatureFlag | null>;
  upsert(flag: FeatureFlag, changedBy: string): Promise<FeatureFlag>;
  delete(key: string, changedBy: string): Promise<boolean>;
  getAuditLog(key?: string, limit?: number): Promise<FlagChangeEvent[]>;
}

export class FlagRegistry {
  constructor(private readonly store: FlagStore) {}

  async isEnabled(key: string, ctx: EvaluationContext): Promise<boolean> {
    const flag = await this.store.getByKey(key);
    if (!flag) return false;
    return evaluateFlag(flag, ctx).enabled;
  }

  async evaluate(key: string, ctx: EvaluationContext): Promise<EvaluationResult> {
    const flag = await this.store.getByKey(key);
    if (!flag) return { enabled: false, reason: "disabled" };
    return evaluateFlag(flag, ctx);
  }

  async evaluateAll(ctx: EvaluationContext): Promise<Record<string, EvaluationResult>> {
    const flags = await this.store.getAll();
    const results: Record<string, EvaluationResult> = {};
    for (const flag of flags) {
      results[flag.key] = evaluateFlag(flag, ctx);
    }
    return results;
  }

  /** Returns flags approaching or past their sunset date */
  async getSunsetWarnings(): Promise<{ flag: FeatureFlag; daysRemaining: number }[]> {
    const flags = await this.store.getAll();
    const now = Date.now();
    return flags
      .filter((f) => f.sunsetAt)
      .map((f) => ({
        flag: f,
        daysRemaining: Math.ceil((new Date(f.sunsetAt!).getTime() - now) / 86_400_000),
      }))
      .filter(({ daysRemaining }) => daysRemaining <= SUNSET_WARNING_DAYS)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }
}

export class InMemoryFlagStore implements FlagStore {
  private readonly flags = new Map<string, FeatureFlag>();
  private readonly auditLog: FlagChangeEvent[] = [];

  async getAll(): Promise<FeatureFlag[]> {
    return [...this.flags.values()];
  }

  async getByKey(key: string): Promise<FeatureFlag | null> {
    return this.flags.get(key) ?? null;
  }

  async upsert(flag: FeatureFlag, changedBy: string): Promise<FeatureFlag> {
    const existing = this.flags.get(flag.key);
    const now = new Date().toISOString();
    const updated = { ...flag, updatedAt: now, createdAt: existing?.createdAt ?? now };
    this.flags.set(flag.key, updated);
    this.auditLog.push({
      flagKey: flag.key,
      changedBy,
      before: existing ?? {},
      after: updated,
      timestamp: now,
    });
    return { ...updated };
  }

  async delete(key: string, changedBy: string): Promise<boolean> {
    const existing = this.flags.get(key);
    if (!existing) return false;
    this.flags.delete(key);
    this.auditLog.push({
      flagKey: key,
      changedBy,
      before: existing,
      after: {},
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  async getAuditLog(key?: string, limit = 100): Promise<FlagChangeEvent[]> {
    let events = key ? this.auditLog.filter((e) => e.flagKey === key) : this.auditLog;
    return events.slice(-limit).reverse();
  }
}
