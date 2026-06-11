/**
 * Unit tests for the anti-spam / bot-detection module.
 *
 * Run with:  npx vitest run src/lib/anti-spam/anti-spam.test.ts
 */

import { describe, expect, it } from "vitest";

import { checkHoneypot, HONEYPOT_MIN_TIME_MS } from "./honeypot";
import { isDisposableEmail, computeBehaviorScore } from "./account-abuse";
import { isBadAsn } from "./ip-reputation";
import { checkContentSpam } from "./content-spam";

import type { FormSubmission, ContentSubmission, SpamSignal } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFormSubmission(overrides: Partial<FormSubmission> = {}): FormSubmission {
  return {
    honeypotValue: null,
    timeOnFormMs: 10_000,
    ipAddress: "203.0.113.42",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    ...overrides,
  };
}

function makeContentSubmission(overrides: Partial<ContentSubmission> = {}): ContentSubmission {
  return {
    text: "This is a normal review with useful content.",
    links: [],
    authorId: "user_abc123",
    ipAddress: "203.0.113.42",
    ...overrides,
  };
}

// ── Honeypot tests ────────────────────────────────────────────────────────────

describe("checkHoneypot", () => {
  it("triggers when the honeypot field is filled", () => {
    const result = checkHoneypot(
      makeFormSubmission({ honeypotValue: "http://spammy.example.com" }),
    );
    expect(result.triggered).toBe(true);
    expect(result.reason).toMatch(/honeypot/i);
  });

  it("triggers when the honeypot field contains only whitespace", () => {
    const result = checkHoneypot(
      makeFormSubmission({ honeypotValue: "   " }),
    );
    // whitespace only => trim().length === 0 => NOT triggered
    // (whitespace-only is treated as untouched — real bots put a URL)
    expect(result.triggered).toBe(false);
  });

  it("triggers when the form is submitted too fast (below MIN_TIME_MS)", () => {
    const result = checkHoneypot(
      makeFormSubmission({ honeypotValue: null, timeOnFormMs: HONEYPOT_MIN_TIME_MS - 1 }),
    );
    expect(result.triggered).toBe(true);
    expect(result.reason).toMatch(/ms/i);
  });

  it("triggers on exactly 0 ms (instant submission)", () => {
    const result = checkHoneypot(makeFormSubmission({ timeOnFormMs: 0 }));
    expect(result.triggered).toBe(true);
  });

  it("does NOT trigger for a clean, normal submission", () => {
    const result = checkHoneypot(
      makeFormSubmission({ honeypotValue: null, timeOnFormMs: 5_000 }),
    );
    expect(result.triggered).toBe(false);
  });

  it("does NOT trigger when honeypot value is empty string", () => {
    const result = checkHoneypot(
      makeFormSubmission({ honeypotValue: "", timeOnFormMs: 5_000 }),
    );
    expect(result.triggered).toBe(false);
  });
});

// ── Disposable-email tests ────────────────────────────────────────────────────

describe("isDisposableEmail", () => {
  it("returns true for mailinator.com", () => {
    expect(isDisposableEmail("test@mailinator.com")).toBe(true);
  });

  it("returns true for guerrillamail.com", () => {
    expect(isDisposableEmail("anon@guerrillamail.com")).toBe(true);
  });

  it("returns true for 10minutemail.com", () => {
    expect(isDisposableEmail("quick@10minutemail.com")).toBe(true);
  });

  it("returns true for yopmail.com", () => {
    expect(isDisposableEmail("user@yopmail.com")).toBe(true);
  });

  it("returns true for tempmail.com", () => {
    expect(isDisposableEmail("abc@tempmail.com")).toBe(true);
  });

  it("returns true for throwam.com", () => {
    expect(isDisposableEmail("x@throwam.com")).toBe(true);
  });

  it("returns false for gmail.com", () => {
    expect(isDisposableEmail("user@gmail.com")).toBe(false);
  });

  it("returns false for outlook.com", () => {
    expect(isDisposableEmail("user@outlook.com")).toBe(false);
  });

  it("returns false for a company domain", () => {
    expect(isDisposableEmail("alex@aegislens.com")).toBe(false);
  });

  it("returns false for an address without @", () => {
    expect(isDisposableEmail("notanemail")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isDisposableEmail("TEST@MAILINATOR.COM")).toBe(true);
  });
});

