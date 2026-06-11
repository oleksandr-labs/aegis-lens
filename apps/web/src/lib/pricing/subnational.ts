/**
 * Sub-national / municipal / oblast government pricing
 *
 * Covers oblasts, city emergency-operations centers, civil defense, hospitals,
 * education ministries, border services, and allied embassies — distinct from
 * national-level gov-defense procurement (see tier-config.ts).
 *
 * Ціноутворення для субнаціонального рівня: ОВА, міські ЦУКи, НГУ, лікарні,
 * освітні міністерства, прикордонна служба, посольства союзників.
 */

// ── Buyer types ────────────────────────────────────────────────────────────────

/**
 * The seven sub-national buyer categories.
 * Сім категорій субнаціональних покупців.
 */
export type SubnationalBuyerType =
  | "oblast-regional-admin"
  | "city-emergency-operations"
  | "national-guard-civil-defense"
  | "hospitals-critical-infra"
  | "education-ministry"
  | "border-services"
  | "embassy-allied-country";

// ── Pricing models ─────────────────────────────────────────────────────────────

/**
 * The four pricing models applicable to sub-national contracts.
 * Чотири моделі ціноутворення для субнаціональних контрактів.
 */
export type SubnationalPricingModel =
  | "per-population"
  | "flat-regional"
  | "public-safety-grant"
  | "pilot-free";

// ── Contract interface ─────────────────────────────────────────────────────────

/**
 * A sub-national contract configuration entry.
 * Конфігурація субнаціонального контракту.
 */
export interface SubnationalContract {
  /** Typical buyer type for this pricing model */
  buyerType: SubnationalBuyerType;
  /** Pricing mechanism */
  pricingModel: SubnationalPricingModel;
  /** Minimum annual contract value in USD */
  minUsd: number;
  /** Maximum annual contract value in USD */
  maxUsd: number;
  /** Contract duration in years */
  periodYears: number;
  /** Human-readable description — English */
  description_en: string;
  /** Human-readable description — Ukrainian */
  description_uk: string;
  /** Typical sales cycle length in weeks */
  salesCycleWeeks: [number, number]; // [min, max]
  /** Whether the contract value must be disclosed publicly */
  requiresPublicDisclosure: boolean;
}

// ── Canonical contract entries ─────────────────────────────────────────────────

/**
 * One entry per pricing model — the canonical sub-national contract catalogue.
 * Один запис на модель ціноутворення — канонічний каталог субнаціональних контрактів.
 */
export const SUBNATIONAL_CONTRACTS: SubnationalContract[] = [
  {
    buyerType: "oblast-regional-admin",
    pricingModel: "per-population",
    minUsd: 5_000,
    maxUsd: 100_000,
    periodYears: 1,
    description_en:
      "Per-100k-residents annual license. Oblast or regional administration pays in proportion to population served. Scales naturally with region size.",
    description_uk:
      "Річна ліцензія на кожні 100 тис. мешканців. Обласна/регіональна адміністрація платить пропорційно чисельності населення. Природно масштабується залежно від розміру регіону.",
    salesCycleWeeks: [4, 8],
    requiresPublicDisclosure: true,
  },
  {
    buyerType: "city-emergency-operations",
    pricingModel: "flat-regional",
    minUsd: 25_000,
    maxUsd: 250_000,
    periodYears: 1,
    description_en:
      "Flat annual contract for a city or region regardless of population. Simple for procurement teams; predictable for budgeting cycles.",
    description_uk:
      "Фіксований річний контракт для міста або регіону незалежно від кількості населення. Простий для тендерних команд; передбачуваний для бюджетних циклів.",
    salesCycleWeeks: [6, 12],
    requiresPublicDisclosure: true,
  },
  {
    buyerType: "hospitals-critical-infra",
    pricingModel: "public-safety-grant",
    minUsd: 2_000,
    maxUsd: 25_000,
    periodYears: 1,
    description_en:
      "Heavily discounted pricing for public-safety grant recipients. Contract value is subsidised by public or donor funding. Requires grant confirmation letter.",
    description_uk:
      "Значно знижена ціна для отримувачів грантів із громадської безпеки. Вартість контракту субсидується з публічних або донорських коштів. Потрібний лист-підтвердження гранту.",
    salesCycleWeeks: [8, 16],
    requiresPublicDisclosure: true,
  },
  {
    buyerType: "national-guard-civil-defense",
    pricingModel: "pilot-free",
    minUsd: 0,
    maxUsd: 0,
    periodYears: 0, // 6-month pilot, then converts
    description_en:
      "Free 6-month pilot program. Full platform access for a defined region or unit. Converts to a paid flat-regional or per-population contract upon successful evaluation.",
    description_uk:
      "Безкоштовна 6-місячна пілотна програма. Повний доступ до платформи для визначеного регіону або підрозділу. Переходить у платний контракт після успішної оцінки.",
    salesCycleWeeks: [2, 4],
    requiresPublicDisclosure: false,
  },
];

