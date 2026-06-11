/**
 * Onboarding sequence — 5 emails over 14 days for new users.
 * Persona-aware: journalists, OSINT researchers, NGO workers, general.
 */

import type { LifecycleEmail } from "./lifecycle-types";

export const ONBOARDING_SEQUENCE: LifecycleEmail[] = [
  // ── Email 1: Welcome (Day 0, immediate) ───────────────────────────────────
  {
    templateId: "onboarding-welcome",
    trigger: "user.registered",
    delayHours: 0,
    subject_en: "Welcome to Aegis Lens — your intelligence briefing starts now",
    subject_uk: "Ласкаво просимо до Aegis Lens — ваш розвідувальний брифінг починається",
    preheader_en: "Real-time conflict intelligence, verified and ready.",
    preheader_uk: "Розвідка конфліктів у реальному часі — верифікована і готова.",
    personaTag: null,
    tierGate: "all",
    canUnsubscribe: false,
  },

  // ── Email 2: First map-view tip (Day 1, 24h) ──────────────────────────────
  {
    templateId: "onboarding-first-map-tip",
    trigger: "user.first_map_view",
    delayHours: 24,
    subject_en: "3 ways to get more from the Aegis Lens map",
    subject_uk: "3 способи отримати більше від карти Aegis Lens",
    preheader_en: "Filter by event type, region, and confidence score.",
    preheader_uk: "Фільтруйте за типом події, регіоном та рівнем довіри.",
    personaTag: null,
    tierGate: "all",
    canUnsubscribe: true,
  },

  // ── Email 3: AI Copilot intro (Day 3, 72h) ────────────────────────────────
  {
    templateId: "onboarding-copilot-intro",
    trigger: "user.day_3",
    delayHours: 72,
    subject_en: "Ask the Aegis Copilot anything about the conflict",
    subject_uk: "Запитайте Aegis Copilot про будь-що щодо конфлікту",
    preheader_en: "Natural language. Verified data. Instant answers.",
    preheader_uk: "Природна мова. Верифіковані дані. Миттєві відповіді.",
    personaTag: null,
    tierGate: "all",
    canUnsubscribe: true,
  },

  // ── Email 4: Saved searches tip (Day 7) ──────────────────────────────────
  {
    templateId: "onboarding-saved-searches",
    trigger: "user.day_7",
    delayHours: 168,
    subject_en: "Save your searches — never miss a development",
    subject_uk: "Збережіть пошуки — не пропустіть жодної події",
    preheader_en: "Set up alerts for regions and event types that matter to you.",
    preheader_uk: "Налаштуйте сповіщення для регіонів та подій, що важливі для вас.",
    personaTag: null,
    tierGate: "all",
    canUnsubscribe: true,
  },

  // ── Email 5: Upgrade prompt (Day 14, free tier only) ─────────────────────
  {
    templateId: "onboarding-upgrade-prompt",
    trigger: "user.day_14",
    delayHours: 336,
    subject_en: "You've been using Aegis Lens for 2 weeks — here's what Pro unlocks",
    subject_uk: "Ви використовуєте Aegis Lens 2 тижні — ось що відкриває Pro",
    preheader_en: "Unlimited alerts, AI Copilot, and full dataset access.",
    preheader_uk: "Необмежені сповіщення, AI Copilot та повний доступ до датасетів.",
    personaTag: null,
    tierGate: "free",
    canUnsubscribe: true,
  },
];
