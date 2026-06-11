import { randomUUID } from "crypto";
import type {
  Experiment,
  ExperimentStatus,
  ExperimentVariant,
  Hypothesis,
  Eligibility,
  ExperimentType,
} from "./types";

export type ExperimentCreate = {
  name: string;
  description?: string;
  type?: ExperimentType;
  variants: ExperimentVariant[];
  eligibility?: Eligibility;
  hypothesis: Hypothesis;
  safetyExcluded?: boolean;
};

export type ExperimentUpdate = Partial<
  Pick<Experiment, "name" | "description" | "status" | "eligibility" | "winnerVariantKey" | "lessonLearned">
>;

export class ExperimentRegistry {
  private readonly store = new Map<string, Experiment>();

  list(statusFilter?: ExperimentStatus): Experiment[] {
    const all = Array.from(this.store.values());
    return statusFilter ? all.filter((e) => e.status === statusFilter) : all;
  }

  get(id: string): Experiment | undefined {
    return this.store.get(id);
  }

  create(data: ExperimentCreate): Experiment {
    const now = new Date().toISOString();
    const totalWeight = data.variants.reduce((s, v) => s + v.weight, 0);
    if (totalWeight > 100) {
      throw new Error(`Variant weights sum to ${totalWeight} — must be ≤ 100`);
    }

    const experiment: Experiment = {
      id: randomUUID(),
      name: data.name,
      description: data.description,
      type: data.type ?? "ab",
      status: "draft",
      variants: data.variants,
      eligibility: data.eligibility ?? {},
      hypothesis: data.hypothesis,
      safetyExcluded: data.safetyExcluded ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(experiment.id, experiment);
    return experiment;
  }

  update(id: string, data: ExperimentUpdate): Experiment | null {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: Experiment = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return updated;
  }

  start(id: string): Experiment | null {
    const e = this.store.get(id);
    if (!e || e.status !== "draft") return null;
    return this.update(id, { status: "running" as ExperimentStatus });
  }

  pause(id: string): Experiment | null {
    const e = this.store.get(id);
    if (!e || e.status !== "running") return null;
    return this.update(id, { status: "paused" as ExperimentStatus });
  }

  ship(id: string, winnerVariantKey: string): Experiment | null {
    const e = this.store.get(id);
    if (!e) return null;
    if (!e.variants.some((v) => v.key === winnerVariantKey)) {
      throw new Error(`Variant "${winnerVariantKey}" not found in experiment`);
    }
    const updated = { ...e, status: "shipped" as ExperimentStatus, winnerVariantKey, endedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return updated;
  }

  kill(id: string, lessonLearned: string): Experiment | null {
    const e = this.store.get(id);
    if (!e) return null;
    const updated = { ...e, status: "killed" as ExperimentStatus, lessonLearned, endedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return updated;
  }
}
