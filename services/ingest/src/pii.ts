/**
 * PII redaction applied at ingest boundary before any text is stored or forwarded.
 *
 * Rules applied in order:
 *  1. Phone numbers (international + UA format)
 *  2. Email addresses
 *  3. Ukrainian national ID / passport patterns
 *  4. GPS coordinates embedded in text (only when not part of a legitimate field)
 *
 * Each match is replaced with a typed placeholder, e.g. [PHONE], [EMAIL].
 * Original text is never stored anywhere after this function runs.
 */

export interface RedactionResult {
  redacted: string;
  /** Number of replacements made per category */
  counts: Record<string, number>;
}

const RULES: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  {
    name: "phone",
    pattern: /(?:\+380|0)[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g,
    replacement: "[PHONE]",
  },
  {
    name: "email",
    pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL]",
  },
  {
    name: "ua_passport",
    // UA passport: 2 letters + 6 digits (old) or 9 digits (new ID card)
    pattern: /\b(?:[А-ЯІЇЄА-Z]{2}\s?\d{6}|\d{9})\b/g,
    replacement: "[ID]",
  },
  {
    name: "gps_coords",
    // Bare decimal coords like 48.1234, 37.5678 when not preceded by geo-field context
    pattern: /(?<![=:"/])\b\d{1,2}\.\d{4,},\s*\d{2}\.\d{4,}\b/g,
    replacement: "[COORDS]",
  },
];

export function redactPII(text: string): RedactionResult {
  let redacted = text;
  const counts: Record<string, number> = {};

  for (const rule of RULES) {
    const matches = redacted.match(rule.pattern);
    counts[rule.name] = matches?.length ?? 0;
    redacted = redacted.replace(rule.pattern, rule.replacement);
  }

  return { redacted, counts };
}
