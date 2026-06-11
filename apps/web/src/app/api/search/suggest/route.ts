import { NextResponse } from "next/server";
import { GLOSSARY, EQUIPMENT, CONFLICTS } from "@/lib/seed-data";
import { listInvestigations } from "@/lib/investigations-seed";
import { listEvents } from "@/lib/events-seed";
import { listOblasts } from "@/lib/oblasts-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { listThreats } from "@/lib/threats-seed";
import { listReports } from "@/lib/reports-seed";
import { COMPANIES, TOOLS } from "@/lib/directory-seed";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * Lightweight autocomplete across the indexable Aegis Lens corpus.
 * Returns ranked suggestions grouped by kind. Rate-limited 60/min/IP.
 *
 *   GET /api/search/suggest?q=<query>&limit=8
 */
export const dynamic = "force-dynamic";

type Suggestion = {
  kind:
    | "glossary"
    | "equipment"
    | "conflict"
    | "investigation"
    | "event"
    | "region"
    | "source"
    | "threat"
    | "report"
    | "company"
    | "tool";
  slug: string;
  label: string;
  href: string;
  sub?: string;
  score: number;
};

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
}

function scoreMatch(haystack: string, qLower: string, qTokens: string[]): number {
  const h = haystack.toLowerCase();
  if (!h) return 0;
  // Exact prefix > exact contains > token overlap.
  if (h.startsWith(qLower)) return 100;
  if (h.includes(qLower)) return 60;
  let hit = 0;
  for (const t of qTokens) {
    if (t.length < 2) continue;
    if (h.includes(t)) hit++;
  }
  return hit * 15;
}

export async function GET(req: Request) {
  const ipKey = `suggest:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.min(
    Number.isFinite(Number(limitRaw)) ? Math.max(1, Number(limitRaw)) : 8,
    25,
  );

  if (q.length < 2) {
    return NextResponse.json(
      { q, suggestions: [], meta: { total: 0 } },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
          ...rateLimitHeaders(rl),
        },
      },
    );
  }

  const qLower = q.toLowerCase();
  const qTokens = tokenize(q);
  const out: Suggestion[] = [];

  // Glossary
  for (const g of GLOSSARY) {
    const s = Math.max(
      scoreMatch(g.term.en, qLower, qTokens),
      scoreMatch(g.term.uk ?? "", qLower, qTokens),
      scoreMatch(g.definition.en, qLower, qTokens) * 0.5,
    );
    if (s > 0)
      out.push({
        kind: "glossary",
        slug: g.slug,
        label: g.term.en,
        href: `/glossary/${g.slug}`,
        sub: g.definition.en.slice(0, 90),
        score: s,
      });
  }
  // Equipment
  for (const e of EQUIPMENT) {
    const s = Math.max(
      scoreMatch(e.name.en, qLower, qTokens),
      scoreMatch(e.name.uk ?? "", qLower, qTokens),
      scoreMatch(e.type, qLower, qTokens) * 0.7,
    );
    if (s > 0)
      out.push({
        kind: "equipment",
        slug: e.slug,
        label: e.name.en,
        href: `/equipment/${e.slug}`,
        sub: e.type,
        score: s,
      });
  }
  // Conflicts
  for (const c of CONFLICTS) {
    const s = scoreMatch(c.name.en, qLower, qTokens);
    if (s > 0)
      out.push({
        kind: "conflict",
        slug: c.slug,
        label: c.name.en,
        href: `/conflicts/${c.slug}`,
        sub: c.status,
        score: s,
      });
  }
  // Investigations
  for (const inv of listInvestigations()) {
    const s = Math.max(
      scoreMatch(inv.title, qLower, qTokens),
      scoreMatch(inv.summary, qLower, qTokens) * 0.5,
    );
    if (s > 0)
      out.push({
        kind: "investigation",
        slug: inv.slug,
        label: inv.title,
        href: `/investigations/${inv.slug}`,
        sub: `${inv.date} · ${inv.analyst}`,
        score: s,
      });
  }
  // Reports
  for (const r of listReports()) {
    const s = scoreMatch(r.title.en, qLower, qTokens);
    if (s > 0)
      out.push({
        kind: "report",
        slug: r.slug,
        label: r.title.en,
        href: `/reports/${r.slug}`,
        sub: r.kind,
        score: s,
      });
  }
  // Threats
  for (const th of listThreats()) {
    const s = Math.max(
      scoreMatch(th.name.en, qLower, qTokens),
      scoreMatch(th.summary.en, qLower, qTokens) * 0.5,
    );
    if (s > 0)
      out.push({
        kind: "threat",
        slug: th.slug,
        label: th.name.en,
        href: `/threats/${th.slug}`,
        sub: th.category,
        score: s,
      });
  }
  // Regions (admin-1 oblasts)
  for (const country of ["ua", "pl", "de"]) {
    for (const o of listOblasts(country)) {
      const s = Math.max(
        scoreMatch(o.name.en, qLower, qTokens),
        scoreMatch(o.name.uk ?? "", qLower, qTokens),
        scoreMatch(o.capital, qLower, qTokens) * 0.6,
      );
      if (s > 0)
        out.push({
          kind: "region",
          slug: `${country}/${o.slug}`,
          label: o.name.en,
          href: `/regions/${country}/${o.slug}`,
          sub: `${country.toUpperCase()} · ${o.kindLabel}`,
          score: s,
        });
    }
  }
  // Sources
  for (const s of PUBLIC_SOURCES) {
    const score = Math.max(
      scoreMatch(s.name, qLower, qTokens),
      scoreMatch(s.description, qLower, qTokens) * 0.4,
    );
    if (score > 0)
      out.push({
        kind: "source",
        slug: s.slug,
        label: s.name,
        href: `/sources/${s.slug}`,
        sub: `${s.kind} · ${s.country}`,
        score,
      });
  }
  // Companies
  for (const c of COMPANIES) {
    const score = Math.max(
      scoreMatch(c.name, qLower, qTokens),
      scoreMatch(c.description, qLower, qTokens) * 0.3,
      scoreMatch(c.category, qLower, qTokens) * 0.5,
    );
    if (score > 0)
      out.push({
        kind: "company",
        slug: c.slug,
        label: c.name,
        href: `/companies/${c.slug}`,
        sub: `${c.category} · ${c.region}`,
        score,
      });
  }
  // Tools
  for (const t of TOOLS) {
    const score = Math.max(
      scoreMatch(t.name, qLower, qTokens),
      scoreMatch(t.description, qLower, qTokens) * 0.3,
      scoreMatch(t.category, qLower, qTokens) * 0.5,
    );
    if (score > 0)
      out.push({
        kind: "tool",
        slug: t.slug,
        label: t.name,
        href: `/tools/${t.slug}`,
        sub: `${t.category} · ${t.region}`,
        score,
      });
  }
  // Events — match on summary text
  for (const ev of listEvents()) {
    const score = Math.max(
      scoreMatch(ev.summary.en, qLower, qTokens),
      scoreMatch(ev.summary.uk ?? "", qLower, qTokens),
    );
    if (score > 0)
      out.push({
        kind: "event",
        slug: ev.eventId,
        label: ev.summary.en,
        href: `/events/${ev.eventId}`,
        sub: `${ev.class} · ${ev.occurredAt.slice(0, 10)}`,
        score: score * 0.8, // events de-prioritized vs structural surfaces
      });
  }

  out.sort((a, b) => b.score - a.score);
  const ranked = out.slice(0, limit);

  return NextResponse.json(
    { q, suggestions: ranked, meta: { total: out.length, returned: ranked.length } },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
