/**
 * PCI scope minimization — Stripe Elements only, no raw PAN.
 *
 * Task: "PCI scope minimization (Stripe Elements only)".
 *
 * Card data is NEVER entered into, transmitted through, or stored by our
 * servers. The browser collects card details exclusively in Stripe Elements
 * iframes; our backend only ever sees opaque tokens / PaymentMethod ids. This
 * keeps us in PCI DSS SAQ A scope (the lightest). This module encodes that
 * policy as runtime guards + the documented SAQ posture.
 *
 * https://stripe.com/docs/security/guide
 * See COMPLIANCE.md "PCI DSS" section for the attestation posture.
 */

/** Our PCI DSS self-assessment level given the Elements-only architecture. */
export const PCI_SAQ_LEVEL = "SAQ A" as const;

/**
 * The ONLY card-derived identifiers our backend is permitted to handle. These
 * are opaque references issued by Stripe — not card data.
 */
export type AllowedCardReference =
  | "payment_method_id" // pm_…
  | "token_id"          // tok_… (Elements)
  | "setup_intent_id"   // seti_…
  | "payment_intent_id"; // pi_…

const PAN_REGEX = /\b(?:\d[ -]?){13,19}\b/;
const CVC_REGEX = /\b(?:cvc|cvv|cvv2|cid)\b/i;

/**
 * Guard: reject any payload that appears to contain a raw PAN or CVC. Call this
 * on inbound billing request bodies as defense-in-depth — a real PAN should
 * never reach our backend; if one does, fail closed and alert.
 */
export function assertNoRawCardData(payload: unknown): void {
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload ?? "");
  if (PAN_REGEX.test(serialized) && looksLikeCardNumber(serialized)) {
    throw new Error("[pci] raw card number detected in payload — rejected (Elements-only policy)");
  }
  if (CVC_REGEX.test(serialized)) {
    throw new Error("[pci] CVC/CVV field detected in payload — rejected (Elements-only policy)");
  }
}

/** Luhn check to reduce false positives on the PAN regex (order ids etc.). */
function looksLikeCardNumber(s: string): boolean {
  const m = s.match(PAN_REGEX);
  if (!m) return false;
  const digits = m[0].replace(/[ -]/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** True if a given reference id is an allowed opaque token (not card data). */
export function isAllowedCardReference(value: string): boolean {
  return /^(pm|tok|seti|pi)_/.test(value);
}

/** Documented client-side requirements for the Elements integration. */
export const PCI_POLICY = {
  saqLevel: PCI_SAQ_LEVEL,
  clientCollectsCardVia: "stripe-js Elements (iframe)",
  serverSeesOnly: ["payment_method_id", "token_id", "setup_intent_id", "payment_intent_id"] as AllowedCardReference[],
  storesPan: false,
  storesCvc: false,
  transmitsPanToServer: false,
  notes:
    "Card data lives only in Stripe-hosted iframes. Backend confirms PaymentIntents/SetupIntents by id. No PAN/CVC is logged, stored, or transmitted server-side. SAQ A eligible.",
} as const;
