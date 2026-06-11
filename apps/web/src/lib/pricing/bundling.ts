/**
 * Bundling rules — how tiers, add-ons, packs, services, and credits combine
 * and when discounts auto-apply.
 *
 * Source of truth: TODO/monetization/TODO_bundling_rules.md
 * Правила бандлінгу — як рівні, доповнення та пакети поєднуються зі знижками.
 */

import type { TierId } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

/** A single item in the checkout cart */
export interface CartItem {
  id: string;
  /** 'base' = tier subscription; 'addon' = add-on module; 'service' = pro-service; 'seat' = extra seat */
  type: "base" | "addon" | "service" | "seat";
  /** Monthly price in USD before any discounts */
  price_usd_mo: number;
  /** Quantity (seats) */
  quantity?: number;
  /** The computed discounted price after applying bundle rules */
  discounted_price_usd_mo?: number;
  /** Which bundle rule applied, if any */
  applied_rule_id?: string;
}

/** A bundling rule definition */
export interface BundleRule {
  /** Unique slug for this rule */
  id: string;
  /** Human-readable description — English */
  description_en: string;
  /** Human-readable description — Ukrainian */
  description_uk: string;
  /**
   * Discount fraction in [0, 1].
   * e.g. 0.15 = 15% off.
   */
  discount_fraction: number;
  /**
   * Condition function: returns true when this rule applies.
   * Rules are evaluated in order; only the highest-discount rule wins
   * (no stacking beyond defined combinations).
   */
  applies: (context: BundleContext) => boolean;
  /** Whether this rule can stack with other rules */
  stackable: boolean;
}

/** Context passed to each rule's applies() function */
export interface BundleContext {
  tierId: TierId;
  addonIds: string[];
  seatCount: number;
  billingCycle: "monthly" | "annual" | "biennial";
  items: CartItem[];
}

// ── Canonical bundle rules ────────────────────────────────────────────────────

/**
 * All active bundling rules, evaluated in order.
 * Only the single highest-discount non-stackable rule is applied
 * unless the rule is explicitly marked stackable: true.
 */
export const BUNDLE_RULES: BundleRule[] = [
  // ── Add-on volume ──────────────────────────────────────────────────────────
  {
    id: "addons-3plus",
    description_en: "3 or more add-ons stacked → 15% bundle discount",
    description_uk: "3 або більше доповнень у пакеті → знижка 15%",
    discount_fraction: 0.15,
    stackable: false,
    applies: (ctx) => ctx.addonIds.length >= 3 && ctx.addonIds.length < 5,
  },
  {
    id: "addons-5plus",
    description_en: "5 or more add-ons stacked → 25% bundle discount",
    description_uk: "5 або більше доповнень у пакеті → знижка 25%",
    discount_fraction: 0.25,
    stackable: false,
    applies: (ctx) => ctx.addonIds.length >= 5,
  },

  // ── Vertical pack ─────────────────────────────────────────────────────────
  {
    id: "vertical-pack",
    description_en: "Vertical pack auto-bundles its relevant add-ons at sum-of-parts minus 20%",
    description_uk: "Вертикальний пакет автоматично об'єднує відповідні доповнення зі знижкою 20% від суми",
    discount_fraction: 0.20,
    stackable: false,
    applies: (ctx) =>
      ctx.addonIds.some((id) => id.startsWith("pack-")),
  },

  // ── Billing cycle ─────────────────────────────────────────────────────────
  {
    id: "annual-billing",
    description_en: "Annual billing → 20% off any plan (industry-standard)",
    description_uk: "Річне виставлення рахунків → 20% знижки на будь-який план",
    discount_fraction: 0.20,
    stackable: true, // Can stack with seat discounts
    applies: (ctx) => ctx.billingCycle === "annual",
  },
  {
    id: "biennial-billing",
    description_en: "2-year commit → 30% off + price lock",
    description_uk: "2-річна угода → 30% знижки + фіксування ціни",
    discount_fraction: 0.30,
    stackable: false, // Replaces annual discount
    applies: (ctx) => ctx.billingCycle === "biennial",
  },

  // ── Seat volume ───────────────────────────────────────────────────────────
  {
    id: "seats-10-24",
    description_en: "10–24 seats: 10% discount",
    description_uk: "10–24 місця: знижка 10%",
    discount_fraction: 0.10,
    stackable: true,
    applies: (ctx) => ctx.seatCount >= 10 && ctx.seatCount <= 24,
  },
  {
    id: "seats-25-49",
    description_en: "25–49 seats: 20% discount",
    description_uk: "25–49 місць: знижка 20%",
    discount_fraction: 0.20,
    stackable: true,
    applies: (ctx) => ctx.seatCount >= 25 && ctx.seatCount <= 49,
  },
  {
    id: "seats-50plus",
    description_en: "50+ seats: contract pricing (contact Sales)",
    description_uk: "50+ місць: контрактне ціноутворення (звернутися до відділу продажів)",
    discount_fraction: 0, // Actual discount negotiated in contract
    stackable: false,
    applies: (ctx) => ctx.seatCount >= 50,
  },

  // ── Product bundles ───────────────────────────────────────────────────────
  {
    id: "api-saas-bundle",
    description_en: "API add-on is free up to Pro quota when on Team+",
    description_uk: "Доповнення API безкоштовне до квоти Pro при рівні Team і вище",
    discount_fraction: 1.0, // 100% off the API add-on
    stackable: false,
    applies: (ctx) => {
      const teamPlusTiers: TierId[] = ["team", "business", "enterprise", "gov-defense"];
      return (
        teamPlusTiers.includes(ctx.tierId) &&
        ctx.addonIds.includes("api-access")
      );
    },
  },
  {
    id: "reports-saas-bundle",
    description_en: "Monthly report subscription is free on Business+",
    description_uk: "Щомісячна підписка на звіти безкоштовна на рівні Business і вище",
    discount_fraction: 1.0, // 100% off the report sub add-on
    stackable: false,
    applies: (ctx) => {
      const businessPlusTiers: TierId[] = ["business", "enterprise", "gov-defense"];
      return (
        businessPlusTiers.includes(ctx.tierId) &&
        ctx.addonIds.includes("reports-monthly")
      );
    },
  },
];

