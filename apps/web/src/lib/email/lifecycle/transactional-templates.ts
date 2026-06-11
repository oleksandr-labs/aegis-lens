/**
 * Transactional email templates — authentication, billing, alerts, reports.
 * These emails are NOT opt-in; they are required for service delivery.
 * canUnsubscribe = false for all entries here.
 */

export interface TransactionalTemplate {
  subject_en: string;
  subject_uk: string;
  preheader_en: string;
  preheader_uk: string;
}

export const TRANSACTIONAL_TEMPLATES: Record<string, TransactionalTemplate> = {
  // ── Authentication ─────────────────────────────────────────────────────────
  "email-verification": {
    subject_en: "Verify your Aegis Lens email address",
    subject_uk: "Підтвердіть вашу електронну адресу Aegis Lens",
    preheader_en: "Click to verify and activate your account.",
    preheader_uk: "Натисніть, щоб підтвердити та активувати ваш обліковий запис.",
  },

  "password-reset": {
    subject_en: "Reset your Aegis Lens password",
    subject_uk: "Скидання пароля Aegis Lens",
    preheader_en: "This link expires in 1 hour. If you didn't request this, ignore this email.",
    preheader_uk: "Посилання дійсне 1 годину. Якщо ви не робили запит — проігноруйте.",
  },

  // ── Billing ────────────────────────────────────────────────────────────────
  "trial-starting": {
    subject_en: "Your Aegis Lens Pro trial has started",
    subject_uk: "Ваш пробний період Aegis Lens Pro розпочався",
    preheader_en: "14 days of full Pro access — make the most of it.",
    preheader_uk: "14 днів повного доступу Pro — використовуйте на повну.",
  },

  "trial-ending": {
    subject_en: "Your Aegis Lens trial ends in 3 days",
    subject_uk: "Ваш пробний період Aegis Lens завершується через 3 дні",
    preheader_en: "Upgrade now to keep your alerts and saved searches.",
    preheader_uk: "Оновіть зараз, щоб зберегти ваші сповіщення та збережені пошуки.",
  },

  "subscription-confirmed": {
    subject_en: "Welcome to Aegis Lens Pro — your subscription is confirmed",
    subject_uk: "Ласкаво просимо до Aegis Lens Pro — підписку підтверджено",
    preheader_en: "Full access activated. Your invoice is attached.",
    preheader_uk: "Повний доступ активовано. Рахунок-фактура додається.",
  },

  "subscription-canceled": {
    subject_en: "Your Aegis Lens subscription has been canceled",
    subject_uk: "Вашу підписку Aegis Lens скасовано",
    preheader_en: "Access continues until the end of your billing period.",
    preheader_uk: "Доступ діє до кінця розрахункового періоду.",
  },

  "invoice-paid": {
    subject_en: "Invoice paid — Aegis Lens receipt",
    subject_uk: "Рахунок оплачено — квитанція Aegis Lens",
    preheader_en: "Thank you. Your receipt is ready to download.",
    preheader_uk: "Дякуємо. Ваша квитанція готова до завантаження.",
  },

  // ── Alerts ─────────────────────────────────────────────────────────────────
  "alert-delivered": {
    subject_en: "Alert: new verified event in your watched region",
    subject_uk: "Сповіщення: нова верифікована подія у відстежуваному регіоні",
    preheader_en: "Open Aegis Lens to see the event details and source chain.",
    preheader_uk: "Відкрийте Aegis Lens для перегляду деталей події та ланцюжка джерел.",
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  "report-ready": {
    subject_en: "Your Aegis Lens report is ready",
    subject_uk: "Ваш звіт Aegis Lens готовий",
    preheader_en: "Download your custom report — available for 72 hours.",
    preheader_uk: "Завантажте ваш звіт — доступний протягом 72 годин.",
  },

  // ── Access / Grants ────────────────────────────────────────────────────────
  "grant-approved": {
    subject_en: "Access approved — Aegis Lens Newsroom / NGO tier",
    subject_uk: "Доступ схвалено — рівень Newsroom / НУО Aegis Lens",
    preheader_en: "Your verified access is now active. Welcome to the platform.",
    preheader_uk: "Ваш верифікований доступ активовано. Ласкаво просимо на платформу.",
  },
};
