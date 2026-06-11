import type { Locale } from "@aegis/i18n-config";
import { urls } from "@aegis/url-builder";
import { listEvents } from "./events-seed";
import { EQUIPMENT, CONFLICTS, GLOSSARY, localized } from "./seed-data";
import { COMPANIES, TOOLS } from "./directory-seed";
import { listRegions } from "./regions-seed";

export type SearchHit = {
  kind: "event" | "equipment" | "conflict" | "glossary" | "company" | "tool" | "region";
  title: string;
  snippet: string;
  href: string;
  score: number;
};

/** Naive case-insensitive substring scoring. Replace with proper FTS in Sprint 2. */
function score(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 60;
  const idx = h.indexOf(n);
  if (idx === -1) return 0;
  // Penalize matches deeper in string.
  return Math.max(5, 50 - idx);
}

export function search(query: string, locale: Locale, limit = 30): SearchHit[] {
  const q = query.trim();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const e of listEvents()) {
    const title = e.summary[locale] ?? e.summary.en;
    const s = Math.max(
      score(title, q),
      score(e.class, q),
      score(e.subclass ?? "", q),
      score(e.eventId, q),
    );
    if (s > 0) {
      hits.push({
        kind: "event",
        title,
        snippet: `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}`,
        href: urls.event(locale, e.eventId),
        score: s,
      });
    }
  }

  for (const eq of EQUIPMENT) {
    const title = localized(eq.name, locale);
    const s = Math.max(score(title, q), score(eq.type, q), score(eq.slug, q));
    if (s > 0)
      hits.push({
        kind: "equipment",
        title,
        snippet: eq.type,
        href: urls.equipment(locale, eq.slug),
        score: s + 5,
      });
  }

  for (const c of CONFLICTS) {
    const title = localized(c.name, locale);
    const s = Math.max(score(title, q), score(c.slug, q));
    if (s > 0)
      hits.push({
        kind: "conflict",
        title,
        snippet: c.status,
        href: urls.conflict(locale, c.slug),
        score: s + 5,
      });
  }

  for (const g of GLOSSARY) {
    const title = localized(g.term, locale);
    const def = localized(g.definition, locale);
    const s = Math.max(score(title, q), score(def, q));
    if (s > 0)
      hits.push({
        kind: "glossary",
        title,
        snippet: def.slice(0, 80) + (def.length > 80 ? "…" : ""),
        href: urls.glossary(locale, g.slug),
        score: s,
      });
  }

  for (const c of COMPANIES) {
    const s = Math.max(score(c.name, q), score(c.category, q), score(c.description, q));
    if (s > 0)
      hits.push({
        kind: "company",
        title: c.name,
        snippet: `${c.category} · ${c.region}`,
        href: urls.companyDetail(locale, c.slug),
        score: s,
      });
  }

  for (const t of TOOLS) {
    const s = Math.max(score(t.name, q), score(t.category, q), score(t.description, q));
    if (s > 0)
      hits.push({
        kind: "tool",
        title: t.name,
        snippet: t.category,
        href: urls.toolDetail(locale, t.slug),
        score: s,
      });
  }

  for (const r of listRegions()) {
    const title = r.name[locale] ?? r.name.en;
    const s = Math.max(score(title, q), score(r.iso2, q));
    if (s > 0)
      hits.push({
        kind: "region",
        title,
        snippet: r.capital,
        href: urls.region(locale, r.iso2),
        score: s + 10,
      });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
