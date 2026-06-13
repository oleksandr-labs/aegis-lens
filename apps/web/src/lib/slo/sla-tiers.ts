// Customer-facing Service-Level Agreements (SLAs) for Aegis Lens.
//
// SLAs are the externally-promised, contractual reliability commitments per
// subscription tier. They are intentionally looser than the internal SLOs in
// ./slo-definitions.ts (the gap is the safety margin). Breaching an SLA can
// owe a customer service credits; breaching an SLO only spends internal budget.

export type SlaTierId = "free" | "pro" | "team" | "enterprise" | "gov";

export interface SupportResponseTarget {
  /** First-response target in hours, null for best-effort with no commitment. */
  firstResponseHours: number | null;
  firstResponseLabel: string;
  /** Support coverage window. */
  coverage: "best-effort" | "business-hours" | "24/7";
}

export interface SlaTier {
  tier: SlaTierId;
  displayName: string;
  /** Contractual uptime as a fraction, null when no uptime SLA is offered. */
  uptimeTarget: number | null;
  uptimeLabel: string;
  support: SupportResponseTarget;
  /** Whether a written, published SLA document exists for this tier. */
  slaPublished: boolean;
  /** Whether service credits apply when the SLA is breached. */
  serviceCreditsApply: boolean;
  description_en: string;
  description_uk: string;
}

export const SLA_TIERS: Record<SlaTierId, SlaTier> = {
  free: {
    tier: "free",
    displayName: "Free",
    uptimeTarget: null,
    uptimeLabel: "No SLA — best-effort",
    support: {
      firstResponseHours: null,
      firstResponseLabel: "Community / best-effort, no commitment",
      coverage: "best-effort",
    },
    slaPublished: false,
    serviceCreditsApply: false,
    description_en:
      "Free tier carries no uptime SLA and no support response commitment. Service is provided best-effort. Reliability still benefits from internal SLOs, but no contractual guarantee is made and no credits accrue.",
    description_uk:
      "Безкоштовний рівень не має SLA доступності та зобов'язань щодо відповіді підтримки. Послуга надається за принципом найкращих зусиль. На надійність усе ще впливають внутрішні SLO, але жодних договірних гарантій не надається і кредити не нараховуються.",
  },
  pro: {
    tier: "pro",
    displayName: "Pro",
    uptimeTarget: 0.995,
    uptimeLabel: "99.5% monthly uptime",
    support: {
      firstResponseHours: 24,
      firstResponseLabel: "24h first response",
      coverage: "business-hours",
    },
    slaPublished: true,
    serviceCreditsApply: true,
    description_en:
      "Pro tier: 99.5% monthly uptime (≈3.6h/month allowed downtime) with a 24h support first-response target during business hours. Published SLA with service credits on breach.",
    description_uk:
      "Рівень Pro: 99.5% щомісячної доступності (≈3.6 год/міс дозволеного простою) з ціллю першої відповіді підтримки 24 год у робочі години. Опублікований SLA з кредитами при порушенні.",
  },
  team: {
    tier: "team",
    displayName: "Team",
    uptimeTarget: 0.999,
    uptimeLabel: "99.9% monthly uptime",
    support: {
      firstResponseHours: 4,
      firstResponseLabel: "4h first response",
      coverage: "business-hours",
    },
    slaPublished: true,
    serviceCreditsApply: true,
    description_en:
      "Team tier: 99.9% monthly uptime (≈43min/month allowed downtime) with a 4h support first-response target during business hours. Published SLA with service credits on breach.",
    description_uk:
      "Рівень Team: 99.9% щомісячної доступності (≈43 хв/міс дозволеного простою) з ціллю першої відповіді підтримки 4 год у робочі години. Опублікований SLA з кредитами при порушенні.",
  },
  enterprise: {
    tier: "enterprise",
    displayName: "Enterprise",
    uptimeTarget: 0.9995,
    uptimeLabel: "99.95% monthly uptime",
    support: {
      firstResponseHours: 1,
      firstResponseLabel: "1h first response",
      coverage: "24/7",
    },
    slaPublished: true,
    serviceCreditsApply: true,
    description_en:
      "Enterprise tier: 99.95% monthly uptime (≈21.5min/month allowed downtime) with a 1h support first-response target, 24/7. Published SLA, service credits on breach, and a monthly per-customer SLA report (see ENTERPRISE_SLA_REPORT).",
    description_uk:
      "Рівень Enterprise: 99.95% щомісячної доступності (≈21.5 хв/міс дозволеного простою) з ціллю першої відповіді підтримки 1 год, 24/7. Опублікований SLA, кредити при порушенні та щомісячний SLA-звіт для кожного клієнта (див. ENTERPRISE_SLA_REPORT).",
  },
  gov: {
    tier: "gov",
    displayName: "Government",
    uptimeTarget: 0.9999,
    uptimeLabel: "99.99% monthly uptime (contract-dependent)",
    support: {
      firstResponseHours: 1,
      firstResponseLabel: "1h first response (or tighter per contract)",
      coverage: "24/7",
    },
    slaPublished: false,
    serviceCreditsApply: true,
    description_en:
      "Government tier: 99.99% monthly uptime target (≈4.3min/month) as a contract-dependent baseline. Exact uptime, response times, credits, region restrictions, and reporting are negotiated per contract rather than published. 24/7 coverage.",
    description_uk:
      "Урядовий рівень: ціль 99.99% щомісячної доступності (≈4.3 хв/міс) як договірно-залежна базова лінія. Точна доступність, час відповіді, кредити, регіональні обмеження та звітність узгоджуються за контрактом, а не публікуються. Покриття 24/7.",
  },
};

