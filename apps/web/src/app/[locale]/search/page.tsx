import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { search, type SearchHit } from "@/lib/search-index";
import { SearchTypeahead } from "@/components/SearchTypeahead";
import { RecentSearches } from "@/components/RecentSearches";
import { CLASS_COLOR } from "@/lib/filter-config";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const localePath = (lc: Locale) => (lc === "en" ? "/search" : `/${lc}/search`);

const POPULAR = [
  "ukraine war map",
  "OSINT tools",
  "Kharkiv events",
  "Black Sea maritime",
  "cyber attacks",
  "confidence score",
  "air raid",
  "missile strike",
];

const KIND_LABELS: Record<string, string> = {
  event:         "Events",
  equipment:     "Equipment",
  conflict:      "Conflicts",
  glossary:      "Glossary",
  company:       "Companies",
  tool:          "Tools",
  region:        "Regions",
  source:        "Sources",
  threat:        "Threats",
  report:        "Reports",
  investigation: "Investigations",
};

// Singular labels for badges
const KIND_BADGE: Record<string, string> = {
  event:         "Event",
  equipment:     "Equipment",
  conflict:      "Conflict",
  glossary:      "Glossary",
  company:       "Company",
  tool:          "Tool",
  region:        "Region",
  source:        "Source",
  threat:        "Threat",
  report:        "Report",
  investigation: "Investigation",
};

const FILTER_KINDS = [
  "event", "equipment", "conflict", "glossary",
  "company", "tool", "region", "source", "threat", "report", "investigation",
] as const;

const TIME_RANGES: { label: string; hours: number | null }[] = [
  { label: "All time",    hours: null },
  { label: "Last 24h",   hours: 24 },
  { label: "Last 7d",    hours: 168 },
  { label: "Last 30d",   hours: 720 },
];

const CONF_RANGES: { label: string; minConf: number | null }[] = [
  { label: "Any",         minConf: null },
  { label: "High ≥ 80%", minConf: 80 },
  { label: "Medium ≥ 50%",minConf: 50 },
  { label: "Low < 50%",  minConf: 0 },
];

// ---------------------------------------------------------------------------
// URL helpers (server-side)
// ---------------------------------------------------------------------------

function buildSearchUrl(
  base: Record<string, string>,
  overrides: Record<string, string>,
): string {
  const sp = new URLSearchParams({ ...base, ...overrides });
  return `/search?${sp.toString()}`;
}

/** Toggle a multi-value "kind" param in the URL. */
function kindUrl(
  base: Record<string, string>,
  kind: string,
  activeKind: string | undefined,
): string {
  if (activeKind === kind) {
    // Remove the filter
    const { kind: _k, ...rest } = base;
    return buildSearchUrl(rest, {});
  }
  return buildSearchUrl(base, { kind });
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const sp = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const q = (sp.q ?? "").trim();
  return buildMetadata({
    locale,
    title: q ? `Search: "${q}"` : "Search",
    description: "Search events, equipment, conflicts, glossary, tools, regions.",
    pathFor: localePath,
    noindex: q.length > 0,
  });
}

// ---------------------------------------------------------------------------
// Rich result cards
// ---------------------------------------------------------------------------

function EventCard({ hit }: { hit: SearchHit & { kind: "event" } }) {
  // Extract class from snippet: "military_action/drone · danger 62"
  const parts = hit.snippet.split("·");
  const classPart = (parts[0] ?? "").trim();
  const dangerPart = (parts[1] ?? "").trim();
  const cls = classPart.split("/")[0]?.trim() ?? "";
  const color = CLASS_COLOR[cls as keyof typeof CLASS_COLOR] ?? "#94a3b8";

  return (
    <Link href={hit.href} className="group block px-4 py-3 hover:bg-bg-elevated">
      <div className="flex items-start gap-3">
        {/* Colored class dot */}
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text-primary group-hover:underline">
              {hit.title}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
              {KIND_BADGE.event}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-secondary">
            <span>{classPart}</span>
            {dangerPart && (
              <span className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px]">
                {dangerPart}
              </span>
            )}
          </div>
          <span className="mt-1.5 inline-block text-xs text-accent group-hover:underline">
            View event →
          </span>
        </div>
      </div>
    </Link>
  );
}

