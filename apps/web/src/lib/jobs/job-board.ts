/**
 * Job Board / Talent Marketplace product catalog.
 * Niche OSINT / intel / verification job board + freelance gig marketplace.
 *
 * Каталог продуктів дошки вакансій та маркетплейсу талантів.
 * Спеціалізована біржа для OSINT / розвідки / верифікації.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type JobPostingTier =
  | "standard"
  | "featured"
  | "employer-subscription";

export type FreelanceGigCategory =
  | "geolocation"
  | "verification"
  | "translation"
  | "investigation"
  | "analysis"
  | "training-data";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface JobProduct {
  id: string;
  tier: JobPostingTier | "freelance" | "talent-search" | "certification" | "portfolio";
  name_en: string;
  name_uk: string;
  /** Price in USD; 0 = included/free; -1 = commission-based */
  priceUsd: number;
  /** Duration in days; null = unlimited (subscription) or commission-based */
  durationDays: number | null;
  features_en: string[];
  features_uk: string[];
  notes_en: string;
  notes_uk: string;
}

// ── Products ──────────────────────────────────────────────────────────────────

/**
 * Full catalog of Job Board / Talent Marketplace products.
 *
 * Повний каталог продуктів дошки вакансій.
 */
export const JOB_PRODUCTS: JobProduct[] = [
  {
    id: "job-standard-posting",
    tier: "standard",
    name_en: "Standard Job Posting",
    name_uk: "Стандартна публікація вакансії",
    priceUsd: 299,
    durationDays: 30,
    features_en: [
      "30-day active listing",
      "Appear in keyword search results",
      "Receive applications via platform inbox",
      "Basic analytics (views, click-through rate)",
    ],
    features_uk: [
      "Активна публікація на 30 днів",
      "Відображення в результатах пошуку за ключовими словами",
      "Отримання заявок через платформний інбокс",
      "Базова аналітика (перегляди, CTR)",
    ],
    notes_en: "Subject to moderation queue. Listed within 24 hours of approval.",
    notes_uk: "Підлягає черзі модерації. Публікується протягом 24 годин після схвалення.",
  },
  {
    id: "job-featured-upgrade",
    tier: "featured",
    name_en: "Featured Job Upgrade",
    name_uk: "Покращення до «Обраної вакансії»",
    priceUsd: 200,
    durationDays: 30,
    features_en: [
      "Pinned to top of relevant search results",
      "Highlighted card with featured badge",
      "Priority placement in weekly digest email",
      "Extended analytics dashboard",
    ],
    features_uk: [
      "Закріплення у верхній частині результатів пошуку",
      "Виділена картка з позначкою «Обрана»",
      "Пріоритетне розміщення у щотижневому дайджесті",
      "Розширена аналітична панель",
    ],
    notes_en: "Add-on to Standard Posting (+$200). Total effective cost: $499 for featured listing.",
    notes_uk: "Доповнення до стандартної публікації (+$200). Загальна вартість: $499 за обрану вакансію.",
  },
  {
    id: "job-employer-subscription",
    tier: "employer-subscription",
    name_en: "Employer Annual Subscription",
    name_uk: "Річна підписка для роботодавця",
    priceUsd: 2499,
    durationDays: null,
    features_en: [
      "Unlimited job postings for 12 months",
      "Full talent search across opt-in analyst profiles",
      "Saved searches and candidate pipeline management",
      "Dedicated employer profile page",
      "Priority moderation (listings go live within 4 hours)",
      "Quarterly hiring market report",
    ],
    features_uk: [
      "Необмежені публікації вакансій протягом 12 місяців",
      "Повний пошук талантів за профілями аналітиків, що дали згоду",
      "Збережені пошуки та управління кандидатами",
      "Виділена сторінка профілю роботодавця",
      "Пріоритетна модерація (публікація протягом 4 годин)",
      "Щоквартальний звіт про ринок найму",
    ],
    notes_en: "Annual subscription. Renews automatically unless cancelled 30 days before end date.",
    notes_uk: "Річна підписка. Автоматично поновлюється, якщо не скасована за 30 днів до закінчення.",
  },
  {
    id: "job-freelance-marketplace",
    tier: "freelance",
    name_en: "Freelance Gig Marketplace",
    name_uk: "Маркетплейс фриланс-гігів",
    priceUsd: -1,
    durationDays: null,
    features_en: [
      "Post short verification, geolocation, translation, or analysis tasks",
      "Browse and hire verified OSINT contributors",
      "Escrow-based payment: funds released on deliverable approval",
      "Platform commission: 10–15% of gig value",
      "Dispute resolution within 72 hours",
    ],
    features_uk: [
      "Публікація коротких завдань: верифікація, геолокація, переклад, аналіз",
      "Пошук та наймання верифікованих OSINT-контриб'юторів",
      "Ескроу-платежі: кошти виплачуються після схвалення результату",
      "Комісія платформи: 10–15% від вартості гігу",
      "Вирішення суперечок протягом 72 годин",
    ],
    notes_en: "Commission-based; no upfront listing fee. KYC required for all freelancers before first payout.",
    notes_uk: "Комісійна модель; без авансової оплати. KYC обов'язковий для всіх фрилансерів перед першою виплатою.",
  },
  {
    id: "job-talent-search",
    tier: "talent-search",
    name_en: "Talent Search — Recruiter Access",
    name_uk: "Пошук талантів — доступ рекрутера",
    priceUsd: 499,
    durationDays: 30,
    features_en: [
      "Search and filter opt-in analyst profiles",
      "View verified skills, certifications, and portfolio samples",
      "Direct message candidates (5 credits/month included)",
      "Boolean and proximity search operators",
      "Export shortlist to CSV",
    ],
    features_uk: [
      "Пошук і фільтрація профілів аналітиків, що дали згоду",
      "Перегляд верифікованих навичок, сертифікатів та портфоліо",
      "Прямі повідомлення кандидатам (5 кредитів/місяць включено)",
      "Булевий пошук і оператори наближення",
      "Експорт шорт-листа у CSV",
    ],
    notes_en: "Monthly subscription at $499/mo. Included in Employer Annual Subscription.",
    notes_uk: "Місячна підписка за $499/міс. Включена до річної підписки роботодавця.",
  },
  {
    id: "job-certification-surfacing",
    tier: "certification",
    name_en: "Certification Surfacing",
    name_uk: "Відображення сертифікатів",
    priceUsd: 0,
    durationDays: null,
    features_en: [
      "Academy graduates automatically appear with verified badge on their profile",
      "Certification badge displayed on all job applications",
      "Increased profile ranking in talent search results",
    ],
    features_uk: [
      "Випускники Академії автоматично отримують значок верифікації в профілі",
      "Значок сертифіката відображається у всіх заявках на вакансії",
      "Підвищений рейтинг профілю в результатах пошуку талантів",
    ],
    notes_en: "Included at no additional cost for all Academy-certified analysts.",
    notes_uk: "Включено безкоштовно для всіх сертифікованих аналітиків Академії.",
  },
  {
    id: "job-resume-portfolio-hosting",
    tier: "portfolio",
    name_en: "Resume / Portfolio Hosting",
    name_uk: "Хостинг резюме / портфоліо",
    priceUsd: 0,
    durationDays: null,
    features_en: [
      "Verified analyst profile page with custom URL",
      "Portfolio showcase: reports, case studies, samples",
      "Skills and endorsements from verified colleagues",
      "Visibility in talent search (opt-in)",
    ],
    features_uk: [
      "Верифікована сторінка аналітика з власним URL",
      "Вітрина портфоліо: звіти, кейси, зразки",
      "Навички та рекомендації від верифікованих колег",
      "Видимість у пошуку талантів (за вибором)",
    ],
    notes_en: "Included for Pro and above subscribers. Basic profile available on Free tier.",
    notes_uk: "Включено для підписників Pro і вище. Базовий профіль доступний на рівні Free.",
  },
];

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * Moderation policy: all postings enter a review queue.
 *
 * Усі публікації проходять чергу модерації.
 */
