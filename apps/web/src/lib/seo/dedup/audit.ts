/**
 * Periodic duplicate-content audit (TODO #10).
 *
 * The "Screaming Frog / Sitebulb" job, expressed as a typed, pure compute
 * contract: crawl-the-sitemap → per-page records → a dupe report. The actual
 * crawl (fetching each URL, extracting title/body) is the pluggable boundary;
 * everything downstream is deterministic and testable here.
 *
 * It composes the rest of the cluster:
 *  - near-duplicate detection per template (`uniqueness`)
 *  - thin-content gate (`thin-guard`)
 *  - canonical correctness (`canonical-rules`)
 *  - locale policy (`locale-policy` is asserted in tests, not crawled here)
 *
 * Where a real metrics source plugs in: provide `crawl()` that reads the live
 * sitemap (apps/web/src/app/sitemap-*.xml routes) and fetches each page's
 * rendered text. In CI/batch, feed `AuditPage[]` fixtures directly.
 *
 * Pure, no network in this module.
 */

import {
  findNearDuplicates,
  type NearDuplicate,
  type TemplateId,
} from "./uniqueness";
import { evaluateThinContent, type PageContent } from "./thin-guard";
import { resolveCanonicalPath, canonicalTemplateFor } from "./canonical-rules";

/** One crawled page as the audit sees it. */
export type AuditPage = {
  /** Locale-prefixed path actually served. */
  path: string;
  template: TemplateId;
  /** Self-declared canonical path (as rendered in <link rel=canonical>). */
  declaredCanonical: string;
  /** Indexable text used for similarity. */
  text: string;
  /** Structured content for the thin-content gate (optional). */
  content?: PageContent;
};

/** Crawl boundary — replace with a real sitemap crawler in production. */
export type Crawler = () => Promise<AuditPage[]> | AuditPage[];

export type DuplicateContentReport = {
  totalPages: number;
  /** Near-duplicate clusters, grouped by template. */
  nearDuplicates: Record<string, NearDuplicate[]>;
  /** Pages flagged as thin. */
  thinPages: { path: string; reasons: string[] }[];
  /** Pages whose declared canonical differs from the resolver's expectation. */
  canonicalMismatches: { path: string; declared: string; expected: string }[];
  /** Summary counts for dashboards. */
  summary: {
    nearDuplicateCount: number;
    thinCount: number;
    canonicalMismatchCount: number;
    /** 0..1 — share of pages with at least one issue. */
    issueRate: number;
  };
};

function groupByTemplate(pages: AuditPage[]): Map<TemplateId, AuditPage[]> {
  const m = new Map<TemplateId, AuditPage[]>();
  for (const p of pages) {
    (m.get(p.template) ?? m.set(p.template, []).get(p.template)!).push(p);
  }
  return m;
}

/**
 * Compute a duplicate-content report from already-crawled pages. Deterministic.
 */
export function computeAuditReport(pages: AuditPage[]): DuplicateContentReport {
  const nearDuplicates: Record<string, NearDuplicate[]> = {};
  const flaggedPaths = new Set<string>();

  for (const [template, group] of groupByTemplate(pages)) {
    const docs = group.map((p) => ({ id: p.path, text: p.text }));
    const dupes = findNearDuplicates(docs, template);
    if (dupes.length > 0) {
      nearDuplicates[template] = dupes;
      for (const d of dupes) flaggedPaths.add(d.id);
    }
  }

  const thinPages: { path: string; reasons: string[] }[] = [];
  for (const p of pages) {
    if (!p.content) continue;
    const res = evaluateThinContent(p.content);
    if (!res.ok) {
      thinPages.push({ path: p.path, reasons: res.reasons });
      flaggedPaths.add(p.path);
    }
  }

  const canonicalMismatches: {
    path: string;
    declared: string;
    expected: string;
  }[] = [];
  for (const p of pages) {
    const expected = resolveCanonicalPath({
      template: canonicalTemplateFor(p.template),
      url: p.path,
    });
    if (p.declaredCanonical !== expected) {
      canonicalMismatches.push({
        path: p.path,
        declared: p.declaredCanonical,
        expected,
      });
      flaggedPaths.add(p.path);
    }
  }

  const nearDuplicateCount = Object.values(nearDuplicates).reduce(
    (n, arr) => n + arr.length,
    0,
  );

  return {
    totalPages: pages.length,
    nearDuplicates,
    thinPages,
    canonicalMismatches,
    summary: {
      nearDuplicateCount,
      thinCount: thinPages.length,
      canonicalMismatchCount: canonicalMismatches.length,
      issueRate: pages.length === 0 ? 0 : flaggedPaths.size / pages.length,
    },
  };
}

/**
 * End-to-end audit: crawl (pluggable) → report. The default crawler boundary
 * must be supplied by the caller (a sitemap reader in prod, fixtures in CI).
 */
export async function runDuplicateContentAudit(
  crawl: Crawler,
): Promise<DuplicateContentReport> {
  const pages = await crawl();
  return computeAuditReport(pages);
}
