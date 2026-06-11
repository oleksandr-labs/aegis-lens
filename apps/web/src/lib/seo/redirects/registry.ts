/**
 * Central redirect registry — single source of truth for path-level redirects.
 *
 * See TODO/seo/TODO_redirects.md. Redirects are authored as CSV in the repo
 * (`apps/web/src/data/redirects.csv`) and loaded into this typed model. The
 * model is consumed by:
 *   - the edge middleware (apply at request time — see handoff snippet)
 *   - the chain detector (CI lint)
 *   - the quarterly audit
 *   - bulk import/export tooling
 *
 * Locale prefixes are preserved end-to-end: `from`/`to` are stored exactly as
 * authored, including any `/uk/...` prefix. EN default has no prefix.
 */

/** HTTP status of a redirect rule. 410 = Gone (no `to`). */
export type RedirectStatus = 301 | 302 | 410;

/**
 * One redirect rule. `from`/`to` are root-relative paths (leading slash, no
 * host, no query unless intentionally matched). For 410 entries `to` is null.
 */
export interface RedirectRule {
  /** Source path, root-relative, locale prefix included if any. */
  from: string;
  /** Destination path, root-relative. Null for 410 (Gone). */
  to: string | null;
  /** Redirect type. 301 permanent (default), 302 temporary, 410 gone. */
  status: RedirectStatus;
  /** ISO-8601 date the rule was created. Used by the quarterly audit. */
  createdAt: string;
  /** Human reason — why this redirect exists (rename, merge, retire, …). */
  reason: string;
}

/**
 * Validated registry — built from CSV rows. Construct via `buildRegistry` so
 * duplicates and malformed rows are rejected at load time.
 */
export interface RedirectRegistry {
  rules: RedirectRule[];
  /** Fast lookup keyed by `from`. */
  byFrom: Map<string, RedirectRule>;
}

export class RedirectRegistryError extends Error {}

function normalizePath(p: string): string {
  if (!p) return p;
  let s = p.trim();
  if (!s.startsWith("/")) s = `/${s}`;
  // Strip a single trailing slash (except bare root) so keys are canonical.
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function isValidStatus(n: number): n is RedirectStatus {
  return n === 301 || n === 302 || n === 410;
}

/**
 * Build + validate a registry from raw rules. Throws on:
 *  - duplicate `from`
 *  - 301/302 missing `to`
 *  - 410 with a `to`
 *  - `from === to`
 */
export function buildRegistry(rows: RedirectRule[]): RedirectRegistry {
  const byFrom = new Map<string, RedirectRule>();
  const rules: RedirectRule[] = [];

  for (const raw of rows) {
    const from = normalizePath(raw.from);
    const to = raw.to == null ? null : normalizePath(raw.to);
    const status = raw.status;

    if (!isValidStatus(status)) {
      throw new RedirectRegistryError(`Invalid status ${status} for ${from}`);
    }
    if (status === 410 && to != null) {
      throw new RedirectRegistryError(`410 rule must not have a destination: ${from}`);
    }
    if (status !== 410 && !to) {
      throw new RedirectRegistryError(`${status} rule needs a destination: ${from}`);
    }
    if (to != null && from === to) {
      throw new RedirectRegistryError(`Self-redirect not allowed: ${from}`);
    }
    if (byFrom.has(from)) {
      throw new RedirectRegistryError(`Duplicate redirect source: ${from}`);
    }

    const rule: RedirectRule = { from, to, status, createdAt: raw.createdAt, reason: raw.reason };
    byFrom.set(from, rule);
    rules.push(rule);
  }

  return { rules, byFrom };
}

/** Look up a single rule by exact source path (after normalization). */
export function lookup(registry: RedirectRegistry, path: string): RedirectRule | undefined {
  return registry.byFrom.get(normalizePath(path));
}