export const JOB_MODERATION_NOTE_EN =
  "All job postings enter a moderation queue before going live. " +
  "Listings are reviewed for accuracy, relevance, and compliance with platform policies. " +
  "Suspicious, misleading, or low-quality postings are rejected without refund. " +
  "Typical review time: under 24 hours (4 hours for Employer Subscription holders).";

export const JOB_MODERATION_NOTE_UK =
  "Усі публікації вакансій проходять чергу модерації перед публікацією. " +
  "Оголошення перевіряються на точність, релевантність та відповідність правилам платформи. " +
  "Підозрілі, оманливі або неякісні публікації відхиляються без відшкодування. " +
  "Стандартний час перевірки: до 24 годин (4 години для власників річної підписки).";

/**
 * Categories prohibited from posting on the platform.
 *
 * Категорії, яким заборонено публікувати на платформі.
 */
export const JOB_PROHIBITED_CATEGORIES_EN =
  "Job postings are NOT accepted from: " +
  "(1) entities on any UN, EU, US OFAC, or UK OFSI sanctions list; " +
  "(2) commercial surveillance vendors and stalkerware developers; " +
  "(3) entities listed on export control lists (EAR, ITAR, or equivalent); " +
  "(4) organizations designated as supporting armed aggression against Ukraine; " +
  "(5) entities under active investigation for human rights violations.";

