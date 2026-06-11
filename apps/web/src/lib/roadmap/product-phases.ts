/**
 * Product roadmap phase configuration.
 *
 * Single source of truth for all four phases.
 * Derived from TODO/product/TODO_roadmap.md.
 *
 * Usage:
 *   import { PRODUCT_ROADMAP, getPhase, getDoneItems } from "@/lib/roadmap/product-phases";
 */

import type { RoadmapPhase, RoadmapPhaseId, RoadmapItem } from "./types";

// ── Guiding principle ─────────────────────────────────────────────────────────

export const ROADMAP_PRINCIPLE_EN =
  "Ship the viral public live map + free-tier OSINT analyst access first. Gate everything else.";

export const ROADMAP_PRINCIPLE_UK =
  "Спочатку — вірусна публічна жива карта та доступ аналітика OSINT на безплатному рівні. Все решта — за гейтом.";

// ── Phase 1 — MVP ─────────────────────────────────────────────────────────────

const PHASE_1: RoadmapPhase = {
  id: "phase-1-mvp",
  name_en: "Phase 1 — MVP",
  name_uk: "Фаза 1 — MVP",
  theme_en: "Live Ukraine map + verified event feed + AI summaries. EN only.",
  theme_uk: "Жива карта України + верифікований стрім подій + AI-підсумки. Лише EN.",
  targetWeeks: 12,
  items: [
    {
      id: "event-schema-v1",
      description_en: "Event schema v1 + Postgres/PostGIS",
      description_uk: "Схема подій v1 + Postgres/PostGIS",
      status: "planned",
      dependencies: [],
    },
    {
      id: "ingest-telegram-rss-firms",
      description_en:
        "Ingest from Telegram (curated channels), RSS news, NASA FIRMS, ADS-B, Sentinel-2 AOI",
      description_uk:
        "Інгест із Telegram (відібрані канали), RSS, NASA FIRMS, ADS-B, Sentinel-2 AOI",
      status: "planned",
      dependencies: ["event-schema-v1"],
    },
    {
      id: "normalization-pipeline",
      description_en: "Normalization pipeline (Kafka + workers)",
      description_uk: "Пайплайн нормалізації (Kafka + воркери)",
      status: "planned",
      dependencies: ["ingest-telegram-rss-firms"],
    },
    {
      id: "nlp-pipeline",
      description_en: "NLP: translation, NER, event classification (Tier-1 classes)",
      description_uk: "NLP: переклад, NER, класифікація подій (класи Tier-1)",
      status: "planned",
      dependencies: ["normalization-pipeline"],
    },
    {
      id: "confidence-danger-score",
      description_en: "Confidence + danger score v1",
      description_uk: "Оцінка довіри + рівень небезпеки v1",
      status: "planned",
      dependencies: ["nlp-pipeline"],
    },
    {
      id: "mapbox-workspace",
      description_en: "Mapbox + deck.gl workspace with 6 core layers",
      description_uk: "Mapbox + deck.gl воркспейс із 6 базовими шарами",
      status: "planned",
      dependencies: ["event-schema-v1"],
    },
    {
      id: "timeline",
      description_en: "Timeline (24h + 7d)",
      description_uk: "Хронологія (24 год + 7 днів)",
      status: "planned",
      dependencies: ["mapbox-workspace"],
    },
    {
      id: "ai-summary-per-event",
      description_en: "AI summary per event (Claude)",
      description_uk: "AI-підсумок на подію (Claude)",
      status: "planned",
      dependencies: ["nlp-pipeline"],
    },
    {
      id: "ai-copilot-v1",
      description_en: "AI copilot v1 (scoped to current view)",
      description_uk: "AI-копілот v1 (в межах поточного вигляду)",
      status: "done",
      sprintRef: "Sprint 1.3",
      dependencies: ["mapbox-workspace", "ai-summary-per-event"],
    },
    {
      id: "landing-auth-tiers",
      description_en: "Landing page + auth + free tier + pro tier (Stripe)",
      description_uk: "Лендінг + автентифікація + безплатний рівень + pro (Stripe)",
      status: "done",
      sprintRef: "Sprint 2.3",
      dependencies: [],
    },
    {
      id: "en-i18n-framework",
      description_en: "EN-only UI, but full i18n framework in place",
      description_uk: "UI лише EN, але повний фреймворк i18n готовий",
      status: "done",
      sprintRef: "Sprint 0",
      dependencies: [],
    },
  ],
};

