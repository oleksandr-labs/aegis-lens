/**
 * Affiliate Revenue — commission configs for platform affiliate / referral program.
 * Covers channel eligibility, tier-based commission rates, payout mechanics,
 * and content guidelines for affiliate partners.
 *
 * Конфігурація комісій для афіліатної / реферальної програми платформи.
 * Охоплює придатність каналів, ставки комісій за рівнями, механіку виплат
 * та рекомендації щодо контенту для афіліатних партнерів.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Types of publisher / affiliate channel the program accepts.
 * Типи видавців / афіліатних каналів, які приймаються програмою.
 */
export type AffiliateChannelType =
  | "media-publisher"
  | "newsletter"
  | "podcast"
  | "osint-tool"
  | "academic-blog"
  | "linkedin-influencer";

/**
 * Affiliate partnership tier.
 * Рівень афіліатного партнерства.
 */
export type AffiliateTier = "standard" | "preferred" | "strategic";

// ── Interfaces ─────────────────────────────────────────────────────────────────

/**
 * Commission configuration for a single affiliate tier.
 * Конфігурація комісій для одного рівня афіліата.
 */
export interface AffiliateCommissionConfig {
  /** Tier identifier */
  tier: AffiliateTier;

  /**
   * Revenue share percentage for the first year of a referred subscription (0–100).
   * Відсоток розподілу доходу за перший рік реферальної підписки (0–100).
   */
  firstYearRevsharePercent: number;

  /**
   * Recurring revenue share percentage after the first year (0–100).
   * Поточний відсоток розподілу доходу після першого року (0–100).
   */
  recurringRevsharePercent: number;

  /**
   * Cookie attribution window in days.
   * Тривалість вікна атрибуції cookie у днях.
   */
  cookieDurationDays: number;

  /** Minimum traffic / audience requirement description — English */
  minTrafficRequirement_en: string;

  /** Minimum traffic / audience requirement description — Ukrainian */
  minTrafficRequirement_uk: string;

  /** Tier-specific operational notes — English */
  notes_en: string;

  /** Tier-specific operational notes — Ukrainian */
  notes_uk: string;
}

// ── Commission configs ─────────────────────────────────────────────────────────

/**
 * Three-tier affiliate commission structure.
 * Триступенева структура афіліатних комісій.
 */
export const AFFILIATE_COMMISSION_CONFIGS: AffiliateCommissionConfig[] = [
  {
    tier: "standard",
    firstYearRevsharePercent: 15,
    recurringRevsharePercent: 5,
    cookieDurationDays: 90,
    minTrafficRequirement_en:
      "No minimum traffic requirement; open to any qualified publisher meeting content guidelines.",
    minTrafficRequirement_uk:
      "Мінімальних вимог до трафіку немає; відкрито для будь-якого кваліфікованого видавця, що відповідає рекомендаціям щодо контенту.",
    notes_en:
      "Entry-level tier. Self-serve application via the affiliate portal. Payouts via Stripe Connect after reaching the $50 minimum threshold. NET30 payment terms.",
    notes_uk:
      "Початковий рівень. Самостійна заявка через портал афіліатів. Виплати через Stripe Connect після досягнення мінімального порогу $50. Умови оплати NET30.",
  },
  {
    tier: "preferred",
    firstYearRevsharePercent: 20,
    recurringRevsharePercent: 10,
    cookieDurationDays: 120,
    minTrafficRequirement_en:
      "Minimum 5,000 monthly unique visitors or 2,500 newsletter subscribers in a relevant OSINT / geopolitics / security audience segment.",
    minTrafficRequirement_uk:
      "Мінімум 5 000 унікальних відвідувачів на місяць або 2 500 підписників розсилки у відповідному сегменті аудиторії OSINT / геополітика / безпека.",
    notes_en:
      "Requires manual review and approval. Dedicated affiliate manager. Eligible for co-marketing opportunities and early product access. NET30 payment terms.",
    notes_uk:
      "Потребує ручного розгляду та затвердження. Виділений менеджер з афіліатів. Право на спільні маркетингові можливості та ранній доступ до продукту. Умови оплати NET30.",
  },
  {
    tier: "strategic",
    firstYearRevsharePercent: 25,
    recurringRevsharePercent: 15,
    cookieDurationDays: 180,
    minTrafficRequirement_en:
      "Established media brand, OSINT tool with 10,000+ active users, or academic institution with demonstrable audience reach in target verticals. Subject to individual negotiation.",
    minTrafficRequirement_uk:
      "Усталений медіабренд, OSINT-інструмент з 10 000+ активних користувачів або академічна установа з доведеним охопленням аудиторії в цільових вертикалях. Умови обговорюються індивідуально.",
    notes_en:
      "Editorial partnership model. Includes joint content creation, co-branded research, and priority API access. Custom contract; bespoke payment schedule negotiable. Annual transparency report co-authored.",
    notes_uk:
      "Модель редакційного партнерства. Включає спільне створення контенту, брендовані дослідження та пріоритетний доступ до API. Індивідуальний контракт; графік виплат обговорюється. Спільне авторство річного звіту прозорості.",
  },
];

// ── Channel eligibility ────────────────────────────────────────────────────────

/** Eligible affiliate channel types — English */
export const AFFILIATE_ELIGIBLE_CHANNELS_EN =
  "Eligible publisher types: independent media publishers, newsletters focused on OSINT / geopolitics / security / journalism, podcasts covering conflict analysis or investigative reporting, OSINT and geospatial tools, academic blogs affiliated with research institutions, and LinkedIn influencers with a verified professional following in target verticals.";

