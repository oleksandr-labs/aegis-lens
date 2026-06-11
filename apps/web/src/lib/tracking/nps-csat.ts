/**
 * NPS / CSAT / Customer Feedback Loops — voice-of-customer tracking,
 * detractor follow-up, promoter activation, and advisory board config.
 *
 * NPS / CSAT / Петлі зворотного зв'язку з клієнтами — відстеження голосу
 * клієнта, робота з детракторами, активація промоутерів та конфіг ради.
 *
 * Source: TODO/product_analytics/TODO_nps_csat.md
 */

// ── Core types ────────────────────────────────────────────────────────────

export type NpsScoreType = "detractor" | "passive" | "promoter";

export type CsatContext =
  | "support-resolution"
  | "feature-level"
  | "page-micro"
  | "copilot-message";

// ── Response interfaces ───────────────────────────────────────────────────

export interface NpsResponse {
  userId: string;
  /** Integer 0–10 */
  score: number;
  persona: string;
  locale: string;
  comment: string;
  respondedAt: string; // ISO 8601
}

export interface CsatResponse {
  userId: string;
  context: CsatContext;
  featureId?: string;
  thumbs: "up" | "down";
  respondedAt: string; // ISO 8601
}

// ── NPS classification ────────────────────────────────────────────────────

/**
 * Classify a raw NPS score into detractor / passive / promoter.
 * 0–6 = detractor, 7–8 = passive, 9–10 = promoter.
 *
 * Класифікувати сирий NPS-бал: 0–6 = детрактор, 7–8 = пасивний, 9–10 = промоутер.
 */
export function classifyNps(score: number): NpsScoreType {
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
}

// ── NPS schedule & ops ────────────────────────────────────────────────────

export const NPS_SCHEDULE = {
  cadence: "quarterly" as const,
  segmentByPersona: true,
  targetResponseRate_pct: 15,
} as const;

export const NPS_OPS = {
  detractorFollowUpSla_hours: 48,
  promoterActivation: ["case-studies", "referrals"] as const,
  voiceOfCustomerSummary: "per-quarter" as const,
} as const;

// ── Customer Advisory Board ───────────────────────────────────────────────

export const CUSTOMER_ADVISORY_BOARD = {
  topCustomerCount: 20,
  cadence: "quarterly-call" as const,
  description_en: "Top 20 customers meet quarterly for product feedback.",
  description_uk: "Топ-20 клієнтів зустрічаються щоквартально для зворотного зв'язку.",
} as const;

// ── Notes ─────────────────────────────────────────────────────────────────

export const NPS_NOTE_EN =
  "NPS is a smell test. Don't optimize for the number; optimize for the comments.";

export const NPS_NOTE_UK =
  "NPS — це індикатор. Не оптимізуйте число — оптимізуйте коментарі.";

// ── NPS in-memory store ───────────────────────────────────────────────────

export class NpsStore {
  private readonly _responses: NpsResponse[] = [];

  addNpsResponse(r: NpsResponse): void {
    this._responses.push(r);
  }

  /** Returns NPS score: promoters% - detractors% (range -100 to +100) */
  getScore(): number {
    if (this._responses.length === 0) return 0;
    const total = this._responses.length;
    const promoters = this._responses.filter((r) => classifyNps(r.score) === "promoter").length;
    const detractors = this._responses.filter((r) => classifyNps(r.score) === "detractor").length;
    return Math.round(((promoters - detractors) / total) * 100);
  }

  getByPersona(persona: string): NpsResponse[] {
    return this._responses.filter((r) => r.persona === persona);
  }
}

// ── CSAT in-memory store (ring buffer 2000) ───────────────────────────────

const CSAT_MAX = 2000;

export class CsatStore {
  private readonly _responses: CsatResponse[] = [];

  addCsatResponse(r: CsatResponse): void {
    if (this._responses.length >= CSAT_MAX) {
      this._responses.shift();
    }
    this._responses.push(r);
  }

  /** Returns ratio of "up" thumbs for a given context (0 if no data) */
  getThumbsUpRate(context: CsatContext): number {
    const subset = this._responses.filter((r) => r.context === context);
    if (subset.length === 0) return 0;
    const ups = subset.filter((r) => r.thumbs === "up").length;
    return Math.round((ups / subset.length) * 100 * 100) / 100;
  }
}

// ── Singletons ────────────────────────────────────────────────────────────

/** Singleton NPS store for application-wide NPS tracking */
export const npsStore = new NpsStore();

/** Singleton CSAT store for application-wide CSAT tracking */
export const csatStore = new CsatStore();