// ── Phase 2 — Depth ───────────────────────────────────────────────────────────

const PHASE_2: RoadmapPhase = {
  id: "phase-2-depth",
  name_en: "Phase 2 — Depth",
  name_uk: "Фаза 2 — Глибина",
  theme_en: "More sources, more AI, UK locale, dashboards, alerts.",
  theme_uk: "Більше джерел, більше AI, UK-локаль, дашборди, сповіщення.",
  targetWeeks: null, // months 4–8, variable
  items: [
    {
      id: "uk-locale",
      description_en: "UK locale ships",
      description_uk: "Запуск UK-локалі",
      status: "done",
      sprintRef: "Sprint 0",
      dependencies: ["en-i18n-framework"],
    },
    {
      id: "x-reddit-youtube",
      description_en: "X/Twitter, Reddit, YouTube ingestion",
      description_uk: "Інгест із X/Twitter, Reddit, YouTube",
      status: "planned",
      dependencies: ["ingest-telegram-rss-firms"],
    },
    {
      id: "cv-verification",
      description_en: "Computer-vision verification (object detection, recycled-media)",
      description_uk: "Верифікація за допомогою комп'ютерного зору (детекція об'єктів, рециклований медіа-матеріал)",
      status: "planned",
      dependencies: ["nlp-pipeline"],
    },
    {
      id: "anomaly-detection",
      description_en: "Anomaly detection v1",
      description_uk: "Виявлення аномалій v1",
      status: "planned",
      dependencies: ["normalization-pipeline"],
    },
    {
      id: "alert-system",
      description_en: "Alert system (rules + AI suggestions + multi-channel delivery)",
      description_uk: "Система сповіщень (правила + AI-пропозиції + мультиканальна доставка)",
      status: "planned",
      dependencies: ["confidence-danger-score"],
    },
    {
      id: "analyst-dashboard",
      description_en: "Analyst dashboard with widgets + case files",
      description_uk: "Аналітичний дашборд із віджетами та кейс-файлами",
      status: "planned",
      dependencies: ["mapbox-workspace", "landing-auth-tiers"],
    },
    {
      id: "ai-report-generator",
      description_en: "AI report generator + delivery",
      description_uk: "AI-генератор звітів + доставка",
      status: "planned",
      dependencies: ["ai-summary-per-event", "analyst-dashboard"],
    },
    {
      id: "sentinel-1-sar",
      description_en: "Sentinel-1 SAR + change detection",
      description_uk: "Sentinel-1 SAR + виявлення змін",
      status: "planned",
      dependencies: ["ingest-telegram-rss-firms"],
    },
    {
      id: "ais-marine-tracking",
      description_en: "AIS marine tracking",
      description_uk: "Відстеження морського трафіку AIS",
      status: "planned",
      dependencies: ["ingest-telegram-rss-firms"],
    },
  ],
};

// ── Phase 3 — Enterprise ──────────────────────────────────────────────────────

