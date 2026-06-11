/**
 * Curated milblogger / OSINT account registry.
 *
 * EDITORIALLY CURATED — NOT ALGORITHMIC. Quality over quantity.
 * Every entry is admitted by a human editor via the vetting gate (vetting.ts).
 *
 * SIDE-LABELLING POLICY:
 *   - `side` ("ua" | "ru" | "int") is mandatory and structural. It is never
 *     dropped or normalized downstream (see side-label.ts).
 *   - RU-side accounts are admitted ONLY to surface the opposing narrative for
 *     comparison/analysis. They carry a mandatory `oppositionLabel` and are
 *     NEVER presented as neutral, equivalent, or trustworthy reporting.
 *   - There is NO false equivalence between sides. A RU-side account claiming an
 *     event is rendered as an *opposing claim to be checked*, not as corroboration.
 *
 * Reputation seeds are EDITORIAL priors; they evolve at runtime (reputation.ts,
 * misinfo-flag.ts). Handles below are illustrative curated examples for the demo
 * fixture and the public methodology page.
 */

import type { MilbloggerAccount } from "./types";

export const MILBLOGGER_REGISTRY: MilbloggerAccount[] = [
  // ── UA-side: official / war correspondents / OSINT analysts ────────────────
  {
    id: "telegram:khorne_group",
    handle: "khorne_group",
    platform: "telegram",
    name: "Khorne Group",
    side: "ua",
    description: {
      en: "Ukrainian OSINT collective — strike geolocation and BDA.",
      uk: "Українська OSINT-спільнота — геолокація ударів та оцінка наслідків.",
      ru: "Украинское OSINT-сообщество — геолокация ударов и оценка последствий.",
    },
    language: "uk",
    regions: ["UA"],
    reputation: 0.82,
    tags: ["geolocation", "frontline", "drones"],
    trackRecord: "Multi-year public OSINT collective with corroborated geolocations.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
  {
    id: "telegram:tryzub_osint",
    handle: "tryzub_osint",
    platform: "telegram",
    name: "Tryzub",
    side: "ua",
    description: {
      en: "Ukrainian analytical channel — front-line situation reports.",
      uk: "Український аналітичний канал — зведення з лінії фронту.",
      ru: "Украинский аналитический канал — сводки с линии фронта.",
    },
    language: "uk",
    regions: ["UA"],
    reputation: 0.78,
    tags: ["frontline", "analysis"],
    trackRecord: "Established analytical channel with consistent attributed reporting.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
  {
    id: "x:DeepStateUA",
    handle: "DeepStateUA",
    platform: "x",
    name: "DeepState UA",
    side: "ua",
    description: {
      en: "Ukrainian OSINT mapping project — control-line analytics.",
      uk: "Український OSINT-проєкт картографування — аналітика лінії контролю.",
      ru: "Украинский OSINT-проект картографирования — аналитика линии контроля.",
    },
    language: "uk",
    regions: ["UA"],
    reputation: 0.8,
    tags: ["frontline", "geolocation", "analysis"],
    trackRecord: "Publicly attributable mapping project, corroborated by ground reports.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
  {
    id: "x:Maksymeisenhart",
    handle: "war_correspondent_ua",
    platform: "x",
    name: "UA War Correspondent (illustrative)",
    side: "ua",
    description: {
      en: "Accredited Ukrainian war correspondent — field dispatches.",
      uk: "Акредитований український воєнний кореспондент — польові репортажі.",
      ru: "Аккредитованный украинский военный корреспондент — полевые репортажи.",
    },
    language: "uk",
    regions: ["UA"],
    reputation: 0.76,
    tags: ["frontline", "humanitarian"],
    trackRecord: "Accredited journalist with named byline and verifiable employer.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },

  // ── INT-side: international OSINT (verified-identity organizations) ─────────
  {
    id: "x:bellingcat",
    handle: "bellingcat",
    platform: "x",
    name: "Bellingcat",
    side: "int",
    description: {
      en: "Independent international investigative collective.",
      uk: "Незалежна міжнародна команда журналістських розслідувань.",
      ru: "Независимая международная команда журналистских расследований.",
    },
    language: "en",
    regions: ["ALL"],
    reputation: 0.88,
    tags: ["investigative", "geolocation", "war_crimes"],
    trackRecord: "Established investigative organization with published methodology.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
  {
    id: "x:Conflicts",
    handle: "Conflicts",
    platform: "x",
    name: "ConflictNews",
    side: "int",
    description: {
      en: "International conflict-monitoring aggregator.",
      uk: "Міжнародний агрегатор моніторингу конфліктів.",
      ru: "Международный агрегатор мониторинга конфликтов.",
    },
    language: "en",
    regions: ["ALL"],
    reputation: 0.7,
    tags: ["frontline", "analysis"],
    trackRecord: "Long-running monitoring account with consistent sourcing.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
  {
    id: "x:GeoConfirmed",
    handle: "GeoConfirmed",
    platform: "x",
    name: "GeoConfirmed",
    side: "int",
    description: {
      en: "Community geolocation-verification project.",
      uk: "Спільнотний проєкт верифікації геолокації.",
      ru: "Сообщественный проект верификации геолокации.",
    },
    language: "en",
    regions: ["ALL"],
    reputation: 0.85,
    tags: ["geolocation", "equipment_id"],
    trackRecord: "Methodology-driven geolocation verification with public archive.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },

  // ── RU-side: OPPOSITE-NARRATIVE TRACKING ONLY — mandatory opposition label ──
  // These are NOT trusted sources. They are admitted solely so editors can
  // compare how the same event is framed by the opposing side. NEVER used as
  // corroboration and NEVER presented as equivalent to UA/INT reporting.
  {
    id: "telegram:ru_milblogger_a",
    handle: "ru_milblogger_a",
    platform: "telegram",
    name: "RU Milblogger A (opposition-tracked)",
    side: "ru",
    oppositionLabel: {
      en: "OPPOSING NARRATIVE — tracked for analysis only; not a trusted source.",
      uk: "ПРОТИЛЕЖНИЙ НАРАТИВ — відстежується лише для аналізу; не є надійним джерелом.",
      ru: "ПРОТИВОПОЛОЖНЫЙ НАРРАТИВ — отслеживается только для анализа; не является надёжным источником.",
    },
    description: {
      en: "Russian pro-war milblogger — tracked for opposite-narrative framing.",
      uk: "Російський провоєнний мілблогер — відстежується для аналізу протилежного наративу.",
      ru: "Российский провоенный милблогер — отслеживается для анализа противоположного нарратива.",
    },
    language: "ru",
    regions: ["UA"],
    reputation: 0.25,
    tags: ["propaganda_analysis", "frontline"],
    trackRecord: "Publicly identifiable RU pro-war channel; admitted for narrative comparison only.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
  {
    id: "telegram:ru_milblogger_b",
    handle: "ru_milblogger_b",
    platform: "telegram",
    name: "RU Milblogger B (opposition-tracked)",
    side: "ru",
    oppositionLabel: {
      en: "OPPOSING NARRATIVE — tracked for analysis only; not a trusted source.",
      uk: "ПРОТИЛЕЖНИЙ НАРАТИВ — відстежується лише для аналізу; не є надійним джерелом.",
      ru: "ПРОТИВОПОЛОЖНЫЙ НАРРАТИВ — отслеживается только для анализа; не является надёжным источником.",
    },
    description: {
      en: "Russian military-adjacent channel — tracked for opposite-narrative framing.",
      uk: "Російський навколовоєнний канал — відстежується для аналізу протилежного наративу.",
      ru: "Российский околовоенный канал — отслеживается для анализа противоположного нарратива.",
    },
    language: "ru",
    regions: ["UA"],
    reputation: 0.22,
    tags: ["propaganda_analysis", "air_defense"],
    trackRecord: "Publicly identifiable RU channel; admitted for narrative comparison only.",
    anonymous: false,
    vettedAt: "2026-06-06",
    vettedBy: "editor:aegis",
    active: true,
  },
];

/** Indexed read access over the curated registry. */
export class MilbloggerRegistryService {
  private readonly byId = new Map<string, MilbloggerAccount>(
    MILBLOGGER_REGISTRY.map((a) => [a.id, a]),
  );

  get(id: string): MilbloggerAccount | undefined {
    return this.byId.get(id);
  }

  bySide(side: MilbloggerAccount["side"]): MilbloggerAccount[] {
    return MILBLOGGER_REGISTRY.filter((a) => a.side === side);
  }

  byTag(tag: MilbloggerAccount["tags"][number]): MilbloggerAccount[] {
    return MILBLOGGER_REGISTRY.filter((a) => a.tags.includes(tag));
  }

  active(): MilbloggerAccount[] {
    return MILBLOGGER_REGISTRY.filter((a) => a.active);
  }

  all(): MilbloggerAccount[] {
    return MILBLOGGER_REGISTRY;
  }
}