// ── Feature inclusions ─────────────────────────────────────────────────────────

/**
 * Features included in all sub-national contracts (beyond the base SaaS tier).
 * Функції, що входять до всіх субнаціональних контрактів (понад базовий SaaS-рівень).
 */
export const SUBNATIONAL_INCLUSIONS = {
  /** Custom integration with regional air-raid siren / alert infra */
  customSirensIntegration: true,
  /** Data scope restricted to the buyer's region + configurable buffer zone */
  regionRestrictedScope: true,
  /** Ukrainian + regional language UI, Telegram bots, automated briefings */
  localLanguageBots: true,
  /** Onboarding training sessions for civil-service staff */
  staffTraining: true,
  /** Annual platform review session with regional authorities */
  annualReview: true,
} as const;

// ── Constraints ────────────────────────────────────────────────────────────────

/**
 * Hard constraints applying to all sub-national civilian contracts.
 * Жорсткі обмеження для всіх субнаціональних цивільних контрактів.
 */
export const SUBNATIONAL_CONSTRAINTS = {
  /**
   * Civilian agencies do not receive access to defense-classified or
   * offensive-use data layers (those are gov-defense tier only).
   * Цивільні агенції не мають доступу до оборонно-класифікованих або
   * наступальних шарів даних (лише рівень gov-defense).
   */
  noDefenseDataForCivilian: true,
  /**
   * Platform must not be used for offensive military operations planning.
   * Платформа не може використовуватися для планування наступальних операцій.
   */
  noOffensiveUse: true,
  /**
   * Where local law (e.g. UA public procurement law) requires, contract
   * value and scope must be publicly disclosed in official registries.
   * Де місцеве законодавство вимагає, вартість і обсяг контракту
   * оприлюднюються у відповідних реєстрах.
   */
  publicTransparencyWhereRequired: true,
} as const;

// ── Buyer personas ─────────────────────────────────────────────────────────────

/**
 * Rich persona descriptions for each sub-national buyer type.
 * Детальні описи персон для кожної категорії субнаціональних покупців.
 */
export const SUBNATIONAL_BUYER_PERSONAS: Record<
  SubnationalBuyerType,
  { description_en: string; description_uk: string; typicalContractUsd: number }
