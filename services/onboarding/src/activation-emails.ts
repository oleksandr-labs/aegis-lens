/**
 * Activation nudge emails for stalled onboarding.
 * Sent at day 1, day 3, and day 7 if the user has not completed all onboarding steps.
 *
 * Листи-нагадування для затримки активації.
 * Надсилаються на 1-й, 3-й та 7-й день, якщо користувач не завершив кроки онбордингу.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivationNudgeEmail {
  userId: string;
  emailType: "day1" | "day3" | "day7";
  completedSteps: string[];
  missingSteps: string[];
  personaId: string;
}

// ---------------------------------------------------------------------------
// Schedule config
// ---------------------------------------------------------------------------

export const ACTIVATION_NUDGE_SCHEDULE: Record<
  "day1" | "day3" | "day7",
  { delayHours: number; maxSends: number }
> = {
  day1: { delayHours: 24,  maxSends: 1 },
  day3: { delayHours: 72,  maxSends: 1 },
  day7: { delayHours: 168, maxSends: 1 },
};

// ---------------------------------------------------------------------------
// Subject builders
// ---------------------------------------------------------------------------

const SUBJECTS: Record<"day1" | "day3" | "day7", Record<"en" | "uk", string>> = {
  day1: {
    en: "Your AegisLens setup is almost done — finish in 2 minutes",
    uk: "Ваше налаштування AegisLens майже готове — завершіть за 2 хвилини",
  },
  day3: {
    en: "Still getting started? Here's what you're missing on AegisLens",
    uk: "Ще не розпочали? Ось що вам залишилось у AegisLens",
  },
  day7: {
    en: "One week in — unlock the full power of AegisLens",
    uk: "Один тиждень — розкрийте повний потенціал AegisLens",
  },
};

/**
 * Returns the email subject line for a given nudge type and locale.
 * Повертає тему листа для заданого типу нагадування та мови.
 */
export function buildNudgeEmailSubject(
  type: "day1" | "day3" | "day7",
  locale: "en" | "uk",
): string {
  return SUBJECTS[type][locale];
}

// ---------------------------------------------------------------------------
// Body builder
// ---------------------------------------------------------------------------

/**
 * Returns a plain-text email body for a stalled-activation nudge.
 * In production this would be an HTML template (Postmark / SendGrid).
 *
 * Повертає текст листа для нагадування про затримку активації.
 * У продакшні це буде HTML-шаблон (Postmark / SendGrid).
 */
export function buildNudgeEmailBody(
  nudge: ActivationNudgeEmail,
  locale: "en" | "uk",
): string {
  const completedCount = nudge.completedSteps.length;
  const totalCount     = completedCount + nudge.missingSteps.length;

  if (locale === "uk") {
    const missingList = nudge.missingSteps.map((s) => `  • ${s}`).join("\n");
    return [
      `Привіт!`,
      ``,
      `Ви завершили ${completedCount} з ${totalCount} кроків налаштування AegisLens.`,
      ``,
      `Кроки, що залишились:`,
      missingList,
      ``,
      `Відкрийте платформу, щоб завершити їх: https://aegislens.io/onboarding`,
      ``,
      `Якщо вам потрібна допомога, напишіть нам: support@aegislens.io`,
    ].join("\n");
  }

  const missingList = nudge.missingSteps.map((s) => `  • ${s}`).join("\n");
  return [
    `Hi there,`,
    ``,
    `You've completed ${completedCount} of ${totalCount} setup steps on AegisLens.`,
    ``,
    `Still to do:`,
    missingList,
    ``,
    `Open the platform to finish: https://aegislens.io/onboarding`,
    ``,
    `Need help? Reach us at: support@aegislens.io`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const ACTIVATION_EMAIL_NOTES_EN: string[] = [
  "transactional-email-postmark-or-sendgrid: nudge emails are sent via Postmark (primary) or SendGrid (fallback); the sending service is configured via env TRANSACTIONAL_EMAIL_PROVIDER; templates use the HTML versions of buildNudgeEmailBody().",
  "single-send-per-type: each email type (day1 / day3 / day7) is sent at most once per user (maxSends: 1); sending is gated by checking the activation_nudges table for a prior send of the same type before enqueuing.",
];

export const ACTIVATION_EMAIL_NOTES_UK: string[] = [
  "transactional-email-postmark-or-sendgrid: листи-нагадування надсилаються через Postmark (основний) або SendGrid (резервний); сервіс налаштовується через env TRANSACTIONAL_EMAIL_PROVIDER; шаблони використовують HTML-версії buildNudgeEmailBody().",
  "single-send-per-type: кожен тип листа (day1 / day3 / day7) надсилається не більше одного разу на користувача (maxSends: 1); відправка блокується перевіркою таблиці activation_nudges на наявність попереднього відправлення того ж типу перед постановкою в чергу.",
];
