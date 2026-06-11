/**
 * Redirect loop / chain detector — CI lint.
 *
 * A redirect that points at another redirect (`A -> B -> C`) wastes crawl
 * budget and link equity; a cycle (`A -> B -> A`) is fatal. Policy for this
 * repo (see TODO/seo/TODO_url_seo.md): NO chains > 1 hop. Every redirect
 * destination must be a terminal URL (not itself a redirect source).
 *
 * This module walks the registry and reports:
 *   - cycles (loops)
 *   - chains (destination is itself a redirect source) with full hop path
 *
 * 410 rules are terminal by definition (no destination) and never chain.
 */

import type { RedirectRegistry, RedirectRule } from "./registry";

export interface ChainIssue {
  kind: "cycle" | "chain";
  /** The ordered path of `from` keys traversed, e.g. ["/a", "/b", "/c"]. */
  path: string[];
  /** Number of redirect hops (path.length - 1). */
  hops: number;
}

export interface ChainReport {
  issues: ChainIssue[];
  /** True when no chains and no cycles exist (CI pass). */
  ok: boolean;
}

const MAX_TRAVERSAL = 50; // safety bound against pathological registries

/**
 * Trace the full redirect path starting at `start`, following destinations as
 * long as each destination is ITSELF a redirect source. Returns:
 *   - null   : terminal within 1 hop (allowed)
 *   - chain  : >1 hop (destination is another redirect source)
 *   - cycle  : a `from` repeats
 */
function trace(registry: RedirectRegistry, start: RedirectRule): ChainIssue | null {
  const path: string[] = [start.from];
  const seen = new Set<string>([start.from]);
  let current: RedirectRule | undefined = start;

  for (let i = 0; i < MAX_TRAVERSAL; i++) {
    if (!current || current.to == null) break; // 410 / terminal source
    // Record the destination as the next node on the path (page or redirect).
    path.push(current.to);
    const next = registry.byFrom.get(current.to);
    if (!next) break; // destination is a real page → end of path

    if (seen.has(next.from)) {
      // Destination loops back to an already-visited source → cycle.
      return { kind: "cycle", path, hops: path.length - 1 };
    }
    seen.add(next.from);
    current = next;
  }

  // hops = edges traversed. >1 hop means the destination was itself a redirect
  // (an intermediate redirect was followed) → a chain that violates policy.
  const hops = path.length - 1;
  if (hops > 1) {
    return { kind: "chain", path, hops };
  }
  return null;
}

/**
 * Detect all chains and cycles in the registry. Returns a report; `ok` is true
 * iff there are zero issues. CI should fail the build when `ok === false`.
 */
export function detectChains(registry: RedirectRegistry): ChainReport {
  const issues: ChainIssue[] = [];
  for (const rule of registry.rules) {
    const issue = trace(registry, rule);
    if (issue) issues.push(issue);
  }
  // De-duplicate cycles reported from multiple entry points.
  const unique = new Map<string, ChainIssue>();
  for (const issue of issues) {
    const key =
      issue.kind === "cycle"
        ? // distinct nodes — same cycle reached from any entry point collapses
          [...new Set(issue.path)].sort().join("|")
        : issue.path.join(">");
    if (!unique.has(key)) unique.set(key, issue);
  }
  const deduped = [...unique.values()];
  return { issues: deduped, ok: deduped.length === 0 };
}

/** Human-readable summary for CI logs. */
export function formatChainReport(report: ChainReport): string {
  if (report.ok) return "Redirect chain check: OK (no chains > 1 hop, no cycles).";
  return [
    `Redirect chain check: FAILED (${report.issues.length} issue(s)).`,
    ...report.issues.map(
      (i) => `  [${i.kind}] ${i.path.join(" -> ")} (${i.hops} hop${i.hops === 1 ? "" : "s"})`,
    ),
  ].join("\n");
}