/** Eligible affiliate channel types — Ukrainian */
export const AFFILIATE_ELIGIBLE_CHANNELS_UK =
  "Прийнятні типи видавців: незалежні медіавидавці; розсилки, орієнтовані на OSINT / геополітику / безпеку / журналістику; подкасти про аналіз конфліктів або журналістські розслідування; OSINT- та геопросторові інструменти; академічні блоги, повʼязані з дослідницькими установами; LinkedIn-інфлюенсери з верифікованою професійною аудиторією в цільових вертикалях.";

/** Prohibited affiliate channels — English */
export const AFFILIATE_PROHIBITED_CHANNELS_EN =
  "Prohibited channels: spam and clickbait sites, coupon-only or cashback-only platforms, disinformation sites or channels aligned with state-sponsored influence operations, sites promoting weapons or surveillance tools for authoritarian use, and any channel that cannot demonstrate authentic editorial independence.";

/** Prohibited affiliate channels — Ukrainian */
export const AFFILIATE_PROHIBITED_CHANNELS_UK =
  "Заборонені канали: спам- та клікбейт-сайти; платформи виключно купонів або кешбеку; сайти дезінформації або канали, повʼязані з державними операціями впливу; сайти, що просувають зброю або інструменти стеження для авторитарного використання; будь-який канал, що не може підтвердити справжню редакційну незалежність.";

// ── Tracking ───────────────────────────────────────────────────────────────────

/** Tracking methodology — English */
export const AFFILIATE_TRACKING_NOTE_EN =
  "All referrals are tracked via UTM parameters combined with server-side first-party attribution. Affiliate links use unique short-link slugs assigned per partner. Self-referral and circular referral chains are automatically blocked. Attribution disputes are resolved using server-side logs; cookie-only attribution is not accepted as sole evidence.";

/** Tracking methodology — Ukrainian */
export const AFFILIATE_TRACKING_NOTE_UK =
  "Усі реферали відстежуються за допомогою UTM-параметрів у поєднанні з серверною атрибуцією першої сторони. Афіліатні посилання використовують унікальні slug-короткі посилання, призначені кожному партнеру. Само-реферали та кільцеві реферальні ланцюги автоматично блокуються. Спори щодо атрибуції вирішуються на основі серверних журналів; атрибуція лише за cookie не приймається як єдиний доказ.";

// ── Payouts ────────────────────────────────────────────────────────────────────

/** Payout mechanics — English */
export const AFFILIATE_PAYOUT_NOTE_EN =
  "Minimum payout threshold: $50 USD. Payment schedule: NET30 (commissions earned in month M are paid by the end of month M+1). All payouts processed via Stripe Connect; affiliates must complete KYC before first payout. Commissions are calculated on net revenue after refunds and chargebacks.";

/** Payout mechanics — Ukrainian */
export const AFFILIATE_PAYOUT_NOTE_UK =
  "Мінімальний поріг виплат: $50 USD. Графік виплат: NET30 (комісії, зароблені у місяці M, виплачуються до кінця місяця M+1). Усі виплати здійснюються через Stripe Connect; афіліати повинні пройти KYC перед першою виплатою. Комісії розраховуються від чистого доходу після повернень коштів та чарджбеків.";

// ── Content guidelines ─────────────────────────────────────────────────────────

/** Content guidelines — English */
export const AFFILIATE_CONTENT_GUIDELINES_EN =
  "Affiliates must not misrepresent platform capabilities, pricing, or data accuracy in promotional content. Sponsored or affiliate-linked content must be clearly disclosed in accordance with applicable advertising standards (FTC, CAP Code, etc.). Paid-to-post arrangements are prohibited without explicit written disclosure. Affiliates may not claim endorsements or partnerships beyond what is contractually agreed. Violation of these guidelines results in immediate commission forfeiture and removal from the program.";

/** Content guidelines — Ukrainian */
export const AFFILIATE_CONTENT_GUIDELINES_UK =
  "Афіліати не повинні спотворювати можливості платформи, ціноутворення або точність даних у рекламних матеріалах. Спонсорований або афіліатний контент повинен бути чітко розкритий відповідно до застосовних рекламних стандартів (FTC, CAP Code тощо). Угоди про оплату публікацій заборонені без явного письмового розкриття. Афіліати не можуть заявляти про підтримку або партнерство понад те, що передбачено контрактом. Порушення цих правил призводить до негайної втрати комісії та видалення з програми.";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Compute the affiliate commission for a referred contract.
 *
 * Обчислює афіліатну комісію для реферального контракту.
 *
 * @param totalContractUsd  Total gross contract value in USD.
 * @param tier              Affiliate tier ("standard" | "preferred" | "strategic").
 * @param isFirstYear       true if the contract is in its first year; false for renewals.
 * @returns commissionUsd   Affiliate commission in USD, rounded to 2 decimal places.
 */
export function computeAffiliateCommission(
  totalContractUsd: number,
  tier: AffiliateTier,
  isFirstYear: boolean,
): number {
  if (totalContractUsd < 0) {
    throw new RangeError("totalContractUsd must be ≥ 0.");
  }

  const config = AFFILIATE_COMMISSION_CONFIGS.find((c) => c.tier === tier);
  if (!config) {
    throw new RangeError(`Unknown affiliate tier: "${tier}".`);
  }

  const percent = isFirstYear
    ? config.firstYearRevsharePercent
    : config.recurringRevsharePercent;

  return Math.round(totalContractUsd * (percent / 100) * 100) / 100;
}