const PHASE_3: RoadmapPhase = {
  id: "phase-3-enterprise",
  name_en: "Phase 3 — Enterprise",
  name_uk: "Фаза 3 — Корпоративна",
  theme_en: "Enterprise / gov readiness + commercial satellite.",
  theme_uk: "Корпоративна / урядова готовність + комерційний супутник.",
  targetWeeks: null, // months 9–18, variable
  items: [
    {
      id: "sso-saml-scim",
      description_en: "SSO / SAML / SCIM",
      description_uk: "SSO / SAML / SCIM",
      status: "planned",
      dependencies: ["landing-auth-tiers"],
    },
    {
      id: "onprem-sovereign",
      description_en: "On-prem / sovereign-cloud deployment option",
      description_uk: "Варіант розгортання на власному сервері / суверенній хмарі",
      status: "planned",
      dependencies: ["sso-saml-scim"],
    },
    {
      id: "planet-blacksky",
      description_en: "Planet Labs / BlackSky integration",
      description_uk: "Інтеграція Planet Labs / BlackSky",
      status: "planned",
      dependencies: ["sentinel-1-sar"],
    },
    {
      id: "trend-forecasting",
      description_en: "Trend forecasting v1",
      description_uk: "Прогнозування трендів v1",
      status: "planned",
      dependencies: ["anomaly-detection"],
    },
    {
      id: "stix-taxii",
      description_en: "STIX 2.1 / TAXII export",
      description_uk: "Експорт STIX 2.1 / TAXII",
      status: "planned",
      dependencies: ["event-schema-v1"],
    },
    {
      id: "white-label",
      description_en: "White-label",
      description_uk: "Біла мітка (white-label)",
      status: "planned",
      dependencies: ["sso-saml-scim", "analyst-dashboard"],
    },
    {
      id: "soc2-type1",
      description_en: "SOC 2 Type I",
      description_uk: "SOC 2 Тип I",
      status: "planned",
      dependencies: ["onprem-sovereign"],
    },
  ],
};

// ── Phase 4 — Global ──────────────────────────────────────────────────────────

const PHASE_4: RoadmapPhase = {
  id: "phase-4-global",
  name_en: "Phase 4 — Global",
  name_uk: "Фаза 4 — Глобальна",
  theme_en: "Beyond Ukraine. Every conflict and crisis on one platform.",
  theme_uk: "За межами України. Кожен конфлікт і криза — на одній платформі.",
  targetWeeks: null, // year 2+
  items: [
    {
      id: "multi-region-taxonomy",
      description_en: "Multi-region taxonomy expansion",
      description_uk: "Розширення таксономії на кілька регіонів",
      status: "planned",
      dependencies: ["event-schema-v1", "nlp-pipeline"],
    },
    {
      id: "8-plus-locales",
      description_en: "8+ locales",
      description_uk: "8+ локалей",
      status: "planned",
      dependencies: ["uk-locale"],
    },
    {
      id: "community-layer-marketplace",
      description_en: "Marketplace for community-curated layers",
      description_uk: "Маркетплейс шарів, curated-спільнотою",
      status: "planned",
      dependencies: ["mapbox-workspace", "landing-auth-tiers"],
    },
    {
      id: "predictive-crisis-index",
      description_en: "Predictive crisis index per country",
      description_uk: "Прогностичний індекс кризи по країнах",
      status: "planned",
      dependencies: ["trend-forecasting", "multi-region-taxonomy"],
    },
    {
      id: "public-api-ecosystem",
      description_en: "Public API ecosystem + partner program",
      description_uk: "Публічна екосистема API + партнерська програма",
      status: "planned",
      dependencies: ["stix-taxii", "community-layer-marketplace"],
    },
  ],
};

// ── Master array ──────────────────────────────────────────────────────────────

export const PRODUCT_ROADMAP: RoadmapPhase[] = [PHASE_1, PHASE_2, PHASE_3, PHASE_4];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Look up a phase by ID. Returns undefined if not found. */
export function getPhase(id: RoadmapPhaseId): RoadmapPhase | undefined {
  return PRODUCT_ROADMAP.find((p) => p.id === id);
}

/** All items across all phases with status "done". */
export function getDoneItems(): RoadmapItem[] {
  return PRODUCT_ROADMAP.flatMap((p) => p.items).filter((i) => i.status === "done");
}

/** All items across all phases with status "planned". */
export function getPlannedItems(): RoadmapItem[] {
  return PRODUCT_ROADMAP.flatMap((p) => p.items).filter((i) => i.status === "planned");
}
