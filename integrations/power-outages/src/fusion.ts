import type { OutageSignal, OutageEvent, OutageCause, OutageStatus } from "./types";
import { randomUUID } from "crypto";

const SOURCE_WEIGHTS: Record<string, number> = {
  scheduled_blackout: 1.0,
  telegram_channel:   0.75,
  cloudflare_radar:   0.6,
  community_report:   0.5,
  viirs_nightlights:  0.8,
};

const OBLAST_NAMES: Record<string, { en: string; uk: string }> = {
  "UA-71": { en: "Cherkasy",    uk: "Черкаська" },
  "UA-74": { en: "Chernihiv",   uk: "Чернігівська" },
  "UA-77": { en: "Chernivtsi",  uk: "Чернівецька" },
  "UA-12": { en: "Dnipropetrovsk", uk: "Дніпропетровська" },
  "UA-14": { en: "Donetsk",     uk: "Донецька" },
  "UA-26": { en: "Ivano-Frankivsk", uk: "Івано-Франківська" },
  "UA-63": { en: "Kharkiv",     uk: "Харківська" },
  "UA-65": { en: "Kherson",     uk: "Херсонська" },
  "UA-68": { en: "Khmelnytskyi", uk: "Хмельницька" },
  "UA-35": { en: "Kirovohrad",  uk: "Кіровоградська" },
  "UA-30": { en: "Kyiv City",   uk: "м. Київ" },
  "UA-32": { en: "Kyiv",        uk: "Київська" },
  "UA-09": { en: "Luhansk",     uk: "Луганська" },
  "UA-46": { en: "Lviv",        uk: "Львівська" },
  "UA-48": { en: "Mykolaiv",    uk: "Миколаївська" },
  "UA-51": { en: "Odesa",       uk: "Одеська" },
  "UA-53": { en: "Poltava",     uk: "Полтавська" },
  "UA-56": { en: "Rivne",       uk: "Рівненська" },
  "UA-59": { en: "Sumy",        uk: "Сумська" },
  "UA-61": { en: "Ternopil",    uk: "Тернопільська" },
  "UA-05": { en: "Vinnytsia",   uk: "Вінницька" },
  "UA-07": { en: "Volyn",       uk: "Волинська" },
  "UA-21": { en: "Zakarpattia", uk: "Закарпатська" },
  "UA-23": { en: "Zaporizhzhia", uk: "Запорізька" },
  "UA-18": { en: "Zhytomyr",    uk: "Житомирська" },
};

function coverageSeverity(coverage: number): 1 | 2 | 3 | 4 | 5 {
  if (coverage >= 0.8) return 5;
  if (coverage >= 0.6) return 4;
  if (coverage >= 0.4) return 3;
  if (coverage >= 0.2) return 2;
  return 1;
}

function dominantCause(signals: OutageSignal[]): OutageCause {
  const counts: Record<OutageCause, number> = {
    damage: 0, scheduled: 0, weather: 0, unknown: 0,
  };
  for (const s of signals) {
    counts[s.cause] = (counts[s.cause] ?? 0) + s.confidence;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown") as OutageCause;
}

function weightedConfidence(signals: OutageSignal[]): number {
  if (signals.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const s of signals) {
    const w = SOURCE_WEIGHTS[s.source] ?? 0.5;
    weightedSum += s.confidence * w;
    totalWeight += w;
  }
  return totalWeight > 0 ? Math.min(1, weightedSum / totalWeight) : 0;
}

function avgCoverage(signals: OutageSignal[]): number {
  const withCoverage = signals.filter((s) => s.estimatedCoverage != null);
  if (withCoverage.length === 0) return 0.3;
  return withCoverage.reduce((sum, s) => sum + (s.estimatedCoverage ?? 0), 0) / withCoverage.length;
}

function buildSummary(
  regionEn: string,
  regionUk: string,
  cause: OutageCause,
  severity: number,
  coverage: number,
  status: OutageStatus,
): { en: string; uk: string } {
  const pct = Math.round(coverage * 100);
  const causeEn: Record<OutageCause, string> = {
    damage: "infrastructure damage", scheduled: "scheduled blackout",
    weather: "severe weather", unknown: "undetermined cause",
  };
  const causeUk: Record<OutageCause, string> = {
    damage: "пошкодження інфраструктури", scheduled: "планові відключення",
    weather: "несприятливих погодних умов", unknown: "невстановленої причини",
  };
  const statusEn = status === "active" ? "ongoing" : status === "restored" ? "restored" : status;
  const statusUk = status === "active" ? "триваючі" : status === "restored" ? "відновлено" : status;
  return {
    en: `${regionEn} oblast: ${statusEn} power outage (~${pct}% affected) due to ${causeEn[cause]}. Severity: ${severity}/5.`,
    uk: `${regionUk} область: ${statusUk} відключення електроенергії (~${pct}% постраждало) через ${causeUk[cause]}. Рівень: ${severity}/5.`,
  };
}

/**
 * Fuse multiple OutageSignals (potentially from different sources) into
 * a list of OutageEvents, one per region-code.
 */
export function fuseSignals(signals: OutageSignal[]): OutageEvent[] {
  const byRegion = new Map<string, OutageSignal[]>();
  for (const s of signals) {
    const arr = byRegion.get(s.regionCode) ?? [];
    arr.push(s);
    byRegion.set(s.regionCode, arr);
  }

  const events: OutageEvent[] = [];

  for (const [regionCode, regionSignals] of byRegion) {
    const conf = weightedConfidence(regionSignals);
    if (conf < 0.3) continue; // below noise floor

    const coverage = avgCoverage(regionSignals);
    const cause = dominantCause(regionSignals);
    const severity = coverageSeverity(coverage);
    const status: OutageStatus =
      cause === "scheduled" ? "scheduled" : conf >= 0.7 ? "active" : "partial";

    const earliest = regionSignals
      .map((s) => s.detectedAt)
      .sort()[0];

    const names = OBLAST_NAMES[regionCode] ?? { en: regionCode, uk: regionCode };
    const summary = buildSummary(names.en, names.uk, cause, severity, coverage, status);

    events.push({
      outageId: randomUUID(),
      regionCode,
      regionName: names.en,
      status,
      cause,
      confidence: parseFloat(conf.toFixed(2)),
      coverage: parseFloat(coverage.toFixed(2)),
      severity,
      startedAt: earliest,
      estimatedRestorationAt: null,
      restoredAt: null,
      signals: regionSignals,
      summaryEn: summary.en,
      summaryUk: summary.uk,
    });
  }

  return events.sort((a, b) => b.severity - a.severity);
}
