/**
 * Programmatic SEO page templates.
 * Each template defines the URL pattern, localised titles/descriptions,
 * target entity type, estimated page count, and crawl priority.
 *
 * Rule: never create a template page without a quality-gate threshold.
 * See dedup/thin-guard.ts for minimum content length enforcement.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProgrammaticTemplate {
  id: string;
  /** URL pattern using [param] notation */
  urlPattern: string;
  title_en: string;
  title_uk: string;
  description_en: string;
  description_uk: string;
  targetEntity: "region" | "event-type" | "source" | "conflict" | "country" | "topic" | "analyst" | "equipment";
  estimatedPageCount: number;
  priority: "P1" | "P2" | "P3";
  /** Minimum verified-event count before a page is published (quality gate) */
  qualityGateMinEvents?: number;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export const PROGRAMMATIC_TEMPLATES: ProgrammaticTemplate[] = [
  // ── P1 — Core programmatic (Phase 1–2) ────────────────────────────────────
  {
    id: "region-events",
    urlPattern: "/events/[region]",
    title_en: "[Region] Conflict Events — Aegis Lens Live Map",
    title_uk: "Конфліктні події: [Region] — Aegis Lens",
    description_en:
      "Real-time verified conflict events in [Region]. Sourced from satellite imagery, social media, and open data. Updated continuously.",
    description_uk:
      "Верифіковані конфліктні події в регіоні [Region] у реальному часі. Джерела: супутникові знімки, соцмережі, відкриті дані.",
    targetEntity: "region",
    estimatedPageCount: 50,
    priority: "P1",
    qualityGateMinEvents: 5,
  },
  {
    id: "event-type-hub",
    urlPattern: "/events/type/[type]",
    title_en: "[Type] Events — Conflict Intelligence | Aegis Lens",
    title_uk: "Події типу [Type] — Конфліктна розвідка | Aegis Lens",
    description_en:
      "All verified [type] events tracked by Aegis Lens across active conflict zones. Filter by region, date, and source.",
    description_uk:
      "Усі верифіковані події типу [type], відстежені Aegis Lens в активних зонах конфлікту.",
    targetEntity: "event-type",
    estimatedPageCount: 30,
    priority: "P1",
    qualityGateMinEvents: 10,
  },
  {
    id: "source-profile",
    urlPattern: "/sources/[source-slug]",
    title_en: "[Source Name] — Credibility & Coverage | Aegis Lens",
    title_uk: "[Source Name] — Достовірність і покриття | Aegis Lens",
    description_en:
      "[Source Name] credibility score, event history, and methodology notes. Part of the Aegis Lens open-source registry.",
    description_uk:
      "Рейтинг достовірності, історія подій та методологічні нотатки для [Source Name].",
    targetEntity: "source",
    estimatedPageCount: 100,
    priority: "P1",
    qualityGateMinEvents: 1,
  },
  {
    id: "conflict-map",
    urlPattern: "/map/[conflict]",
    title_en: "[Conflict] Live Map — Aegis Lens OSINT Intelligence",
    title_uk: "Карта конфлікту [Conflict] — Aegis Lens",
    description_en:
      "Live interactive map for [Conflict]. Verified events, frontline updates, equipment tracking, and source timeline.",
    description_uk:
      "Інтерактивна карта конфлікту [Conflict] у реальному часі. Верифіковані події, лінія фронту, відстеження техніки.",
    targetEntity: "conflict",
    estimatedPageCount: 10,
    priority: "P1",
    qualityGateMinEvents: 20,
  },
  // ── P2 — Country & topic pages (Phase 2–3) ────────────────────────────────
  {
    id: "country-events",
    urlPattern: "/country/[country]/events",
    title_en: "[Country] Conflict Events — Open Intelligence | Aegis Lens",
    title_uk: "Конфліктні події: [Country] | Aegis Lens",
    description_en:
      "Verified conflict and security events in [Country]. Data from satellite, social media, and official sources.",
    description_uk:
      "Верифіковані безпекові події в [Country]. Дані із супутників, соцмереж та офіційних джерел.",
    targetEntity: "country",
    estimatedPageCount: 50,
    priority: "P2",
    qualityGateMinEvents: 5,
  },
  {
    id: "country-timeline",
    urlPattern: "/country/[country]/timeline",
    title_en: "[Country] Conflict Timeline — Historical Events | Aegis Lens",
    title_uk: "Хронологія конфлікту: [Country] | Aegis Lens",
    description_en:
      "Complete historical timeline of conflict events in [Country] as tracked by Aegis Lens from [earliest-date] to present.",
    description_uk:
      "Повна хронологія конфліктних подій у [Country] від [earliest-date] до сьогодні.",
    targetEntity: "country",
    estimatedPageCount: 50,
    priority: "P2",
    qualityGateMinEvents: 10,
  },
  {
    id: "topic-hub",
    urlPattern: "/topic/[topic]",
    title_en: "[Topic] — OSINT Intelligence Hub | Aegis Lens",
    title_uk: "[Topic] — OSINT-розвідка | Aegis Lens",
    description_en:
      "All Aegis Lens data, events, and analysis related to [topic]. Updated in real-time from verified sources.",
    description_uk:
      "Усі дані, події та аналітика Aegis Lens за темою [topic]. Оновлюється в реальному часі.",
    targetEntity: "topic",
    estimatedPageCount: 200,
    priority: "P2",
    qualityGateMinEvents: 3,
  },
  {
    id: "equipment-tracker",
    urlPattern: "/equipment/[type]",
    title_en: "[Equipment Type] Tracking — Conflict Intelligence | Aegis Lens",
    title_uk: "Відстеження [Equipment Type] | Aegis Lens",
    description_en:
      "Verified sightings, losses, and deployment patterns for [equipment type] across active conflict zones.",
    description_uk:
      "Верифіковані спостереження, втрати та розгортання [equipment type] в активних зонах конфлікту.",
    targetEntity: "equipment",
    estimatedPageCount: 100,
    priority: "P2",
    qualityGateMinEvents: 5,
  },
  // ── P3 — Authority & engagement pages (Phase 3+) ─────────────────────────
  {
    id: "analyst-profile",
    urlPattern: "/analyst/[username]",
    title_en: "[Name] — OSINT Analyst Profile | Aegis Lens",
    title_uk: "[Name] — Профіль OSINT-аналітика | Aegis Lens",
    description_en:
      "[Name]'s verified contributions to Aegis Lens: events confirmed, regions covered, methodology notes.",
    description_uk:
      "Верифіковані внески аналітика [Name] в Aegis Lens: підтверджені події, регіони, методологія.",
    targetEntity: "analyst",
    estimatedPageCount: 500,
    priority: "P3",
    qualityGateMinEvents: 0,
  },
  {
    id: "region-comparison",
    urlPattern: "/compare/[region-a]-vs-[region-b]",
    title_en: "[Region A] vs [Region B] — Conflict Comparison | Aegis Lens",
    title_uk: "[Region A] проти [Region B] — Порівняння конфліктів | Aegis Lens",
    description_en:
      "Side-by-side comparison of conflict intensity, event types, and source coverage for [Region A] and [Region B].",
    description_uk:
      "Порівняння інтенсивності конфлікту, типів подій та покриття джерел: [Region A] і [Region B].",
    targetEntity: "region",
    estimatedPageCount: 200,
    priority: "P3",
    qualityGateMinEvents: 10,
  },
  {
    id: "embed-widget",
    urlPattern: "/embed/[source]",
    title_en: "Embed Aegis Lens Map — [Source] Widget",
    title_uk: "Вбудувати карту Aegis Lens — [Source]",
    description_en:
      "Embeddable Aegis Lens live map widget for [source] coverage. Free for verified press and NGOs.",
    description_uk:
      "Вбудований віджет карти Aegis Lens для покриття [source]. Безкоштовно для верифікованих ЗМІ та НУО.",
    targetEntity: "source",
    estimatedPageCount: 100,
    priority: "P3",
    qualityGateMinEvents: 0,
  },
];

// ── Utility functions ─────────────────────────────────────────────────────────

/**
 * Returns the template whose URL pattern best matches a given path.
 * Uses simple segment-count and literal-match heuristic.
 */
export function getTemplateForPath(path: string): ProgrammaticTemplate | null {
  for (const template of PROGRAMMATIC_TEMPLATES) {
    const pattern = template.urlPattern;
    const patternSegments = pattern.split("/").filter(Boolean);
    const pathSegments = path.split("/").filter(Boolean);
    if (patternSegments.length !== pathSegments.length) continue;
    const matches = patternSegments.every(
      (seg, i) => seg.startsWith("[") || seg === pathSegments[i],
    );
    if (matches) return template;
  }
  return null;
}

/**
 * Returns total estimated programmatic page count across all templates.
 */
export function estimateTotalProgrammaticPages(): number {
  return PROGRAMMATIC_TEMPLATES.reduce((sum, t) => sum + t.estimatedPageCount, 0);
}

/**
 * Returns templates filtered by priority tier.
 */
export function getTemplatesByPriority(
  priority: ProgrammaticTemplate["priority"],
): ProgrammaticTemplate[] {
  return PROGRAMMATIC_TEMPLATES.filter((t) => t.priority === priority);
}
