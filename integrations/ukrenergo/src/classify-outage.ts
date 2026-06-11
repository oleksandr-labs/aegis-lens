/**
 * Emergency-shutdown vs scheduled distinguishing.
 *
 * The single most important civilian distinction: a *scheduled* rotation is
 * predictable (you know when power returns); an *emergency* shutdown is not.
 * This classifier combines:
 *   - the parsed schedule kind (from provider-adapters)
 *   - provider prose wording (uk/ru keyword cues)
 *   - whether a per-group timetable exists (emergencies often lack one)
 * into a confident OutageKind + a localized rationale.
 */

import type { RegionSchedule, OutageKind, OutageCause, LocalizedText } from "./types";

export interface OutageClassification {
  regionCode: string;
  kind: OutageKind;
  /** Mapped cause for the power-outages OutageSignal. */
  cause: OutageCause;
  /** Confidence in the classification, 0–1. */
  confidence: number;
  /** Whether the outage timing is predictable for civilians. */
  predictable: boolean;
  rationale: LocalizedText;
}

const EMERGENCY_CUES = /аварійн|екстрен|аварийн|экстренн|emergency|знеструмлен|обесточен/i;
const STABILIZATION_CUES = /стабілізаційн|стабилизацион|гсв/i;
const SCHEDULED_CUES = /погодинн|почасов|графік|график|гпв|за графіком|scheduled/i;
const RESTORED_CUES = /відновлен|восстановлен|повернул|restored|подано світло/i;

function kindToCause(kind: OutageKind): OutageCause {
  switch (kind) {
    case "emergency":
      return "damage";          // emergency shutdowns follow strikes/faults
    case "scheduled":
    case "stabilization":
      return "scheduled";
    case "restored":
      return "scheduled";
    default:
      return "unknown";
  }
}

function rationaleFor(kind: OutageKind, hasGrid: boolean): LocalizedText {
  switch (kind) {
    case "emergency":
      return {
        uk: "Екстрені (аварійні) відключення — час повернення світла непередбачуваний.",
        ru: "Экстренные (аварийные) отключения — время восстановления непредсказуемо.",
        en: "Emergency (unscheduled) shutdowns — restoration time is unpredictable.",
      };
    case "stabilization":
      return {
        uk: "Стабілізаційні відключення за графіком черг.",
        ru: "Стабилизационные отключения по графику очередей.",
        en: "Stabilization shutdowns following the queue schedule.",
      };
    case "scheduled":
      return hasGrid
        ? {
            uk: "Планові погодинні відключення — діє графік за чергами.",
            ru: "Плановые почасовые отключения — действует график по очередям.",
            en: "Scheduled rotating outages — a per-queue timetable is in effect.",
          }
        : {
            uk: "Оголошено графік відключень; детальний розклад черг ще уточнюється.",
            ru: "Объявлен график отключений; детальное расписание очередей уточняется.",
            en: "An outage schedule is announced; the per-queue timetable is still being refined.",
          };
    case "restored":
      return {
        uk: "Електропостачання відновлено.",
        ru: "Электроснабжение восстановлено.",
        en: "Power supply restored.",
      };
    default:
      return {
        uk: "Тип відключень не визначено.",
        ru: "Тип отключений не определён.",
        en: "Outage type undetermined.",
      };
  }
}

/**
 * Classify a parsed schedule. `extraText` lets the caller pass the raw provider
 * notice when the schedule itself carried no group grid.
 */
export function classifyOutage(schedule: RegionSchedule, extraText = ""): OutageClassification {
  const hasGrid = schedule.groups.length > 0;
  const text = `${extraText}`;
  let kind: OutageKind = schedule.kind;

  // Prose cues can override an "unknown"/weak adapter verdict.
  if (RESTORED_CUES.test(text)) kind = "restored";
  else if (EMERGENCY_CUES.test(text)) kind = "emergency";
  else if (STABILIZATION_CUES.test(text)) kind = kind === "scheduled" ? "stabilization" : kind;
  else if (kind === "unknown" && SCHEDULED_CUES.test(text)) kind = "scheduled";

  // Confidence: strong when adapter+prose agree or a grid backs a scheduled call.
  let confidence = 0.5;
  if (kind === "emergency" && EMERGENCY_CUES.test(text)) confidence = 0.9;
  else if (kind === "emergency") confidence = 0.75;
  else if ((kind === "scheduled" || kind === "stabilization") && hasGrid) confidence = 0.9;
  else if (kind === "scheduled" || kind === "stabilization") confidence = 0.7;
  else if (kind === "restored") confidence = 0.8;
  else confidence = 0.4;

  const predictable = kind === "scheduled" || kind === "stabilization";

  return {
    regionCode: schedule.regionCode,
    kind,
    cause: kindToCause(kind),
    confidence: parseFloat(confidence.toFixed(2)),
    predictable,
    rationale: rationaleFor(kind, hasGrid),
  };
}