> = {
  "oblast-regional-admin": {
    description_en:
      "Oblast / regional state administration (UA: ОВА). Responsible for civil preparedness, evacuation planning, and coordination with central government. Primary decision-maker: head of administration or deputy for security.",
    description_uk:
      "Обласна військова адміністрація (ОВА). Відповідає за цивільну готовність, планування евакуації та координацію з центральними органами. Головний ЛПР: голова адміністрації або заступник з питань безпеки.",
    typicalContractUsd: 40_000,
  },
  "city-emergency-operations": {
    description_en:
      "City emergency-operations center (EOC / ЦУК). Monitors real-time events, coordinates first responders, manages air-raid shelter logistics and civilian alerts.",
    description_uk:
      "Міський центр управління і контролю (ЦУК). Відстежує події в режимі реального часу, координує рятувальників, керує логістикою укриттів і цивільними оповіщеннями.",
    typicalContractUsd: 60_000,
  },
  "national-guard-civil-defense": {
    description_en:
      "National Guard units and civil-defense formations. Focus on perimeter monitoring, critical-infra protection, and civilian evacuation support. Operates within civilian legal framework.",
    description_uk:
      "Підрозділи Національної гвардії та формування цивільної оборони. Акцент на моніторингу периметра, захисті критичної інфраструктури та підтримці цивільної евакуації. Діють у межах цивільного правового поля.",
    typicalContractUsd: 30_000,
  },
  "hospitals-critical-infra": {
    description_en:
      "Hospitals, energy operators, water utilities, and other critical-infrastructure operators. Need early-warning feeds and situational awareness to protect staff and assets.",
    description_uk:
      "Лікарні, енергетичні оператори, водоканали та інші оператори критичної інфраструктури. Потребують ранніх попереджень і ситуаційної обізнаності для захисту персоналу та активів.",
    typicalContractUsd: 10_000,
  },
  "education-ministry": {
    description_en:
      "Regional education ministry or department. Responsible for school-safety protocols, evacuation drills, and protecting students during alerts. Integrates with school administration systems.",
    description_uk:
      "Регіональне міністерство або департамент освіти. Відповідає за протоколи безпеки шкіл, евакуаційні навчання та захист учнів під час тривог. Інтегрується зі шкільними адміністративними системами.",
    typicalContractUsd: 8_000,
  },
  "border-services": {
    description_en:
      "State Border Guard Service detachments. Monitor cross-border incident data, track movement patterns near crossing points, and coordinate with adjacent oblast administrations.",
    description_uk:
      "Підрозділи Державної прикордонної служби. Відстежують транскордонні інциденти, аналізують переміщення поблизу КПП, координуються з суміжними ОВА.",
    typicalContractUsd: 20_000,
  },
  "embassy-allied-country": {
    description_en:
      "Embassy or consulate of an allied country operating in Ukraine. Requires situational awareness for staff safety, evacuation planning, and diplomatic reporting. Often funded through defense-attaché or security budgets.",
    description_uk:
      "Посольство або консульство союзної країни, що діє в Україні. Потребує ситуаційної обізнаності для безпеки персоналу, планування евакуації та дипломатичної звітності. Зазвичай фінансується з бюджету воєнного аташе або безпеки.",
    typicalContractUsd: 15_000,
  },
};

// ── Helper function ────────────────────────────────────────────────────────────

/**
 * Returns the most-applicable contract configuration for a given buyer type.
 * Maps buyer types to their most natural pricing model.
 *
 * Повертає найбільш відповідний контракт для заданого типу покупця.
 */
export function getContractForBuyer(
  buyerType: SubnationalBuyerType,
): SubnationalContract {
  const modelMap: Record<SubnationalBuyerType, SubnationalPricingModel> = {
    "oblast-regional-admin": "per-population",
    "city-emergency-operations": "flat-regional",
    "national-guard-civil-defense": "pilot-free",
    "hospitals-critical-infra": "public-safety-grant",
    "education-ministry": "public-safety-grant",
    "border-services": "flat-regional",
    "embassy-allied-country": "flat-regional",
  };

  const model = modelMap[buyerType];
  const contract = SUBNATIONAL_CONTRACTS.find(
    (c) => c.pricingModel === model,
  );

  if (!contract) {
    throw new Error(`No contract found for buyer type: ${buyerType}`);
  }

  return contract;
}

// ── Notes ──────────────────────────────────────────────────────────────────────

export const SUBNATIONAL_NOTE_EN =
  "Sub-national contracts close faster than national-gov procurement. Many sub-$100k contracts make meaningful MRR.";

export const SUBNATIONAL_NOTE_UK =
  "Субнаціональні угоди закриваються швидше за держзакупівлі. Багато контрактів до $100k складають значний MRR.";
