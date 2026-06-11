/**
 * Task 10 — Cross-reference OVA posts with alerts.in.ua to VALIDATE alerts.
 *
 * alerts.in.ua is the lowest-latency siren feed; OVA channels are the highest
 * trust. Combining them lets us validate that a machine alert is real (an OVA
 * confirmed it) or flag a divergence (siren active but the OVA is reporting an
 * all-clear, or vice versa). This corroboration boosts/penalizes the confidence
 * the adapter forwards to the canonical Event.
 *
 * We REUSE the alerts.in.ua taxonomy (OblastCode, AlertStatus) via a relative
 * import — the same sibling-package pattern alerts-in-ua itself uses — so the two
 * feeds normalize to one shared oblast model. We read alert raise/clear intent
 * from OVA post text with a small, conservative phrase matcher (UA + RU).
 */

import type { OblastCode, AlertStatus } from "../../alerts-in-ua/src/types";
import type { OvaPost } from "./types";

/** Minimal shape of an alerts.in.ua observation we cross-check against. */
export interface AlertObservation {
  oblastCode: OblastCode;
  status: AlertStatus; // active | all_clear | partial_clear
  observedAt: string;
}

export type OvaSignal = "raise" | "clear" | "none";

const RAISE_PHRASES = [
  "повітряна тривога",
  "перебувайте в укритт",
  "загроза застосуванн",
  "балістик",
  "ракетна небезпека",
  "укриття",
  "воздушная тревога", // ru
  "угроза примен",
];
const CLEAR_PHRASES = [
  "відбій тривоги",
  "відбій повітряної",
  "загроза мину",
  "відбій",
  "отбой тревоги", // ru
];

/** Read raise/clear intent from an OVA post body (conservative). */
export function readOvaSignal(post: OvaPost): OvaSignal {
  const t = post.textUk.toLowerCase();
  // Clear takes precedence only if an explicit "відбій/отбой" appears.
  if (CLEAR_PHRASES.some((p) => t.includes(p))) return "clear";
  if (RAISE_PHRASES.some((p) => t.includes(p))) return "raise";
  return "none";
}

export type Validation = "confirmed" | "contradicted" | "uncorroborated" | "ova_only";

export interface ValidationResult {
  oblastCode: OblastCode;
  alertStatus?: AlertStatus;
  ovaSignal: OvaSignal;
  result: Validation;
  /** Confidence delta to apply to the cross-referenced event (-0.3..+0.2). */
  confidenceDelta: number;
  note: { uk: string; en: string };
}

/**
 * Cross-reference a single OVA post against the current alerts.in.ua status for
 * its oblast.
 *
 * - active siren + OVA raise  → confirmed (+)
 * - active siren + OVA clear   → contradicted (−, surface for review)
 * - all_clear  + OVA clear     → confirmed (+)
 * - all_clear  + OVA raise     → contradicted (−)
 * - no matching alert + OVA raise → ova_only (OVA leads; mild +)
 * - OVA none                    → uncorroborated (0)
 */
export function crossReference(
  post: OvaPost,
  alert: AlertObservation | undefined,
): ValidationResult {
  const ovaSignal = readOvaSignal(post);
  const alertActive = alert?.status === "active" || alert?.status === "partial_clear";
  const alertClear = alert?.status === "all_clear";

  let result: Validation = "uncorroborated";
  let confidenceDelta = 0;

  if (ovaSignal === "none") {
    result = "uncorroborated";
  } else if (!alert) {
    result = "ova_only";
    confidenceDelta = ovaSignal === "raise" ? 0.1 : 0;
  } else if ((alertActive && ovaSignal === "raise") || (alertClear && ovaSignal === "clear")) {
    result = "confirmed";
    confidenceDelta = 0.2;
  } else if ((alertActive && ovaSignal === "clear") || (alertClear && ovaSignal === "raise")) {
    result = "contradicted";
    confidenceDelta = -0.3;
  }

  const NOTES: Record<Validation, { uk: string; en: string }> = {
    confirmed: { uk: "ОВА підтверджує статус тривоги", en: "OVA confirms the alert status" },
    contradicted: { uk: "ОВА суперечить статусу тривоги — на перевірку", en: "OVA contradicts the alert — flag for review" },
    uncorroborated: { uk: "ОВА не згадує тривогу", en: "OVA does not mention the alert" },
    ova_only: { uk: "Сигнал лише від ОВА (без alerts.in.ua)", en: "OVA-only signal (no alerts.in.ua match)" },
  };

  return {
    oblastCode: post.oblastCode,
    alertStatus: alert?.status,
    ovaSignal,
    result,
    confidenceDelta,
    note: NOTES[result],
  };
}