/**
 * Service-credit policy: percentage of the monthly fee credited per uptime
 * band. Bands are evaluated against the achieved monthly uptime for the tier.
 * Applies to tiers where serviceCreditsApply is true; gov bands may be
 * superseded by contract.
 */
export interface ServiceCreditBand {
  /** Inclusive lower bound of achieved uptime for this band (fraction). */
  uptimeAtLeast: number;
  /** Exclusive upper bound (fraction); below this band's commitment. */
  uptimeBelow: number;
  label: string;
  /** Percent of monthly fee credited. */
  creditPercent: number;
}

export const SERVICE_CREDIT_POLICY: ServiceCreditBand[] = [
  {
    uptimeAtLeast: 0.99,
    uptimeBelow: 0.9995,
    label: "below committed uptime but ≥ 99.0%",
    creditPercent: 10,
  },
  {
    uptimeAtLeast: 0.95,
    uptimeBelow: 0.99,
    label: "≥ 95.0% and < 99.0%",
    creditPercent: 25,
  },
  {
    uptimeAtLeast: 0.0,
    uptimeBelow: 0.95,
    label: "< 95.0%",
    creditPercent: 50,
  },
];

export const SERVICE_CREDIT_POLICY_NOTE_EN =
  "Credits are calculated against the achieved monthly uptime versus the tier commitment, applied as a percentage of that month's fee, and capped at 50% of the monthly fee. Credits must be requested within 30 days of the affected month and are the customer's sole remedy for SLA breach. Excluded: scheduled maintenance announced ≥72h ahead, force majeure, and customer-caused outages.";

export const SERVICE_CREDIT_POLICY_NOTE_UK =
  "Кредити розраховуються відносно досягнутої щомісячної доступності проти зобов'язання рівня, застосовуються як відсоток від плати за цей місяць та обмежені 50% місячної плати. Кредити мають бути запитані протягом 30 днів після ураженого місяця і є єдиним засобом захисту клієнта при порушенні SLA. Виключено: планове обслуговування, оголошене за ≥72 год, форс-мажор та простої з вини клієнта.";

/**
 * Per-region SLA variants. Some tiers offer region-pinned deployments with
 * their own uptime baselines; data-residency-restricted regions may carry a
 * slightly relaxed uptime due to fewer availability zones.
 */
export interface RegionalSlaVariant {
  region: string;
  /** Tiers for which this regional variant is offered. */
  appliesToTiers: SlaTierId[];
  /** Region-specific uptime override, null = same as tier default. */
  uptimeOverride: number | null;
  dataResidency: boolean;
  note: string;
}

export const REGIONAL_SLA_VARIANTS: RegionalSlaVariant[] = [
  {
    region: "eu-central (Frankfurt)",
    appliesToTiers: ["enterprise", "gov"],
    uptimeOverride: null,
    dataResidency: true,
    note: "Default multi-AZ region; EU data residency. Standard tier uptime applies.",
  },
  {
    region: "eu-west (Ireland)",
    appliesToTiers: ["team", "enterprise"],
    uptimeOverride: null,
    dataResidency: true,
    note: "Secondary EU region for failover and residency. Standard tier uptime applies.",
  },
  {
    region: "uk-south (London)",
    appliesToTiers: ["enterprise", "gov"],
    uptimeOverride: 0.999,
    dataResidency: true,
    note: "UK data-residency-pinned region with fewer availability zones; uptime relaxed to 99.9% for region-locked deployments unless the contract provisions additional capacity.",
  },
];

/** Monthly per-enterprise-customer SLA report descriptor. */
export interface EnterpriseSlaReport {
  cadence: "monthly";
  audience: "per-enterprise-customer";
  sections: string[];
  delivery: string;
  description_en: string;
  description_uk: string;
}

export const ENTERPRISE_SLA_REPORT: EnterpriseSlaReport = {
  cadence: "monthly",
  audience: "per-enterprise-customer",
  sections: [
    "achieved uptime vs 99.95% commitment for the month",
    "incident summary with durations and root-cause references",
    "support first-response performance vs the 1h target",
    "any service credits owed under SERVICE_CREDIT_POLICY",
    "upcoming scheduled maintenance windows",
  ],
  delivery:
    "Generated within 5 business days of month-end, delivered to the customer's named technical contact, and archived for the contract term.",
  description_en:
    "Each Enterprise (and contract-dependent Gov) customer receives a monthly SLA report reconciling achieved uptime and support performance against their commitments, listing incidents and any credits owed. It is the customer-facing counterpart to the internal monthly budget review.",
  description_uk:
    "Кожен клієнт Enterprise (та договірно-залежний Gov) отримує щомісячний SLA-звіт, що звіряє досягнуту доступність та продуктивність підтримки з їхніми зобов'язаннями, перелічує інциденти та будь-які належні кредити. Це клієнтський аналог внутрішнього щомісячного огляду бюджету.",
};
