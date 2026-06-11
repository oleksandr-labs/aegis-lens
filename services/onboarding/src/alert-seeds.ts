/**
 * Pre-seeded alert templates — applied on signup per persona.
 * Users can dismiss or edit these after first login.
 *
 * Попередньо налаштовані шаблони сповіщень — застосовуються при реєстрації за персоною.
 * Після першого входу користувач може відхилити або змінити їх.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlertSeedTemplate {
  personaId: string;
  name: string;
  nameUk: string;
  condition: Record<string, unknown>;
  channels: string[];
  priority: string;
}

// ---------------------------------------------------------------------------
// Templates — keyed by personaId
// ---------------------------------------------------------------------------

export const ALERT_SEED_TEMPLATES: Record<string, AlertSeedTemplate[]> = {
  civilian: [
    {
      personaId: "civilian",
      name:      "Air raid alert — my region",
      nameUk:    "Повітряна тривога — мій регіон",
      condition: {
        class:    ["air_raid"],
        severity: [3, 4, 5],
        // aoi_id injected at signup time from persona defaultMapView
        aoi:      "__user_home_region__",
      },
      channels: ["push", "telegram"],
      priority: "critical",
    },
    {
      personaId: "civilian",
      name:      "Critical infrastructure damage near me",
      nameUk:    "Пошкодження критичної інфраструктури поруч",
      condition: {
        class:       ["infrastructure_damage"],
        subclass:    ["power_plant", "water_supply", "hospital"],
        radiusKm:    50,
        aoi:         "__user_home_region__",
        minConfidence: 0.65,
      },
      channels: ["push"],
      priority: "high",
    },
  ],

  journalist: [
    {
      personaId: "journalist",
      name:      "New high-severity event from tracked source",
      nameUk:    "Нова подія з відстежуваного джерела",
      condition: {
        severity:      [4, 5],
        minConfidence: 0.7,
        hours:         1,
      },
      channels: ["push", "slack", "telegram"],
      priority: "high",
    },
    {
      personaId: "journalist",
      name:      "High-severity event in monitored region",
      nameUk:    "Серйозна подія у відстежуваному регіоні",
      condition: {
        class:         ["military_action", "civilian_alert"],
        severity:      [4, 5],
        aoi:           "__user_beat_region__",
        minConfidence: 0.75,
      },
      channels: ["push", "email"],
      priority: "high",
    },
    {
      personaId: "journalist",
      name:      "Entity mention — tracked entity",
      nameUk:    "Згадка суб'єкта — відстежуваний суб'єкт",
      condition: {
        entityIds:     ["__user_tracked_entities__"],
        minConfidence: 0.6,
      },
      channels: ["push"],
      priority: "medium",
    },
  ],

  analyst: [
    {
      personaId: "analyst",
      name:      "Anomaly detection — unusual event cluster",
      nameUk:    "Виявлення аномалій — незвичне скупчення подій",
      condition: {
        type:          "anomaly",
        zScoreThreshold: 2.5,
        windowHours:   6,
      },
      channels: ["push", "email"],
      priority: "high",
    },
    {
      personaId: "analyst",
      name:      "Confidence drop — watched events",
      nameUk:    "Падіння достовірності — відстежувані події",
      condition: {
        type:               "confidence_drop",
        deltaThreshold:     -0.2,
        watchedEventIds:    ["__user_watchlist__"],
      },
      channels: ["push"],
      priority: "medium",
    },
    {
      personaId: "analyst",
      name:      "Daily digest — all monitored AOIs",
      nameUk:    "Щоденний дайджест — всі зони моніторингу",
      condition: {
        type:       "scheduled_digest",
        scheduleUtcHour: 7,
        aoi:        "__all_user_aois__",
      },
      channels: ["email", "telegram"],
      priority: "low",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Returns the pre-seeded alert templates for a given persona.
 * Повертає попередньо налаштовані шаблони сповіщень для заданої персони.
 */
export function getAlertSeedsForPersona(personaId: string): AlertSeedTemplate[] {
  return ALERT_SEED_TEMPLATES[personaId] ?? [];
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const ALERT_SEED_NOTES_EN: string[] = [
  "pre-seeded-on-signup: getAlertSeedsForPersona() is called during the onboarding POST /api/onboarding/complete handler; placeholder values (e.g. __user_home_region__) are replaced with actual AOI / entity IDs collected during onboarding.",
  "user-can-dismiss-or-edit: pre-seeded alerts are marked with source: 'seed' in the alerts store; the UI shows a dismissal banner on first view, and users can edit or delete them at any time from /settings/alerts.",
];

export const ALERT_SEED_NOTES_UK: string[] = [
  "pre-seeded-on-signup: getAlertSeedsForPersona() викликається під час обробника POST /api/onboarding/complete; значення-заповнювачі (напр. __user_home_region__) замінюються фактичними ID AOI / суб'єктів, зібраними під час онбордингу.",
  "user-can-dismiss-or-edit: попередньо налаштовані сповіщення позначаються source: 'seed' у сховищі сповіщень; UI показує банер відхилення при першому перегляді, і користувач може редагувати або видалити їх будь-коли з /settings/alerts.",
];
