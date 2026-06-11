/**
 * Experts Directory — verified analysts, journalists, academics, advisors.
 * Doubles as E-E-A-T signal and hiring funnel.
 * Каталог експертів — верифіковані аналітики, журналісти, науковці, консультанти.
 * Також сигнал E-E-A-T та канал пошуку фахівців.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Domain of expertise for a listed expert.
 * Галузь експертизи для зареєстрованого фахівця.
 */
export type ExpertDomain =
  | "osint"
  | "geolocation"
  | "satellite-analysis"
  | "disinformation"
  | "cyber-threat-intel"
  | "conflict-reporting"
  | "humanitarian"
  | "maritime-intel"
  | "drone-warfare"
  | "open-source-law";

/**
 * Availability status of an expert for new engagements.
 * Статус доступності експерта для нових взаємодій.
 */
export type ExpertAvailability =
  | "available"
  | "limited"
  | "by-request"
  | "not-available";

/**
 * Types of credentials that can verify an expert's identity and expertise.
 * Типи облікових даних для верифікації особи та компетентності експерта.
 */
export type ExpertCredentialType =
  | "academic-publication"
  | "employer-verification"
  | "linkedin-employer"
  | "press-card"
  | "security-clearance-note"
  | "platform-track-record";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Full profile for a verified expert listed in the directory.
 * Повний профіль верифікованого експерта в каталозі.
 */
