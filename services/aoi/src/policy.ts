/**
 * AOI access policy enforcement.
 *
 * Enforces ethical and legal controls on the creation and monitoring of
 * sensitive AOIs (civilian locations, shelters, hospitals, military sites).
 *
 * Policy decisions are reviewed by the ethics board before any new category
 * is added or threshold is changed.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN policy notes */
export const AOI_POLICY_NOTES_EN = [
  "ethics-board-review: all changes to AOI_POLICY_RULES require ethics board sign-off; document in CHANGELOG with board reference",
  "real-time-civilian-prohibited-for-community: real-time high-precision tracking of civilian / shelter / hospital AOIs is prohibited for community users; enterprise + KYC required",
  "legal-review-military: military facility AOIs require enterprise tier + KYC + explicit legal team sign-off (export-control and IHL compliance)",
] as const;

/** UA нотатки з політики */
export const AOI_POLICY_NOTES_UK = [
  "ethics-board-review: всі зміни в AOI_POLICY_RULES потребують підтвердження ради з етики; документуйте в CHANGELOG з посиланням на рішення ради",
  "real-time-civilian-prohibited-for-community: відстеження цивільних/укриттів/лікарень у реальному часі заборонено для community-користувачів; потрібні enterprise + KYC",
  "legal-review-military: AOI військових об'єктів потребують enterprise-рівня + KYC + явного затвердження юридичної команди (відповідність контролю експорту та МГП)",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Semantic category of an AOI for policy purposes */
export type AOIRiskCategory =
  | "civilian"
  | "shelter"
  | "hospital"
  | "school"
  | "infrastructure"
  | "military"
  | "general";

/** Result of a policy check */
export interface AOIPolicyCheck {
  allowed: boolean;
  requiresKYC: boolean;
  requiresEnterprise: boolean;
  /** Reason in English (present when allowed = false or requirements not met) */
  reason?: string;
  /** Reason in Ukrainian */
  reasonUk?: string;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

interface PolicyRule {
  requiresEnterprise: boolean;
  requiresKYC: boolean;
  requiresLegalReview: boolean;
  blockedTiers: string[];
}

/**
 * Per-category policy rules.
 *
 * Changes here must be reviewed by the ethics board (see AOI_POLICY_NOTES_EN[0]).
 */
export const AOI_POLICY_RULES: Record<AOIRiskCategory, PolicyRule> = {
  civilian: {
    requiresEnterprise: true,
    requiresKYC: true,
    requiresLegalReview: false,
    blockedTiers: ["free", "pro"],
  },
  shelter: {
    requiresEnterprise: true,
    requiresKYC: true,
    requiresLegalReview: false,
    blockedTiers: ["free", "pro"],
  },
  hospital: {
    requiresEnterprise: true,
    requiresKYC: true,
    requiresLegalReview: false,
    blockedTiers: ["free", "pro"],
  },
  school: {
    requiresEnterprise: true,
    requiresKYC: true,
    requiresLegalReview: false,
    blockedTiers: ["free", "pro"],
  },
  infrastructure: {
    requiresEnterprise: false,
    requiresKYC: true,
    requiresLegalReview: false,
    blockedTiers: ["free"],
  },
  military: {
    requiresEnterprise: true,
    requiresKYC: true,
    requiresLegalReview: true,
    blockedTiers: ["free", "pro"],
  },
  general: {
    requiresEnterprise: false,
    requiresKYC: false,
    requiresLegalReview: false,
    blockedTiers: [],
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether a user may create / access an AOI of the given category.
 *
 * @param category — semantic category of the AOI
 * @param userTier — "free" | "pro" | "enterprise" (or any custom tier string)
 * @param isKYCVerified — whether the user has passed KYC
 */
export function checkAOIPolicy(
  category: AOIRiskCategory,
  userTier: string,
  isKYCVerified: boolean,
): AOIPolicyCheck {
  const rule = AOI_POLICY_RULES[category];

  if (rule.blockedTiers.includes(userTier)) {
    const tierMsg = rule.requiresEnterprise
      ? "enterprise tier + KYC verification"
      : "pro tier or above + KYC verification";
    return {
      allowed: false,
      requiresKYC: rule.requiresKYC,
      requiresEnterprise: rule.requiresEnterprise,
      reason: `AOI category '${category}' requires ${tierMsg}. Current tier: ${userTier}.`,
      reasonUk: `Категорія AOI '${category}' потребує ${
        rule.requiresEnterprise
          ? "enterprise-рівня + верифікації KYC"
          : "pro-рівня або вище + верифікації KYC"
      }. Поточний рівень: ${userTier}.`,
    };
  }

  if (rule.requiresKYC && !isKYCVerified) {
    return {
      allowed: false,
      requiresKYC: true,
      requiresEnterprise: rule.requiresEnterprise,
      reason: `AOI category '${category}' requires KYC verification before access is granted.`,
      reasonUk: `Категорія AOI '${category}' потребує верифікації KYC перед наданням доступу.`,
    };
  }

  if (rule.requiresLegalReview) {
    return {
      allowed: false,
      requiresKYC: rule.requiresKYC,
      requiresEnterprise: rule.requiresEnterprise,
      reason: `AOI category '${category}' requires explicit legal team sign-off (export-control + IHL compliance). Contact enterprise support.`,
      reasonUk: `Категорія AOI '${category}' потребує явного затвердження юридичної команди (відповідність контролю експорту та МГП). Зверніться до enterprise-підтримки.`,
    };
  }

  return {
    allowed: true,
    requiresKYC: rule.requiresKYC,
    requiresEnterprise: rule.requiresEnterprise,
  };
}
