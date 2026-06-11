/**
 * Managed AOI Concierge Service — tier definitions, pricing, and utilities.
 *
 * Three tiers: light ($499/AOI/mo), standard ($1,500/AOI/mo), 247 ($5,000/AOI/mo).
 * Bundle discount: 15 % off when ≥3 AOIs are under management.
 *
 * Три тарифи: light, standard, 247. Знижка 15 % при ≥3 AOI.
 */

import type {
  ConciergeContract,
  ConciergeServiceTier,
  CrisisSurgePricing,
} from "./types";

// ── Tier definitions ──────────────────────────────────────────────────────────

/**
 * Canonical array of all concierge contracts, ordered light → standard → 247.
 *
 * Масив контрактів для всіх тарифів сервісу.
 */
export const CONCIERGE_TIERS: ConciergeContract[] = [
  // ── Light ────────────────────────────────────────────────────────────────
  {
    tier: "light",
    priceUsd_per_aoi_per_month: 499,
    inclusions_en: [
      "Analyst-curated weekly intelligence brief for the AOI",
      "Up to 5 pre-configured alert rules maintained by the analyst team",
      "Monthly summary email delivered to up to 2 stakeholders",
      "Onboarding workshop to define monitoring scope and escalation contacts",
      "Access to verification queue with standard priority",
    ],
    inclusions_uk: [
      "Щотижневий аналітичний дайджест по AOI, підготовлений аналітиком",
      "До 5 попередньо налаштованих правил сповіщень, які підтримує команда аналітиків",
      "Щомісячний підсумковий лист до 2 стейкхолдерів",
      "Ознайомчий воркшоп для визначення обсягу моніторингу та контактів ескалації",
      "Доступ до черги верифікації зі стандартним пріоритетом",
    ],
    sla: {
      tier: "light",
      responseSla_hours: 72,
      escalationContacts: 1,
      humanCoverage: "weekly",
    },
    minBaseTier: "team",
  },

  // ── Standard ─────────────────────────────────────────────────────────────
  {
    tier: "standard",
    priceUsd_per_aoi_per_month: 1500,
    inclusions_en: [
      "Analyst-curated daily intelligence brief for the AOI",
      "Real-time critical-only alerts pushed directly to stakeholders",
      "Up to 15 custom alert rules maintained and tuned by the analyst team",
      "Custom dashboard built and kept up-to-date by the Aegis team",
      "Monthly executive summary (PDF, co-branded optional)",
      "Quarterly strategy review call with the lead analyst",
      "Onboarding workshop to define triggers, escalation contacts, and brief branding",
      "Verification queue priority access",
    ],
    inclusions_uk: [
      "Щоденний аналітичний дайджест по AOI, підготовлений аналітиком",
      "Сповіщення в реальному часі лише про критичні події для стейкхолдерів",
      "До 15 кастомних правил сповіщень, що підтримуються командою аналітиків",
      "Кастомна панель приладів, яку команда Aegis будує та підтримує в актуальному стані",
      "Щомісячне виконавче резюме (PDF, можливе кобрендування)",
      "Щоквартальний стратегічний дзвінок із провідним аналітиком",
      "Ознайомчий воркшоп для визначення тригерів, контактів ескалації та брендингу дайджесту",
      "Пріоритетний доступ до черги верифікації",
    ],
    sla: {
      tier: "standard",
      responseSla_hours: 12,
      escalationContacts: 2,
      humanCoverage: "daily",
    },
    minBaseTier: "team",
  },

  // ── 24/7 ─────────────────────────────────────────────────────────────────
  {
    tier: "247",
    priceUsd_per_aoi_per_month: 5000,
    inclusions_en: [
      "Round-the-clock human analyst coverage (24 hours, 7 days a week)",
      "Immediate escalation to senior analyst on high-severity events",
      "All alerts pushed in real-time; no batching",
      "Up to 40 custom alert rules maintained by a dedicated analyst pod",
      "Custom dashboard with live data feeds built and operated by the Aegis team",
      "Monthly executive summary + on-demand situation reports",
      "Quarterly review call + ad-hoc deep-dive sessions (up to 2/quarter)",
      "3 designated escalation contacts + emergency hotline access",
      "Onboarding workshop with full scope definition and runbook creation",
      "Highest verification queue priority across all AOIs",
    ],
    inclusions_uk: [
      "Цілодобове чергування людини-аналітика (24/7)",
      "Негайна ескалація до старшого аналітика при подіях високої серйозності",
      "Усі сповіщення — в реальному часі без пакетування",
      "До 40 кастомних правил сповіщень, що підтримуються виділеною командою аналітиків",
      "Кастомна панель із живими потоками даних, побудована й керована командою Aegis",
      "Щомісячне виконавче резюме + ситуаційні звіти на вимогу",
      "Щоквартальний дзвінок + позачергові поглиблені сесії (до 2 на квартал)",
      "3 контакти для ескалації + доступ до аварійної гарячої лінії",
      "Ознайомчий воркшоп із повним визначенням обсягу та створенням runbook",
      "Найвищий пріоритет у черзі верифікації для всіх AOI",
    ],
    sla: {
      tier: "247",
      responseSla_hours: 1,
      escalationContacts: 3,
      humanCoverage: "24-7",
    },
    minBaseTier: "team",
  },
];