export const JOB_PROHIBITED_CATEGORIES_UK =
  "Публікації вакансій НЕ приймаються від: " +
  "(1) суб'єктів у будь-якому санкційному списку ООН, ЄС, OFAC США або OFSI Великої Британії; " +
  "(2) комерційних постачальників засобів стеження та розробників сталкервару; " +
  "(3) суб'єктів у списках контролю над експортом (EAR, ITAR або еквівалент); " +
  "(4) організацій, що підтримують збройну агресію проти України; " +
  "(5) суб'єктів під активним розслідуванням щодо порушень прав людини.";

/**
 * KYC requirement for freelancers.
 *
 * Вимоги KYC для фрилансерів.
 */
export const JOB_FREELANCE_KYC_NOTE_EN =
  "All freelancers must complete identity verification (KYC) before their first payout. " +
  "KYC includes: government-issued ID, proof of address, and platform agreement signature. " +
  "Payouts are held in escrow until KYC is complete. " +
  "KYC status is re-verified annually or upon suspicious activity.";

export const JOB_FREELANCE_KYC_NOTE_UK =
  "Усі фрилансери повинні пройти верифікацію особи (KYC) перед першою виплатою. " +
  "KYC включає: посвідчення особи державного зразка, підтвердження адреси та підпис угоди. " +
  "Виплати утримуються в ескроу до завершення KYC. " +
  "Статус KYC перевіряється щорічно або при підозрілій активності.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute platform commission on a freelance gig.
 * Rate: 15% for gigs under $500, 10% for gigs $500 and above.
 *
 * Розраховує комісію платформи за фриланс-гіг.
 */
export function computeFreelanceCommission(gigValueUsd: number): number {
  if (gigValueUsd < 0) {
    throw new RangeError(`[job-board] gigValueUsd must be non-negative, got ${gigValueUsd}`);
  }
  const rate = gigValueUsd >= 500 ? 0.10 : 0.15;
  return Math.round(gigValueUsd * rate * 100) / 100;
}

/**
 * Look up a job product by id.
 *
 * Повертає продукт за ідентифікатором.
 */
export function getJobProduct(id: string): JobProduct | undefined {
  return JOB_PRODUCTS.find((p) => p.id === id);
}