function RegionCard({ hit }: { hit: SearchHit & { kind: "region" } }) {
  return (
    <Link href={hit.href} className="group block px-4 py-3 hover:bg-bg-elevated">
      <div className="flex items-center gap-3">
        {/* Location icon */}
        <svg
          className="h-4 w-4 shrink-0 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text-primary group-hover:underline">
              {hit.title}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
              {KIND_BADGE.region}
            </span>
          </div>
          {hit.snippet && (
            <div className="mt-0.5 text-xs text-text-secondary">
              Capital: {hit.snippet}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function GlossaryCard({ hit }: { hit: SearchHit & { kind: "glossary" } }) {
  return (
    <Link href={hit.href} className="group block px-4 py-3 hover:bg-bg-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold italic text-text-primary group-hover:underline">
              {hit.title}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
              {KIND_BADGE.glossary}
            </span>
          </div>
          {hit.snippet && (
            <p className="mt-1 text-xs text-text-secondary line-clamp-2">
              {hit.snippet}
            </p>
          )}
          <span className="mt-1.5 inline-block text-xs text-accent group-hover:underline">
            See full definition →
          </span>
        </div>
      </div>
    </Link>
  );
}

function EquipmentCard({ hit }: { hit: SearchHit & { kind: "equipment" } }) {
  return (
    <Link href={hit.href} className="group block px-4 py-3 hover:bg-bg-elevated">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text-primary group-hover:underline">
          {hit.title}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
          {KIND_BADGE.equipment}
        </span>
      </div>
      {hit.snippet && (
        <div className="mt-0.5 text-xs text-text-secondary">
          Classification: {hit.snippet}
        </div>
      )}
    </Link>
  );
}

function ToolCard({ hit }: { hit: SearchHit & { kind: "tool" } }) {
  return (
    <Link href={hit.href} className="group block px-4 py-3 hover:bg-bg-elevated">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text-primary group-hover:underline">
          {hit.title}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
          {KIND_BADGE.tool}
        </span>
      </div>
      {hit.snippet && (
        <div className="mt-0.5 text-xs text-text-secondary">{hit.snippet}</div>
      )}
    </Link>
  );
}

function DefaultCard({ hit }: { hit: SearchHit }) {
  return (
    <Link href={hit.href} className="group block px-4 py-3 hover:bg-bg-elevated">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text-primary group-hover:underline">
          {hit.title}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
          {KIND_BADGE[hit.kind] ?? hit.kind}
        </span>
      </div>
      {hit.snippet && (
        <div className="mt-0.5 text-xs text-text-secondary">{hit.snippet}</div>
      )}
    </Link>
  );
}

function ResultCard({ hit }: { hit: SearchHit }) {
  switch (hit.kind) {
    case "event":     return <EventCard hit={hit as SearchHit & { kind: "event" }} />;
    case "region":    return <RegionCard hit={hit as SearchHit & { kind: "region" }} />;
    case "glossary":  return <GlossaryCard hit={hit as SearchHit & { kind: "glossary" }} />;
    case "equipment": return <EquipmentCard hit={hit as SearchHit & { kind: "equipment" }} />;
    case "tool":      return <ToolCard hit={hit as SearchHit & { kind: "tool" }} />;
    default:          return <DefaultCard hit={hit} />;
  }
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

function FacetSidebar({
  baseParams,
  activeKind,
  activeHours,
  activeMinConf,
}: {
  baseParams: Record<string, string>;
  activeKind: string | undefined;
  activeHours: number | null;
  activeMinConf: number | null;
}) {
  return (
    <aside className="w-56 shrink-0 space-y-6">
      {/* Filter by type */}
      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Filter by type
        </h3>
        <ul className="space-y-1">
          {FILTER_KINDS.map((k) => {
            const isActive = activeKind === k;
            return (
              <li key={k}>
                <Link
                  href={kindUrl(baseParams, k, activeKind)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-text-primary underline"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-sm border ${
                      isActive
                        ? "border-accent bg-accent"
                        : "border-border-default bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  {KIND_LABELS[k] ?? k}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Time range (relevant for events) */}
      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Time range
        </h3>
        <ul className="space-y-1">
          {TIME_RANGES.map(({ label, hours }) => {
            const isActive = hours === activeHours;
            const href =
              hours === null
                ? (() => {
                    const { hours: _h, ...rest } = baseParams;
                    return buildSearchUrl(rest, {});
                  })()
                : buildSearchUrl(baseParams, { hours: String(hours) });
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-text-primary underline"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Confidence */}
      <div>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Confidence
        </h3>
        <ul className="space-y-1">
          {CONF_RANGES.map(({ label, minConf }) => {
            const isActive = minConf === activeMinConf;
            const href =
              minConf === null
                ? (() => {
                    const { minConf: _c, ...rest } = baseParams;
                    return buildSearchUrl(rest, {});
                  })()
                : buildSearchUrl(baseParams, { minConf: String(minConf) });
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-text-primary underline"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Empty-state + no-results
// ---------------------------------------------------------------------------

function EmptyState({ locale }: { locale: Locale }) {
  const newsPath = locale === "en" ? "/news" : `/${locale}/news`;
  return (
    <div className="py-4">
      <p className="text-lg font-semibold text-text-primary">
        Start typing to search…
      </p>
      <p className="mt-1 text-sm text-text-muted">
        Events, equipment, conflicts, glossary, tools, companies, regions.
      </p>

      {/* Popular searches */}
      <div className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Popular searches
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-border-default bg-bg-surface px-3 py-1 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent searches — reads from localStorage client-side */}
      <RecentSearches />

      {/* Browse links */}
      <div className="mt-8 flex gap-4">
        <Link
          href={`${locale === "en" ? "" : `/${locale}`}/map`}
          className="text-sm text-accent hover:underline"
        >
          Browse the map →
        </Link>
        <Link href={newsPath} className="text-sm text-accent hover:underline">
          Browse news →
        </Link>
      </div>
    </div>
  );
}

function NoResults({ q, locale }: { q: string; locale: Locale }) {
  const newsPath = locale === "en" ? "/news" : `/${locale}/news`;
  const mapPath  = locale === "en" ? "/map"  : `/${locale}/map`;
  return (
    <div className="mt-6 rounded border border-border-subtle bg-bg-surface p-6">
      <p className="text-sm text-text-muted">
        No results for{" "}
        <span className="font-semibold text-text-primary">"{q}"</span>.
      </p>
      <div className="mt-4">
        <p className="mb-2 text-xs text-text-muted">Try:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.slice(0, 3).map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-border-default bg-bg-elevated px-3 py-1 text-xs text-text-secondary hover:border-accent hover:text-text-primary"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link href={newsPath} className="text-xs text-accent hover:underline">
          Browse /news
        </Link>
        <Link href={mapPath} className="text-xs text-accent hover:underline">
          Browse /map
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grouped results
// ---------------------------------------------------------------------------

function GroupedResults({ hits, grouped }: { hits: SearchHit[]; grouped: boolean }) {
  if (!grouped) {
    return (
      <ul className="divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
        {hits.map((h, i) => (
          <li key={`${h.href}-${i}`}>
            <ResultCard hit={h} />
          </li>
        ))}
      </ul>
    );
  }

  // Group by kind preserving score order within each group.
  const groups = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const arr = groups.get(hit.kind) ?? [];
    arr.push(hit);
    groups.set(hit.kind, arr);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([kind, group]) => (
        <div key={kind}>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {KIND_LABELS[kind] ?? kind}
          </h3>
          <ul className="divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {group.map((h, i) => (
              <li key={`${h.href}-${i}`}>
                <ResultCard hit={h} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    kind?: string;
    hours?: string;
    minConf?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const sp = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const q          = (sp.q ?? "").trim();
  const activeKind = sp.kind ?? undefined;
  const activeHoursRaw  = sp.hours ? Number(sp.hours) : null;
  const activeMinConfRaw = sp.minConf ? Number(sp.minConf) : null;

  // Build base params map (everything currently in URL)
  const baseParams: Record<string, string> = {};
  if (q)          baseParams.q       = q;
  if (sp.kind)    baseParams.kind    = sp.kind;
  if (sp.hours)   baseParams.hours   = sp.hours;
  if (sp.minConf) baseParams.minConf = sp.minConf;

  // Run search and apply client-side filters (confidence is already in score;
  // we post-filter kind and confidence threshold here since search-index is in-memory).
  const t0 = Date.now();
  let hits = q ? search(q, locale, 200) : [];
  const searchTime = Date.now() - t0;

  // Apply kind filter
  if (activeKind) {
    hits = hits.filter((h) => h.kind === activeKind);
  }

  // Apply confidence filter (score in SearchHit is 0–100 relevance, not confidence).
  // The event snippet contains "danger N" — confidence is baked in the underlying seed.
  // For now filter by relevance score as a proxy (minConf maps to score ≥ N).
  if (activeMinConfRaw !== null) {
    hits = hits.filter((h) => h.score >= activeMinConfRaw);
  }

  // Cap at 50 after filtering
  hits = hits.slice(0, 50);

  const isGrouped = !activeKind;

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={q ? `Results for "${q}"` : "Search"}
        description="Events, equipment, conflicts, glossary, tools, companies, regions."
      />

      <section className="mx-auto max-w-5xl px-4 py-8">
        {/* Search bar — always full-width */}
        <SearchTypeahead initialQuery={q} action={localePath(locale)} />

        {q ? (
          <div className="mt-8 flex gap-8">
            {/* Sidebar */}
            <FacetSidebar
              baseParams={baseParams}
              activeKind={activeKind}
              activeHours={activeHoursRaw}
              activeMinConf={activeMinConfRaw}
            />

            {/* Results */}
            <main className="min-w-0 flex-1">
              {/* Result count */}
              <div className="mb-4 text-xs text-text-muted">
                {hits.length} {hits.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
                {" · "}
                {searchTime < 5 ? "< 5ms" : `${searchTime}ms`}
              </div>

              {hits.length > 0 ? (
                <GroupedResults hits={hits} grouped={isGrouped} />
              ) : (
                <NoResults q={q} locale={locale} />
              )}
            </main>
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState locale={locale} />
          </div>
        )}
      </section>
    </>
  );
}