// ── Guardrails ────────────────────────────────────────────────────────────────

/**
 * Maximum aggregate discount fraction allowed without VP approval.
 * Internal sales discount cap.
 */
export const INTERNAL_SALES_DISCOUNT_CAP = 0.25;

/**
 * Maximum discount achievable through any combination of rules.
 * Hard ceiling — prevents "edu + annual + bundle = 70% off" scenarios.
 */
export const MAX_COMBINED_DISCOUNT = 0.30;

// ── Core computation ──────────────────────────────────────────────────────────

/**
 * Compute the aggregate discount fraction to apply for a given set
 * of add-on IDs and tier.
 *
 * Returns a fraction in [0, MAX_COMBINED_DISCOUNT].
 *
 * Обчислює загальний коефіцієнт знижки для набору доповнень і рівня.
 */
export function computeBundleDiscount(
  addonIds: string[],
  tierId: TierId,
  options: {
    seatCount?: number;
    billingCycle?: "monthly" | "annual" | "biennial";
  } = {},
): number {
  const ctx: BundleContext = {
    tierId,
    addonIds,
    seatCount: options.seatCount ?? 1,
    billingCycle: options.billingCycle ?? "monthly",
    items: [],
  };

  let totalDiscount = 0;

  // Evaluate each rule. Stackable rules accumulate; non-stackable rules
  // compete and only the highest wins per "group".
  const nonStackableMatches = BUNDLE_RULES.filter(
    (r) => !r.stackable && r.applies(ctx),
  );
  const stackableMatches = BUNDLE_RULES.filter(
    (r) => r.stackable && r.applies(ctx),
  );

  // Best non-stackable
  const bestNonStackable = nonStackableMatches.reduce(
    (best, r) => Math.max(best, r.discount_fraction),
    0,
  );

  // Sum stackable
  const stackableTotal = stackableMatches.reduce(
    (sum, r) => sum + r.discount_fraction,
    0,
  );

  totalDiscount = bestNonStackable + stackableTotal;

  return Math.min(totalDiscount, MAX_COMBINED_DISCOUNT);
}

/**
 * Apply bundle rules to a cart item list, returning a new array with
 * `discounted_price_usd_mo` and `applied_rule_id` set on each item.
 *
 * Applies rules per-item based on type:
 * - 'base' items: billing-cycle and seat discounts
 * - 'addon' items: add-on volume discounts and product-bundle rules
 *
 * Застосовує правила бандлінгу до списку позицій кошика.
 */
export function applyBundleRules(
  items: CartItem[],
  context: Omit<BundleContext, "items">,
): CartItem[] {
  const fullCtx: BundleContext = { ...context, items };

  return items.map((item): CartItem => {
    // Find the best applicable rule for this item
    const matchingRules = BUNDLE_RULES.filter((r) => {
      // Seat rules only apply to seat items
      if (r.id.startsWith("seats-") && item.type !== "seat") return false;
      // Billing-cycle rules apply to base items
      if (
        (r.id === "annual-billing" || r.id === "biennial-billing") &&
        item.type !== "base"
      )
        return false;
      return r.applies(fullCtx);
    });

    if (matchingRules.length === 0) {
      return { ...item, discounted_price_usd_mo: item.price_usd_mo };
    }

    // Split into stackable and non-stackable
    const nonStackable = matchingRules.filter((r) => !r.stackable);
    const stackable = matchingRules.filter((r) => r.stackable);

    const bestNS = nonStackable.reduce(
      (best, r) => (r.discount_fraction > best.discount_fraction ? r : best),
      nonStackable[0],
    );

    const stackableDiscount = stackable.reduce(
      (sum, r) => sum + r.discount_fraction,
      0,
    );

    const bestNSDiscount = bestNS?.discount_fraction ?? 0;
    const totalFraction = Math.min(
      bestNSDiscount + stackableDiscount,
      MAX_COMBINED_DISCOUNT,
    );

    const appliedRuleId =
      bestNS?.id ?? (stackable.length > 0 ? stackable[0].id : undefined);

    return {
      ...item,
      discounted_price_usd_mo:
        item.price_usd_mo * (1 - totalFraction),
      applied_rule_id: appliedRuleId,
    };
  });
}
