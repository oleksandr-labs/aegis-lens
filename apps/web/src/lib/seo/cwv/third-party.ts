/**
 * Third-party script allow-list + load strategy (no render-blocking 3rd-party).
 *
 * See TODO/seo/TODO_core_web_vitals.md ("No render-blocking 3rd-party scripts").
 * Every external origin that may execute JS on a public page must be on this
 * allow-list with an explicit, non-blocking load strategy. Anything not listed
 * is rejected by the CI lint, so a new vendor cannot silently regress CWV.
 *
 * Strategies mirror `next/script`: `afterInteractive` (load after hydration)
 * and `lazyOnload` (idle). `beforeInteractive` is intentionally NOT offered —
 * no third party is allowed to block first render.
 */

/** Allowed non-blocking load strategies for third-party scripts. */
export type ThirdPartyStrategy = "afterInteractive" | "lazyOnload";

export interface ThirdPartyEntry {
  /** Vendor id. */
  id: string;
  /** Origin(s) the script + its beacons use (for CSP/connect-src alignment). */
  origins: string[];
  /** Non-blocking load strategy. */
  strategy: ThirdPartyStrategy;
  /** Only load after the user grants consent? (privacy + perf). */
  requiresConsent: boolean;
  /** Why it's allowed. */
  purpose: string;
}

/**
 * The ONLY third parties permitted to run on public pages. Map tile/imagery
 * hosts (tile.openstreetmap.org, *.sentinel-hub.com, *.copernicus.eu) are NOT
 * scripts — they're handled by `next.config` image/remotePatterns and the
 * workspace map, which is exempt from public CWV scoring.
 */
export const THIRD_PARTY_ALLOWLIST: readonly ThirdPartyEntry[] = [
  {
    id: "plausible-analytics",
    origins: ["https://plausible.io"],
    strategy: "lazyOnload",
    requiresConsent: false,
    purpose: "Privacy-friendly, cookieless web analytics.",
  },
];

export class ThirdPartyError extends Error {}

/** True if a script origin is allow-listed. */
export function isAllowedOrigin(origin: string): boolean {
  return THIRD_PARTY_ALLOWLIST.some((e) => e.origins.includes(origin));
}

/** Resolve the load strategy for an allow-listed vendor; throws if unknown. */
export function strategyFor(id: string): ThirdPartyStrategy {
  const entry = THIRD_PARTY_ALLOWLIST.find((e) => e.id === id);
  if (!entry) throw new ThirdPartyError(`Third-party "${id}" is not on the CWV allow-list`);
  return entry.strategy;
}

export interface ThirdPartyViolation {
  id: string;
  problem: string;
}

/**
 * Lint a proposed set of third-party scripts: every entry must be on the
 * allow-list and must use a non-blocking strategy.
 */
export function validateThirdParties(proposed: readonly ThirdPartyEntry[]): ThirdPartyViolation[] {
  const out: ThirdPartyViolation[] = [];
  const allowed = new Set(THIRD_PARTY_ALLOWLIST.map((e) => e.id));
  for (const p of proposed) {
    if (!allowed.has(p.id)) {
      out.push({ id: p.id, problem: "not on allow-list" });
    }
    // @ts-expect-error guard against a "beforeInteractive" slipping in at runtime
    if (p.strategy === "beforeInteractive") {
      out.push({ id: p.id, problem: "beforeInteractive forbidden for third parties (render-blocking)" });
    }
  }
  return out;
}
