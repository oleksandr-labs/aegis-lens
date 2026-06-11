/**
 * Task 4 — Activation watcher (auto-pull on new UA-relevant product).
 *
 * Polls the EMS Rapid Mapping feed on a polite cadence, detects activations /
 * products that are NEW relative to a persisted seen-set, and filters to the
 * UA-relevant subset (country = UA or neighbours, by config). On a new relevant
 * activation it emits a pull-task the orchestrator can act on (download outputs,
 * convert to layers, raise a banner).
 *
 * State is injected (no hard storage dependency): pass a `SeenStore` backed by
 * KV / file / DB. The watcher is pure-ish — it never mutates global state itself.
 */

import { CopernicusEmsClient } from "./client";
import type { EmsActivation, EmsHazardType } from "./types";

/** Countries we treat as UA-relevant (war + spillover). */
export const UA_RELEVANT_COUNTRIES = ["UA", "MD", "PL", "RO", "SK", "BY"] as const;

/** Hazards we ingest into our layers (others are watched but not converted). */
export const RELEVANT_HAZARDS: EmsHazardType[] = ["flood", "fire", "conflict", "industrial"];

export interface SeenStore {
  has(code: string): Promise<boolean> | boolean;
  add(code: string): Promise<void> | void;
}

/** In-memory seen-store (default / tests). */
export class MemorySeenStore implements SeenStore {
  private set = new Set<string>();
  has(code: string): boolean {
    return this.set.has(code);
  }
  add(code: string): void {
    this.set.add(code);
  }
}

export interface WatcherConfig {
  client?: CopernicusEmsClient;
  store?: SeenStore;
  countries?: readonly string[];
  hazards?: EmsHazardType[];
  /** Minimum poll interval (ms) — enforced by the caller's scheduler. */
  pollIntervalMs?: number;
}

/** A task emitted when a new relevant activation is detected. */
export interface PullTask {
  activationCode: string;
  hazard: EmsHazardType;
  countries: string[];
  url: string;
  detectedAt: string;
  /** Why the orchestrator should act (display hint). */
  reason: { en: string; uk: string };
}

export class ActivationWatcher {
  private readonly client: CopernicusEmsClient;
  private readonly store: SeenStore;
  private readonly countries: readonly string[];
  private readonly hazards: EmsHazardType[];
  readonly pollIntervalMs: number;

  constructor(config: WatcherConfig = {}) {
    this.client = config.client ?? new CopernicusEmsClient();
    this.store = config.store ?? new MemorySeenStore();
    this.countries = config.countries ?? UA_RELEVANT_COUNTRIES;
    this.hazards = config.hazards ?? RELEVANT_HAZARDS;
    this.pollIntervalMs = config.pollIntervalMs ?? 30 * 60_000; // 30 min — polite
  }

  /** True if an activation is in scope (UA-relevant country + relevant hazard). */
  isRelevant(a: EmsActivation): boolean {
    const countryHit = a.countries.some((c) => this.countries.includes(c));
    const hazardHit = this.hazards.includes(a.hazard);
    return countryHit && hazardHit;
  }

  /**
   * One poll cycle: list activations, keep the relevant + unseen ones, mark them
   * seen, and return pull-tasks for the orchestrator. Idempotent across runs
   * thanks to the seen-store.
   */
  async poll(): Promise<PullTask[]> {
    const activations = await this.client.listActivations();
    const tasks: PullTask[] = [];
    for (const a of activations) {
      if (!this.isRelevant(a)) continue;
      if (await this.store.has(a.code)) continue;
      await this.store.add(a.code);
      tasks.push({
        activationCode: a.code,
        hazard: a.hazard,
        countries: a.countries,
        url: a.url,
        detectedAt: new Date().toISOString(),
        reason: {
          en: `New UA-relevant EMS activation ${a.code} (${a.hazard}) — auto-pull outputs.`,
          uk: `Нова релевантна для України активація EMS ${a.code} (${a.hazard}) — автозавантаження результатів.`,
        },
      });
    }
    return tasks;
  }
}
