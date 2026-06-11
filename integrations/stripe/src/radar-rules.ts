/**
 * Stripe Radar — typed fraud-rule configuration.
 *
 * Task: "Stripe account + radar rules" (account setup is documented in
 * COMPLIANCE.md; the machine-readable rule config lives here).
 *
 * Radar rules are authored in the Stripe Dashboard, but we keep a typed,
 * version-controlled mirror so the policy is reviewable in code and can be
 * applied via the Dashboard/API consistently across environments. Each rule has
 * a Radar predicate expression, an action, and a rationale.
 *
 * https://stripe.com/docs/radar/rules
 */

export type RadarAction = "block" | "review" | "allow" | "request_3ds";

export interface RadarRule {
  id: string;
  action: RadarAction;
  /** Stripe Radar rule-language predicate (kept verbatim for dashboard parity). */
  predicate: string;
  /** Why this rule exists — for audit. */
  rationale: string;
  enabled: boolean;
}

/**
 * Baseline ruleset. Conservative defaults appropriate for a B2B OSINT SaaS:
 * block obvious fraud signals, force 3DS on risky/high-value, queue edge cases
 * for manual review rather than hard-blocking paying customers.
 */
export const RADAR_RULES: RadarRule[] = [
  {
    id: "block_high_risk",
    action: "block",
    predicate: ":risk_level: = 'highest'",
    rationale: "Stripe's ML flags the charge as highest risk — block outright.",
    enabled: true,
  },
  {
    id: "block_cvc_fail",
    action: "block",
    predicate: ":cvc_check: = 'fail'",
    rationale: "Failed CVC strongly correlates with stolen-card testing.",
    enabled: true,
  },
  {
    id: "review_elevated_risk",
    action: "review",
    predicate: ":risk_level: = 'elevated'",
    rationale: "Elevated risk — queue for manual review instead of blocking a possible real customer.",
    enabled: true,
  },
  {
    id: "3ds_high_value",
    action: "request_3ds",
    predicate: ":amount_in_usd: > 200",
    rationale: "Force Strong Customer Authentication on high-value charges (also aids SCA compliance).",
    enabled: true,
  },
  {
    id: "3ds_new_customer_high_value",
    action: "request_3ds",
    predicate: ":card_funding: = 'prepaid' and :amount_in_usd: > 50",
    rationale: "Prepaid cards above a small threshold — common in card testing; require 3DS.",
    enabled: true,
  },
  {
    id: "block_velocity_card",
    action: "block",
    predicate: ":card_velocity_distinct_emails_hourly: > 3",
    rationale: "Same card across many emails within an hour — card-testing pattern.",
    enabled: true,
  },
  {
    id: "review_ip_country_mismatch",
    action: "review",
    predicate: ":ip_country: != :card_country:",
    rationale: "IP/card country mismatch — review (common for legitimate travelers/VPNs, so not a hard block).",
    enabled: true,
  },
  {
    id: "block_disposable_email_high_value",
    action: "block",
    predicate: ":email_domain: in @disposable_email_domains and :amount_in_usd: > 100",
    rationale: "Disposable email on a high-value charge — block.",
    enabled: true,
  },
];

/** Lists (value lists) referenced by the rules above; managed in Stripe Radar. */
export const RADAR_LISTS: Array<{ alias: string; description: string }> = [
  { alias: "disposable_email_domains", description: "Known disposable/temporary email providers." },
  { alias: "blocklist_ip", description: "IPs tied to confirmed fraud/chargebacks." },
];

export function enabledRules(): RadarRule[] {
  return RADAR_RULES.filter((r) => r.enabled);
}
