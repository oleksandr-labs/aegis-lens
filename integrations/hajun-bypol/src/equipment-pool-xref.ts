/**
 * Cross-reference Belarus sightings with RU equipment-pool inventories.
 *
 * OSINT projects maintain inventories of the Russian military's equipment pools
 * — depots/storage bases holding reserves of tanks, SAMs, aircraft, etc., with
 * tracked draw-down counts. Matching a BY sighting against these pools answers
 * "where did this unit likely come from, and is the source pool being drained?"
 * which strengthens attribution and gives a strategic read on reserves.
 *
 * This module provides a typed pool-inventory model + a matcher that scores a
 * sighting against candidate source pools by equipment-class/model compatibility
 * and (optionally) reported draw-down activity. Demo-safe: pure functions + a
 * small fixture pool. The matcher never invents serial numbers; it produces a
 * ranked, explainable candidate list.
 */

import type { HajunSighting, EquipmentClass, EquipmentModel } from "./types";

/** A Russian equipment-pool / storage base inventory entry. */
export interface EquipmentPoolEntry {
  poolId: string;
  nameEn: string;
  nameUk: string;
  /** [lon, lat] of the storage base. */
  lonlat: [number, number];
  /** Equipment classes this pool is known to hold. */
  classes: EquipmentClass[];
  /** Specific models tracked at this pool, if known. */
  models?: EquipmentModel[];
  /** Estimated units remaining (OSINT count), if tracked. */
  estimatedRemaining?: number;
  /** Net change over the last tracked period (negative = draw-down). */
  recentDelta?: number;
  /** Provenance of the inventory entry. */
  sourceUrl?: string;
}

/** A scored match between a sighting and a candidate source pool. */
export interface PoolMatch {
  eventId: string;
  poolId: string;
  poolNameEn: string;
  poolNameUk: string;
  /** 0..1 compatibility score. */
  score: number;
  /** Whether the pool's model set explicitly includes the sighting's model. */
  modelMatch: boolean;
  /** Whether the pool shows recent draw-down (consistent with deployment). */
  drawdownConsistent: boolean;
  reasonsEn: string[];
  reasonsUk: string[];
}

// ── Fixture: a few RU equipment pools (synthetic OSINT-style entries) ──────────

export const DEMO_POOLS: EquipmentPoolEntry[] = [
  {
    poolId: "pool_buy_1311",
    nameEn: "1311 Storage Base (armor)",
    nameUk: "1311 база зберігання (бронетехніка)",
    lonlat: [41.55, 58.48],
    classes: ["armor", "rail_echelon"],
    models: ["t72", "t80", "bmp", "btr"],
    estimatedRemaining: 480,
    recentDelta: -36,
    sourceUrl: "https://osint.example/pools/1311",
  },
  {
    poolId: "pool_sam_west",
    nameEn: "Western SAM reserve",
    nameUk: "Західний резерв ЗРК",
    lonlat: [30.34, 59.94],
    classes: ["sam_system"],
    models: ["s300", "s400", "pantsir", "buk"],
    estimatedRemaining: 24,
    recentDelta: -2,
    sourceUrl: "https://osint.example/pools/sam-west",
  },
  {
    poolId: "pool_iskander_bde",
    nameEn: "Iskander brigade pool",
    nameUk: "Ракетна бригада (Іскандер)",
    lonlat: [20.45, 54.71],
    classes: ["missile_system"],
    models: ["iskander_m", "iskander_k"],
    estimatedRemaining: 12,
    recentDelta: -1,
    sourceUrl: "https://osint.example/pools/iskander",
  },
];

export interface PoolXrefOptions {
  /** Minimum score to keep a candidate. Default 0.4. */
  minScore?: number;
  /** Max candidates to return per sighting. Default 3. */
  maxCandidates?: number;
}

/** Score one sighting against the pool inventory; returns ranked candidates. */
export function matchPools(
  sighting: HajunSighting,
  pools: EquipmentPoolEntry[] = DEMO_POOLS,
  opts: PoolXrefOptions = {},
): PoolMatch[] {
  const minScore = opts.minScore ?? 0.4;
  const maxCandidates = opts.maxCandidates ?? 3;
  const cls = sighting.equipment.class;
  const model = sighting.equipment.model;

  const matches: PoolMatch[] = [];
  for (const pool of pools) {
    if (!pool.classes.includes(cls)) continue;

    const reasonsEn: string[] = [`Pool holds equipment class "${cls}".`];
    const reasonsUk: string[] = [`Пул містить клас техніки «${cls}».`];
    let score = 0.5;

    const modelMatch = !!model && !!pool.models?.includes(model);
    if (modelMatch) {
      score += 0.3;
      reasonsEn.push(`Model ${model} tracked at this pool.`);
      reasonsUk.push(`Модель ${model} обліковується в цьому пулі.`);
    }

    const drawdownConsistent = typeof pool.recentDelta === "number" && pool.recentDelta < 0;
    if (drawdownConsistent) {
      score += 0.2;
      reasonsEn.push(`Pool shows recent draw-down (${pool.recentDelta}).`);
      reasonsUk.push(`Пул демонструє нещодавнє зменшення (${pool.recentDelta}).`);
    }

    const finalScore = clamp(score);
    if (finalScore >= minScore) {
      matches.push({
        eventId: sighting.eventId,
        poolId: pool.poolId,
        poolNameEn: pool.nameEn,
        poolNameUk: pool.nameUk,
        score: finalScore,
        modelMatch,
        drawdownConsistent,
        reasonsEn,
        reasonsUk,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, maxCandidates);
}

/** Batch helper across many sightings. */
export function matchPoolsBatch(
  sightings: HajunSighting[],
  pools: EquipmentPoolEntry[] = DEMO_POOLS,
  opts: PoolXrefOptions = {},
): Record<string, PoolMatch[]> {
  const out: Record<string, PoolMatch[]> = {};
  for (const s of sightings) out[s.eventId] = matchPools(s, pools, opts);
  return out;
}

/** Attach pool xref ids back onto sightings (top candidate per sighting). */
export function applyPoolXref(
  sightings: HajunSighting[],
  pools: EquipmentPoolEntry[] = DEMO_POOLS,
  opts: PoolXrefOptions = {},
): HajunSighting[] {
  return sightings.map((s) => {
    const cands = matchPools(s, pools, opts);
    if (!cands.length) return s;
    return { ...s, poolXrefIds: cands.map((c) => c.poolId) };
  });
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
