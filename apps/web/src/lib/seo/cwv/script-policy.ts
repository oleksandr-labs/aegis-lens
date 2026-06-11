/**
 * Defer non-critical JS — script loading policy.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Defer non-critical JS"). Anything not
 * required for first paint or first interaction must not block the main thread
 * during page load — it protects INP and LCP. This module classifies the
 * site's own/first-party scripts into load phases and gives a pure helper that
 * maps a phase to the `next/script` strategy + concrete loading attributes.
 *
 * Third-party / external scripts are governed by `third-party.ts` (allow-list);
 * this file is for first-party bundles and inline glue.
 */

/** Lifecycle phase a script may load in. */
export type ScriptPhase =
  /** Needed before hydration / for first paint. Rare; ships in the document. */
  | "critical"
  /** Run after the page is interactive (hydrated). Default for app logic. */
  | "afterInteractive"
  /** Run during idle, lowest priority (analytics, non-UI telemetry). */
  | "lazyOnload"
  /** Load only when a trigger fires (in-view, click, route). */
  | "onDemand";

/** next/script `strategy` values we map to. */
export type NextScriptStrategy = "beforeInteractive" | "afterInteractive" | "lazyOnload";

export interface ScriptLoadAttrs {
  strategy: NextScriptStrategy;
  /** `defer` attribute for raw <script> tags. */
  defer: boolean;
  /** `async` attribute for raw <script> tags. */
  async: boolean;
}

/** Map a phase to concrete loading attributes. */
export function loadAttrsFor(phase: ScriptPhase): ScriptLoadAttrs {
  switch (phase) {
    case "critical":
      return { strategy: "beforeInteractive", defer: false, async: false };
    case "afterInteractive":
      return { strategy: "afterInteractive", defer: true, async: false };
    case "lazyOnload":
      return { strategy: "lazyOnload", defer: true, async: true };
    case "onDemand":
      // Loaded imperatively (dynamic import on trigger) — attrs for a fallback tag.
      return { strategy: "lazyOnload", defer: true, async: true };
  }
}

/** A classified first-party script. */
export interface ScriptEntry {
  id: string;
  /** What it does — for the audit. */
  purpose: string;
  phase: ScriptPhase;
}

/**
 * First-party script registry. The map workspace's heavy modules (MapLibre,
 * supercluster) are NOT here — they're route-split and dynamically imported by
 * the workspace, which is exempt from public CWV scoring.
 */
export const FIRST_PARTY_SCRIPTS: readonly ScriptEntry[] = [
  { id: "consent-banner", purpose: "Cookie/consent gate; gates analytics", phase: "afterInteractive" },
  { id: "rum-collector", purpose: "Web-vitals RUM beacon (see rum.ts)", phase: "lazyOnload" },
  { id: "telemetry", purpose: "Product analytics events", phase: "lazyOnload" },
  { id: "search-widget", purpose: "Client search; loads on focus/route", phase: "onDemand" },
];

export interface ScriptPolicyViolation {
  id: string;
  problem: string;
}

/**
 * Lint the registry: only a tiny allow-list may be `critical`
 * (beforeInteractive), since that re-introduces render-blocking JS.
 */
export const CRITICAL_ALLOWLIST: readonly string[] = [];

export function validateScriptPolicy(scripts: readonly ScriptEntry[] = FIRST_PARTY_SCRIPTS): ScriptPolicyViolation[] {
  const out: ScriptPolicyViolation[] = [];
  for (const s of scripts) {
    if (s.phase === "critical" && !CRITICAL_ALLOWLIST.includes(s.id)) {
      out.push({ id: s.id, problem: "critical (beforeInteractive) not on allow-list — would block render" });
    }
  }
  return out;
}
