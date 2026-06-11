/**
 * PII redaction BEFORE any provider call.
 *
 * Mirrors the fail-closed approach of `integrations/un-ocha/src/pii-redaction.ts`
 * (IASC / OCHA "do no harm"). Aegis Lens ingests OSINT that can contain PII about
 * civilians, sources, and detainees. Sending that to a third-party LLM endpoint
 * (Anthropic / OpenAI / HF) would export it outside our trust boundary — so we
 * scrub every outbound message at the trust boundary, before serialization.
 *
 * Difference from the un-ocha module: there, hard-block drops the whole record.
 * Here, the unit is an LLM message we still want to answer, so we TOKENIZE rather
 * than drop — but we surface findings + a `blocked` flag so callers can choose to
 * fail-closed (refuse the call) for the most sensitive categories.
 */

import type { LlmMessage } from "./types";

export type PiiCategory =
  | "email"
  | "phone"
  | "national_id"
  | "exact_coords"
  | "credit_card"
  | "ip_address";

export interface PiiFinding {
  category: PiiCategory;
  /** Truncated sample (safe for logs). */
  sample: string;
  messageIndex: number;
}

export interface RedactionReport {
  messages: LlmMessage[];
  findings: PiiFinding[];
  /** True if any high-sensitivity category fired (caller may fail-closed). */
  blocked: boolean;
}

const REDACTION_TOKEN = "[REDACTED]";

interface Detector {
  category: PiiCategory;
  re: RegExp;
  /** High-sensitivity → flips `blocked`. */
  hardBlock: boolean;
}

// Conservative (high recall) detectors — mirror un-ocha shapes + a few send-specific ones.
const DETECTORS: Detector[] = [
  { category: "email", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, hardBlock: false },
  { category: "phone", re: /(?:\+?\d[\d\s().-]{7,}\d)/g, hardBlock: false },
  // 16-digit card-like runs (allow spaces/dashes) — hard block.
  { category: "credit_card", re: /\b(?:\d[ -]?){13,16}\b/g, hardBlock: true },
  // National-id / passport-like long digit runs (10+).
  { category: "national_id", re: /\b\d{10,}\b/g, hardBlock: false },
  // High-precision individual coords (>=4 dp) — hard block (un-ocha rule).
  { category: "exact_coords", re: /-?\d{1,3}\.\d{4,}\s*[,;]\s*-?\d{1,3}\.\d{4,}/g, hardBlock: true },
  { category: "ip_address", re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, hardBlock: false },
];

function truncate(s: string): string {
  return s.length > 20 ? s.slice(0, 17) + "…" : s;
}

/** Redact a single string; returns the scrubbed text + findings + hard-block flag. */
export function redactString(input: string): {
  text: string;
  categories: PiiCategory[];
  samples: string[];
  hardBlocked: boolean;
} {
  let text = input;
  const categories: PiiCategory[] = [];
  const samples: string[] = [];
  let hardBlocked = false;

  for (const det of DETECTORS) {
    det.re.lastIndex = 0;
    const matches = input.match(det.re);
    if (!matches) continue;
    for (const m of matches) {
      categories.push(det.category);
      samples.push(truncate(m));
    }
    if (det.hardBlock) hardBlocked = true;
    text = text.replace(det.re, REDACTION_TOKEN);
  }

  return { text, categories, samples, hardBlocked };
}

/**
 * Redact an array of outbound messages. Always returns scrubbed copies; the
 * `blocked` flag tells the caller whether a hard-block category was present.
 */
export function redactMessages(messages: LlmMessage[]): RedactionReport {
  const findings: PiiFinding[] = [];
  let blocked = false;

  const out = messages.map((msg, i) => {
    const r = redactString(msg.content);
    r.categories.forEach((category, j) =>
      findings.push({ category, sample: r.samples[j], messageIndex: i }),
    );
    if (r.hardBlocked) blocked = true;
    return { ...msg, content: r.text };
  });

  return { messages: out, findings, blocked };
}

/** Thrown when {@link assertSafeToSend} encounters a hard-block category. */
export class PiiBlockedError extends Error {
  constructor(public readonly findings: PiiFinding[]) {
    super(`PII pre-send blocked: ${findings.map((f) => f.category).join(", ")}`);
    this.name = "PiiBlockedError";
  }
}

/**
 * Redact and THROW if a hard-block category is present. Use at the strictest
 * trust boundaries where exporting PII to a third-party endpoint is never OK.
 */
export function assertSafeToSend(messages: LlmMessage[]): LlmMessage[] {
  const report = redactMessages(messages);
  if (report.blocked) throw new PiiBlockedError(report.findings);
  return report.messages;
}