// ── Bundle discount ───────────────────────────────────────────────────────────

/**
 * Percentage discount applied when a customer manages ≥3 AOIs simultaneously.
 * Applied to the total monthly invoice (all AOIs at the selected tier).
 *
 * Знижка при одночасному управлінні ≥3 AOI (застосовується до загального рахунку).
 */
export const MULTI_AOI_BUNDLE_DISCOUNT_PCT = 0.15;

// ── Crisis surge pricing ──────────────────────────────────────────────────────

/**
 * Temporary pricing uplift during a declared crisis or conflict event.
 * Reflects additional analyst hours, accelerated data sourcing, and on-call costs.
 *
 * Тимчасове підвищення ціни під час оголошеної кризи (множник 1.5×).
 */
export const CRISIS_SURGE: CrisisSurgePricing = {
  description_en:
    "During a declared crisis or active conflict event, the Concierge service " +
    "temporarily upgrades to crisis-response mode. Pricing is multiplied by 1.5× " +
    "to cover additional analyst hours, accelerated data sourcing, and on-call costs. " +
    "Customers are notified in advance and may opt out.",
  description_uk:
    "Під час оголошеної кризи або активної конфліктної події сервіс Concierge " +
    "тимчасово переходить у режим кризового реагування. Ціна зростає в 1.5 рази " +
    "для покриття додаткових годин аналітиків, прискореного збору даних та чергування. " +
    "Клієнти отримують попередження та можуть відмовитися.",
  surgeMultiplier: 1.5,
};

// ── Standard inclusions reference object ─────────────────────────────────────

/**
 * Named boolean flags describing what the Standard tier includes.
 * Useful for feature-comparison tables in the pricing UI.
 *
 * Іменовані прапорці включень стандартного тарифу для таблиці порівняння.
 */
export const CONCIERGE_INCLUSIONS_STANDARD = {
  /** Onboarding workshop to define monitoring scope and brief branding */
  onboardingWorkshop: true,
  /** Custom dashboard built and maintained by the Aegis team */
  customDashboard: true,
  /** Up to 15 custom alert rules tuned by the analyst team */
  customAlertRules: true,
  /** Priority position in the event verification queue */
  verificationQueuePriority: true,
  /** Monthly executive summary PDF */
  monthlyExecutiveSummary: true,
  /** Quarterly review call with the lead analyst */
  quarterlyReviewCall: true,
} as const;

// ── Utility functions ─────────────────────────────────────────────────────────

/**
 * Retrieve the full contract definition for a given concierge tier.
 *
 * @param tier - The concierge service tier to look up.
 * @returns The matching ConciergeContract.
 * @throws Error if an unknown tier is provided.
 *
 * Повернути повний опис контракту для заданого тарифу.
 */
export function getConciergeForTier(tier: ConciergeServiceTier): ConciergeContract {
  const contract = CONCIERGE_TIERS.find((c) => c.tier === tier);
  if (!contract) {
    throw new Error(
      `Unknown concierge tier: "${tier}". Valid tiers: light, standard, 247.`
    );
  }
  return contract;
}

/**
 * Compute the total monthly price for a given tier and AOI count,
 * applying the multi-AOI bundle discount when aoiCount >= 3.
 *
 * @param tier     - The concierge service tier.
 * @param aoiCount - Number of AOIs under management (must be >= 1).
 * @returns Total monthly price in USD after any applicable discount.
 *
 * Обчислює загальну місячну ціну з урахуванням знижки при ≥3 AOI.
 */
export function computeMultiAoiPrice(
  tier: ConciergeServiceTier,
  aoiCount: number
): number {
  const contract = getConciergeForTier(tier);
  const baseTotal = contract.priceUsd_per_aoi_per_month * aoiCount;
  if (aoiCount >= 3) {
    return baseTotal * (1 - MULTI_AOI_BUNDLE_DISCOUNT_PCT);
  }
  return baseTotal;
}
