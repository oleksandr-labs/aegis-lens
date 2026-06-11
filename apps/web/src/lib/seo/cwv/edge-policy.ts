/**
 * Per-route render strategy for CDN edge rendering.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("CDN edge rendering for marketing +
 * programmatic pages"). Goal: TTFB < 600ms (target ~300ms) by serving the
 * SEO-critical surface from the edge as static or edge-rendered HTML, while
 * the authenticated map workspace stays on the dynamic Node runtime (it is
 * exempt from public CWV scoring and needs full Node APIs / per-user data).
 *
 * This module is a TYPED POLICY, not wiring: it maps a request path to the
 * render strategy + runtime it SHOULD use. The Next.js route segment configs
 * (`export const runtime`, `dynamic`, `revalidate`) are the enforcement point;
 * this policy is the single source of truth they should mirror, and it backs
 * a CI lint that flags drift between policy and actual segment config.
 */

/** Where/how a route's HTML is produced. */
export type RenderStrategy =
  /** Pre-rendered at build, served as static from the CDN edge. Best TTFB. */
  | "static"
  /** Statically rendered + revalidated (ISR). Edge-cacheable. */
  | "isr"
  /** Rendered at the edge runtime per request (geo/AB, still fast). */
  | "edge"
  /** Dynamic Node runtime per request (auth, full Node APIs). Not edge-cached. */
  | "dynamic";

/** Next.js runtime target implied by the strategy. */
export type RuntimeTarget = "edge" | "nodejs";

export interface RoutePolicy {
  /** Render strategy this route should use. */
  strategy: RenderStrategy;
  /** Runtime the route should declare. */
  runtime: RuntimeTarget;
  /** ISR revalidate window in seconds (only for `isr`). */
  revalidate?: number;
  /** Whether this route counts toward public CWV scoring. */
  seoCritical: boolean;
  /** Human note for the audit. */
  note: string;
}

/**
 * Ordered match rules — FIRST match wins, so list specific prefixes before
 * general ones. Paths are matched WITHOUT the locale prefix (strip `/uk` etc.
 * before calling `policyForPath`) so a single rule covers all locales.
 */
interface PolicyRule {
  /** Path prefix (locale already stripped), or "/" for the marketing home. */
  prefix: string;
  policy: RoutePolicy;
}

export const EDGE_POLICY_RULES: readonly PolicyRule[] = [
  // Authenticated workspace — dynamic Node, exempt from public CWV.
  {
    prefix: "/app",
    policy: { strategy: "dynamic", runtime: "nodejs", seoCritical: false, note: "Map workspace (auth'd); per-user data, full Node APIs." },
  },
  {
    prefix: "/account",
    policy: { strategy: "dynamic", runtime: "nodejs", seoCritical: false, note: "Account pages (auth'd)." },
  },
  {
    prefix: "/admin",
    policy: { strategy: "dynamic", runtime: "nodejs", seoCritical: false, note: "Admin (auth'd)." },
  },
  {
    prefix: "/cases",
    policy: { strategy: "dynamic", runtime: "nodejs", seoCritical: false, note: "Investigations workspace (auth'd)." },
  },
  // API — dynamic by definition.
  {
    prefix: "/api",
    policy: { strategy: "dynamic", runtime: "nodejs", seoCritical: false, note: "API routes." },
  },
  // Programmatic SEO surfaces — high volume, ISR at the edge.
  {
    prefix: "/regions",
    policy: { strategy: "isr", runtime: "edge", revalidate: 3600, seoCritical: true, note: "Programmatic region pages; ISR hourly at edge." },
  },
  {
    prefix: "/entities",
    policy: { strategy: "isr", runtime: "edge", revalidate: 3600, seoCritical: true, note: "Programmatic entity pages; ISR hourly at edge." },
  },
  {
    prefix: "/archive",
    policy: { strategy: "isr", runtime: "edge", revalidate: 1800, seoCritical: true, note: "Time-based archive; ISR 30m at edge." },
  },
  // Marketing — fully static, served from edge.
  {
    prefix: "/",
    policy: { strategy: "static", runtime: "edge", seoCritical: true, note: "Marketing/landing; static at edge for best TTFB." },
  },
];

/** Default for unmatched routes: treat as static marketing (safe, edge-served). */
export const DEFAULT_POLICY: RoutePolicy = EDGE_POLICY_RULES[EDGE_POLICY_RULES.length - 1].policy;

/**
 * Resolve the render policy for a locale-stripped, root-relative path.
 * Strip any `/uk` (or other locale) prefix before calling.
 */
export function policyForPath(pathNoLocale: string): RoutePolicy {
  const p = pathNoLocale.startsWith("/") ? pathNoLocale : `/${pathNoLocale}`;
  for (const rule of EDGE_POLICY_RULES) {
    if (rule.prefix === "/") {
      if (p === "/" || p.startsWith("/")) {
        // "/" is the catch-all; only reached if nothing more specific matched.
        if (matchesNothingMoreSpecific(p)) return rule.policy;
      }
    } else if (p === rule.prefix || p.startsWith(`${rule.prefix}/`)) {
      return rule.policy;
    }
  }
  return DEFAULT_POLICY;
}

function matchesNothingMoreSpecific(p: string): boolean {
  return !EDGE_POLICY_RULES.some(
    (r) => r.prefix !== "/" && (p === r.prefix || p.startsWith(`${r.prefix}/`)),
  );
}

/** True if the route is part of the public, CWV-scored surface. */
export function isSeoCritical(pathNoLocale: string): boolean {
  return policyForPath(pathNoLocale).seoCritical;
}