export interface ExpertProfile {
  id: string;
  slug: string;
  name: string;
  bio_en: string;
  bio_uk: string;
  credentials: ExpertCredentialType[];
  domains: ExpertDomain[];
  regionsExpertise: string[];
  languages: string[];
  publications_en: string[];
  availability: ExpertAvailability;
  bookingEnabled: boolean;
  featuredTier: boolean;
  privacyOptIn: boolean;
  ratingAvg: number | null;
  reviewCount: number;
  linkedToEeat: boolean;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// In-memory store (replace with DB adapter in production)
// ---------------------------------------------------------------------------

const _experts: ExpertProfile[] = [];

// ---------------------------------------------------------------------------
// Constants — EN + UK pairs
// ---------------------------------------------------------------------------

export const EXPERT_VERIFICATION_PROCESS_EN =
  "Each expert undergoes a multi-step verification: (1) LinkedIn employer match or academic publication check, " +
  "(2) independent employer confirmation where required, (3) manual editorial review by the Aegis Lens team, " +
  "(4) Verified badge granted upon successful completion. Profiles are re-audited annually.";

export const EXPERT_VERIFICATION_PROCESS_UK =
  "Кожен експерт проходить багатоетапну верифікацію: (1) підтвердження роботодавця через LinkedIn або перевірка " +
  "наукових публікацій, (2) незалежне підтвердження роботодавця за потреби, (3) ручний редакційний розгляд " +
  "командою Aegis Lens, (4) значок «Верифіковано» після успішного проходження. Профілі переперевіряються щорічно.";

export const EXPERT_BOOKING_NOTE_EN =
  "Experts with bookingEnabled=true accept contact requests through the platform. Short-engagement bookings " +
  "(consulting calls, written analysis, review) are facilitated via a structured workflow. " +
  "The platform retains 10% of the first booking as a service fee; subsequent engagements are direct.";

export const EXPERT_BOOKING_NOTE_UK =
  "Експерти з bookingEnabled=true приймають запити на контакт через платформу. Короткострокові замовлення " +
  "(консультаційні дзвінки, письмовий аналіз, рецензія) здійснюються через структурований робочий процес. " +
  "Платформа утримує 10% від першого замовлення як сервісну комісію; подальші взаємодії є прямими.";

export const EXPERT_PRIVACY_NOTE_EN =
  "Participation in the public experts directory is strictly opt-in. By default every profile is private " +
  "and visible only to the expert themselves and platform administrators. " +
  "A profile becomes publicly listed only after the expert explicitly sets privacyOptIn=true.";

export const EXPERT_PRIVACY_NOTE_UK =
  "Участь у публічному каталозі експертів є виключно добровільною. За замовчуванням кожен профіль є приватним " +
  "і видимим лише для самого експерта та адміністраторів платформи. " +
  "Профіль стає публічно доступним лише після того, як експерт явно встановлює privacyOptIn=true.";

export const EXPERT_FEATURED_NOTE_EN =
  "Featured-tier placement elevates an expert profile to the top of relevant search results and category pages. " +
  "This is a paid placement. All featured listings carry a visible 'Sponsored' or 'Featured' disclosure label " +
  "in compliance with advertising standards. Editorial independence of non-featured content is not affected.";

export const EXPERT_FEATURED_NOTE_UK =
  "Розміщення на рівні «Featured» піднімає профіль експерта на верх відповідних результатів пошуку та " +
  "сторінок категорій. Це є платним розміщенням. Усі виділені профілі мають видиму позначку " +
  "«Спонсоровано» або «Рекомендовано» відповідно до стандартів реклами. " +
  "Редакційна незалежність невиділеного контенту не порушується.";

export const EXPERT_EEAT_NOTE_EN =
  "Expert profiles are semantically linked to all content authored or reviewed by that expert. " +
  "This provides Google with verifiable E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) " +
  "signals, improving organic visibility for associated articles, reports, and analysis pages.";

export const EXPERT_EEAT_NOTE_UK =
  "Профілі експертів семантично пов'язані з усім контентом, написаним або рецензованим цим експертом. " +
  "Це надає Google верифіковані сигнали E-E-A-T (Досвід, Експертиза, Авторитетність, Надійність), " +
  "покращуючи органічну видимість пов'язаних статей, звітів та аналітичних сторінок.";

export const EXPERT_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes are generated for every domain and region combination: " +
  "/experts/<domain> (e.g. /experts/osint, /experts/geolocation) and " +
  "/experts/<region> (e.g. /experts/ukraine, /experts/black-sea). " +
  "Each page is statically generated with ISR revalidation every 24 hours.";

export const EXPERT_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути генеруються для кожної комбінації домену та регіону: " +
  "/experts/<domain> (наприклад /experts/osint, /experts/geolocation) та " +
  "/experts/<region> (наприклад /experts/ukraine, /experts/black-sea). " +
  "Кожна сторінка статично генерується з ISR-ревалідацією кожні 24 години.";

export const EXPERT_INTEGRITY_NOTE_EN =
  "Real experts only. Fabricated or unverifiable profiles are removed immediately. " +
  "One fake profile discovered and publicised can damage platform credibility for years. " +
  "All verifications are logged, auditable, and periodically re-confirmed.";

export const EXPERT_INTEGRITY_NOTE_UK =
  "Лише реальні експерти. Вигадані або неперевірювані профілі видаляються негайно. " +
  "Один фальшивий профіль, виявлений і оприлюднений, може завдати шкоди репутації платформи на роки. " +
  "Усі верифікації реєструються, підлягають аудиту та регулярно підтверджуються.";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a schema.org Person object from an ExpertProfile.
 * Створює об'єкт schema.org Person з профілю ExpertProfile.
 */
export function buildExpertSchemaOrg(profile: ExpertProfile): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://aegis.lens/experts/${profile.slug}`,
    name: profile.name,
    description: profile.bio_en,
    knowsAbout: profile.domains,
    knowsLanguage: profile.languages,
    hasCredential: profile.credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: c,
    })),
    ...(profile.ratingAvg !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: profile.ratingAvg,
        reviewCount: profile.reviewCount,
      },
    }),
  };
}

/**
 * Retrieve a single expert profile by id or slug.
 * Отримати профіль одного експерта за id або slug.
 */
export function getExpertProfile(
  idOrSlug: string,
): ExpertProfile | undefined {
  return _experts.find(
    (e) => e.id === idOrSlug || e.slug === idOrSlug,
  );
}

/**
 * Return all expert profiles (respects privacy opt-in).
 * Повертає всі профілі експертів (враховує налаштування приватності).
 */
export function getPublicExperts(): ExpertProfile[] {
  return _experts.filter((e) => e.privacyOptIn);
}

export const EXPERTS: ExpertProfile[] = _experts;