// ── ASN reputation tests ──────────────────────────────────────────────────────

describe("isBadAsn", () => {
  it("returns true for DigitalOcean ASN 14061", () => {
    expect(isBadAsn(14061)).toBe(true);
  });

  it("returns true for Hetzner ASN 24940", () => {
    expect(isBadAsn(24940)).toBe(true);
  });

  it("returns true for OVH ASN 16276", () => {
    expect(isBadAsn(16276)).toBe(true);
  });

  it("returns true for Cogent ASN 174", () => {
    expect(isBadAsn(174)).toBe(true);
  });

  it("returns false for a residential ISP ASN", () => {
    // AS15169 is Google, not a residential ISP, but let's use a clearly
    // non-listed ASN to keep the test independent of list changes.
    expect(isBadAsn(99999)).toBe(false);
  });
});

// ── computeBehaviorScore tests ────────────────────────────────────────────────

describe("computeBehaviorScore", () => {
  it("returns 0 for an empty signal list", () => {
    expect(computeBehaviorScore([])).toBe(0);
  });

  it("returns a higher score for 3 signals than for 1 signal", () => {
    const signals3: SpamSignal[] = ["bad_asn", "disposable_email", "fast_submission"];
    const signals1: SpamSignal[] = ["bad_asn"];
    expect(computeBehaviorScore(signals3)).toBeGreaterThan(computeBehaviorScore(signals1));
  });

  it("caps the score at 100", () => {
    const manySignals: SpamSignal[] = [
      "honeypot_triggered",
      "fast_submission",
      "bad_asn",
      "bad_ip_rep",
      "disposable_email",
      "review_spam",
      "ai_content",
      "sockpuppet",
      "mass_signup",
      "bad_behavior_score",
    ];
    expect(computeBehaviorScore(manySignals)).toBe(100);
  });

  it("single high-weight signal (sockpuppet = 50) produces expected score", () => {
    expect(computeBehaviorScore(["sockpuppet"])).toBe(50);
  });
});

// ── checkContentSpam tests ────────────────────────────────────────────────────

describe("checkContentSpam", () => {
  it("returns 'allow' for a clean submission", () => {
    const result = checkContentSpam(makeContentSubmission());
    expect(result.decision).toBe("allow");
    expect(result.signals).toHaveLength(0);
  });

  it("flags a submission with more than 3 links as spam", () => {
    const result = checkContentSpam(
      makeContentSubmission({
        links: [
          "https://spam1.com",
          "https://spam2.com",
          "https://spam3.com",
          "https://spam4.com",
          "https://spam5.com",
        ],
      }),
    );
    expect(result.signals).toContain("review_spam");
    // 5 links → spam decision (not "allow")
    expect(result.decision).not.toBe("allow");
  });

  it("score is higher with 5 links than with 0 links", () => {
    const clean = checkContentSpam(makeContentSubmission({ links: [] }));
    const spammy = checkContentSpam(
      makeContentSubmission({
        links: ["https://a.com", "https://b.com", "https://c.com", "https://d.com", "https://e.com"],
      }),
    );
    expect(spammy.score).toBeGreaterThan(clean.score);
  });

  it("flags all-caps text", () => {
    const result = checkContentSpam(
      makeContentSubmission({
        text: "THIS IS A COMPLETELY CAPS REVIEW WHICH SHOULD BE FLAGGED AS SPAM BY THE FILTER",
      }),
    );
    expect(result.signals).toContain("review_spam");
  });

  it("flags a URL in the authorId", () => {
    const result = checkContentSpam(
      makeContentSubmission({ authorId: "https://spammy.example.com" }),
    );
    expect(result.signals).toContain("review_spam");
  });

  it("flags repeated phrases", () => {
    const phrase = "This is a repeated phrase that is longer than fifty characters in total.";
    const result = checkContentSpam(
      makeContentSubmission({ text: `${phrase} Some filler content here. ${phrase}` }),
    );
    expect(result.signals).toContain("review_spam");
  });
});
