/**
 * Rule Builder Gate — block watchlist rules that target private individuals.
 *
 * Called before any Rule Builder watchlist is saved or activated.
 * Private individuals require KYC-verified Business/Enterprise tier.
 *
 * Блокує правила спостереження, що цілять у приватних осіб, без верифікації KYC.
 */

import { classifyPersonMentions, NER_CONFIDENCE_THRESHOLD } from "./ner-classifier";

// ── Notes ─────────────────────────────────────────────────────────────────────

export const PRIVATE_INDIVIDUAL_GATE_NOTE_EN =
  "Rule Builder must never allow watchlists targeting private individuals on free/observer tiers.";

export const PRIVATE_INDIVIDUAL_GATE_NOTE_UK =
  "Rule Builder не може дозволяти спостереження за приватними особами на рівнях free/observer.";

// ── KYC-required tiers ────────────────────────────────────────────────────────

/**
 * Only users on these tiers (after KYC) may build rules that involve private individuals.
 *
 * Лише верифіковані користувачі цих рівнів можуть створювати правила для приватних осіб.
 */
export const KYC_REQUIRED_TIERS: readonly string[] = ["business", "enterprise"];

// ── RuleBuilderGateResult ─────────────────────────────────────────────────────

export interface RuleBuilderGateResult {
  /** Whether the rule is permitted to be created */
  allowed: boolean;
  /** Classification that triggered the gate (if blocked) */
  triggeringClassification:
    | "private-individual"
    | "low-confidence"
    | null;
  /** Human-readable reason for the decision */
  reason: string;
  /** Whether KYC upgrade would unlock this action */
  kycUpgradeRequired: boolean;
}

// ── checkRuleBuilderTarget ────────────────────────────────────────────────────

/**
 * Check whether a watchlist target string is allowed under the Rule Builder gate.
 *
 * - Public figures → always allowed.
 * - Organizations / locations → always allowed.
 * - Private individuals → blocked unless caller provides a KYC-verified tier.
 * - Low-confidence / ambiguous → blocked pending manual review.
 *
 * Перевіряє чи дозволено цільовий рядок для Rule Builder.
 */
export function checkRuleBuilderTarget(
  watchlistTarget: string,
  userTier = "free",
  kycVerified = false,
): RuleBuilderGateResult {
  const mentions = classifyPersonMentions(watchlistTarget);

  // No person-like entity detected → allow (could be keyword/location rule)
  if (mentions.length === 0) {
    return {
      allowed: true,
      triggeringClassification: null,
      reason: "No person entity detected in target — rule permitted.",
      kycUpgradeRequired: false,
    };
  }

  // Check for any private-individual classification above threshold
  const privateHits = mentions.filter(
    (m) =>
      m.personType === "private-individual" &&
      m.confidence >= NER_CONFIDENCE_THRESHOLD,
  );

  if (privateHits.length > 0) {
    const tierAllowed = KYC_REQUIRED_TIERS.includes(userTier) && kycVerified;
    return {
      allowed: tierAllowed,
      triggeringClassification: "private-individual",
      reason: tierAllowed
        ? "Private individual target permitted — KYC-verified business/enterprise tier."
        : "Watchlist rules targeting private individuals require a KYC-verified Business or Enterprise account.",
      kycUpgradeRequired: !tierAllowed,
    };
  }

  // Low-confidence hits → flag for manual review (block by default)
  const lowConfidenceHits = mentions.filter(
    (m) => m.confidence < NER_CONFIDENCE_THRESHOLD,
  );

  if (lowConfidenceHits.length > 0) {
    return {
      allowed: false,
      triggeringClassification: "low-confidence",
      reason:
        "Target entity confidence is below threshold. Escalated to manual review before rule activation.",
      kycUpgradeRequired: false,
    };
  }

  // All entities are public figures / orgs / locations → allow
  return {
    allowed: true,
    triggeringClassification: null,
    reason: "Target classified as public figure / organization / location — rule permitted.",
    kycUpgradeRequired: false,
  };
}
