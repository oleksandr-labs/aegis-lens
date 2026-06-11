/**
 * API Version Guard — dev-time breaking-change safety net.
 *
 * This module is NOT a runtime gatekeeper (use API schema diff tools for that).
 * It is a lightweight compile-time / CI-time annotation system for tracking
 * breaking changes and enforcing the major-version-only rule.
 *
 * Usage in a PR review script or test file:
 *
 *   assertNonBreaking("Add optional field `severity` to EventsResponse", "v1");
 *   // assertNonBreaking("Remove `class` field", "v1"); // throws — use v2 instead
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Describes the nature of a breaking change */
export type BreakingChangeReason =
  | "field_removed"
  | "field_renamed"
  | "type_narrowed"
  | "endpoint_removed"
  | "endpoint_renamed"
  | "auth_scheme_changed"
  | "pagination_incompatible"
  | "error_format_changed"
  | "response_envelope_changed"
  | "required_field_added";

/** A typed record of a breaking change for documentation purposes */
export type BreakingChange = {
  reason: BreakingChangeReason;
  description: string;
  targetMajorVersion: string;
  mitigationGuideUrl: string;
};

// ── Policy document ───────────────────────────────────────────────────────────

/**
 * Authoritative breaking-change policy for the Aegis Lens API.
 * See also: docs/api/breaking-change-policy.md
 */
export const BREAKING_CHANGE_POLICY = {
  rule: "Breaking changes are only permitted in new major versions (e.g. v1 → v2).",
  deprecationFloorDays: 365,
  notificationCadenceDays: [60, 30, 7],
  breakingChangeKeywords: [
    "remove",
    "rename",
    "incompatible",
    "breaking",
    "delete field",
    "drop field",
    "change type",
    "require",
  ],
  minorChangeExamples: [
    "Add an optional response field",
    "Add a new optional query parameter",
    "Add a new endpoint",
    "Relax validation (accept more inputs)",
    "Add a new webhook event type",
  ],
  majorChangeExamples: [
    "Remove a field from any response",
    "Rename a field in any response",
    "Change a field from optional to required in any request",
    "Change pagination format",
    "Change authentication scheme",
  ],
} as const;

// ── Guard function ─────────────────────────────────────────────────────────────

/**
 * Assert that a proposed change is non-breaking for the current API version.
 *
 * Throws a descriptive error if the change description contains breaking-change
 * keywords, reminding the author to introduce a new major version instead.
 *
 * This is a **dev-time guard** — intended for use in migration checklists,
 * test files, or CI lint scripts, not in the live request path.
 *
 * @param changeDescription  — plain-text description of the intended change
 * @param currentVersion     — the API version being modified (e.g. 'v1')
 *
 * @throws {Error} if a breaking-change keyword is detected
 */
export function assertNonBreaking(
  changeDescription: string,
  currentVersion: "v1",
): void {
  const normalised = changeDescription.toLowerCase();
  const matched = BREAKING_CHANGE_POLICY.breakingChangeKeywords.filter((kw) =>
    normalised.includes(kw),
  );

  if (matched.length > 0) {
    const nextVersion = bumpMajor(currentVersion);
    throw new Error(
      [
        `[api-version-guard] Detected breaking-change keyword(s): ${matched.join(", ")}.`,
        `Breaking changes must be introduced in a new major version.`,
        `Current: ${currentVersion}  →  Required: ${nextVersion}`,
        ``,
        `Change description: "${changeDescription}"`,
        ``,
        `See BREAKING_CHANGE_POLICY and docs/api/breaking-change-policy.md for guidance.`,
      ].join("\n"),
    );
  }
}

/** Derive the next major version string e.g. "v1" → "v2" */
function bumpMajor(version: string): string {
  const match = version.match(/^v(\d+)$/i);
  if (!match) return `${version}-next`;
  return `v${Number(match[1]) + 1}`;
}
