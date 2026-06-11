/**
 * Re-engagement campaign — day 14 and day 30 for inactive users.
 * GDPR consent checked before any send; unsubscribe link mandatory.
 *
 * Кампанія повторного залучення — день 14 та день 30 для неактивних користувачів.
 * Перевірка GDPR-згоди перед відправленням; обов'язкове посилання на відписку.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReengagementTriggerCondition =
  | "no_map_interaction"
  | "no_alert_created"
  | "no_search_performed";

export interface ReengagementCampaign {
  userId: string;
  campaignType: "day14" | "day30";
  lastActiveAt: string;
  triggerCondition: ReengagementTriggerCondition;
  emailSubjectEn: string;
  emailSubjectUk: string;
}

// ---------------------------------------------------------------------------
// Schedule config
// ---------------------------------------------------------------------------

export const RE_ENGAGEMENT_SCHEDULE: Record<
  "day14" | "day30",
  { minInactiveDays: number }
> = {
  day14: { minInactiveDays: 14 },
  day30: { minInactiveDays: 30 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the user should be sent a re-engagement campaign email.
 * Prerequisites: inactivity threshold met AND GDPR consent present.
 * (Consent check is enforced by the caller — this function checks timing only.)
 *
 * Повертає true, якщо користувачу слід надіслати кампанію повторного залучення.
 * Перевірка GDPR-згоди — на стороні викликача; ця функція перевіряє лише час.
 */
export function shouldTriggerReengagement(
  userId: string,
  lastActiveAt: string,
  campaignType: "day14" | "day30",
): boolean {
  void userId; // reserved for per-user suppression list lookup
  const schedule = RE_ENGAGEMENT_SCHEDULE[campaignType];
  const ageMs    = Date.now() - new Date(lastActiveAt).getTime();
  const ageDays  = ageMs / (1_000 * 60 * 60 * 24);
  return ageDays >= schedule.minInactiveDays;
}

const SUBJECTS: Record<"day14" | "day30", Record<"en" | "uk", string>> = {
  day14: {
    en: "We miss you on AegisLens — here's what happened while you were away",
    uk: "Ми сумуємо за вами на AegisLens — ось що відбулося поки вас не було",
  },
  day30: {
    en: "A lot has changed on AegisLens — come back and explore",
    uk: "На AegisLens багато змінилося — поверніться і дослідіть",
  },
};

/**
 * Builds a ReengagementCampaign payload ready for the email / notification queue.
 * Формує ReengagementCampaign для черги email / сповіщень.
 */
export function buildReengagementPayload(
  userId: string,
  type: "day14" | "day30",
  locale: "en" | "uk",
): ReengagementCampaign {
  const condition: ReengagementTriggerCondition = "no_map_interaction";
  void locale; // locale used for rendering by the email template engine
  return {
    userId,
    campaignType:    type,
    lastActiveAt:    new Date(Date.now() - RE_ENGAGEMENT_SCHEDULE[type].minInactiveDays * 86_400_000).toISOString(),
    triggerCondition: condition,
    emailSubjectEn:  SUBJECTS[type].en,
    emailSubjectUk:  SUBJECTS[type].uk,
  };
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const REENGAGEMENT_NOTES_EN: string[] = [
  "unsubscribe-required: every re-engagement email MUST include a one-click unsubscribe link (List-Unsubscribe header + visible footer link); failure to include one violates CAN-SPAM / PECR; the email template receives a signed unsubscribe URL from the sending service.",
  "GDPR-consent-check: before enqueuing any re-engagement send, verify the user's marketing_email_consent flag in the users table (set during signup); if consent is false or absent, skip the send entirely and log a suppression record.",
];

export const REENGAGEMENT_NOTES_UK: string[] = [
  "unsubscribe-required: кожен лист повторного залучення МАЄ містити посилання на відписку в один клік (заголовок List-Unsubscribe + видиме посилання у футері); відсутність порушує CAN-SPAM / PECR; шаблон отримує підписаний URL відписки від сервісу відправлення.",
  "GDPR-consent-check: перед постановкою в чергу будь-якого відправлення перевіряти прапорець marketing_email_consent користувача в таблиці users (встановлюється при реєстрації); якщо згоди немає — пропустити відправлення та записати запис про придушення.",
];
