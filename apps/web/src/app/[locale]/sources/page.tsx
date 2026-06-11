import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  SOURCES,
  TOTAL_EVENTS,
  AVG_FRESHNESS_MINUTES,
  freshnessLabel,
  TYPE_ICON,
  TIER_LABEL,
  TIER_COLOR,
  STATUS_DOT,
  type SourceType,
  type SourceTier,
} from "@/lib/sources-data";
import { ALL_CLASSES } from "@/lib/filter-config";

const lp = (lc: Locale) => (lc === "en" ? "/sources" : `/${lc}/sources`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Intelligence Source Directory",
    description:
      "Every OSINT source Aegis Lens ingests — reliability tiers, freshness metrics, and topic coverage for Ukraine conflict intelligence.",
    pathFor: lp,
  });
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  official: "Official",
  research: "Research",
  ngo: "NGO",
  satellite: "Satellite",
  api: "API",
  social: "Social",
  telegram: "Telegram",
  ais: "AIS",
  rss: "RSS",
};

const TIER_FILTER_LABELS: Record<string, string> = {
  all: "All tiers",
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "Tier 3",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SourcesIndex({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    type?: string;
    tier?: string;
    topic?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;

  const filterType = sp.type ?? "all";
  const filterTier = sp.tier ?? "all";
  const filterTopic = sp.topic ?? "all";

  const filtered = SOURCES.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterTier !== "all" && s.tier !== filterTier) return false;
    if (filterTopic !== "all" && !s.topics.includes(filterTopic)) return false;
    return true;
  });

  const baseHref = locale === "en" ? "/sources" : `/${locale}/sources`;

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (filterType !== "all") p.set("type", filterType);
    if (filterTier !== "all") p.set("tier", filterTier);
    if (filterTopic !== "all") p.set("topic", filterTopic);
    for (const [k, v] of Object.entries(overrides)) {
      if (v && v !== "all") p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  }

  const hrefFor = (slug: string) =>
    locale === "en" ? `/sources/${slug}` : `/${locale}/sources/${slug}`;

  return (
    <>
      <PageHeader
        eyebrow="Sources"
        title="Intelligence Source Directory"
        description="Every source we ingest from, with reliability tiers, freshness metrics, and coverage areas."
      />

      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* ── Summary stats bar ──────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Active sources
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">
              {SOURCES.length}
            </div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Events ingested
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">
              {TOTAL_EVENTS.toLocaleString()}
            </div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Avg freshness
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">
              {freshnessLabel(AVG_FRESHNESS_MINUTES)}
            </div>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Type:
          </span>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <a
              key={key}
              href={buildHref({ type: key })}
              className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filterType === key
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Tier:
          </span>
          {Object.entries(TIER_FILTER_LABELS).map(([key, label]) => (
            <a
              key={key}
              href={buildHref({ tier: key })}
              className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filterTier === key
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Topic:
          </span>
          <a
            href={buildHref({ topic: "all" })}
            className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              filterTopic === "all"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All
          </a>
          {ALL_CLASSES.map((cls) => (
            <a
              key={cls.id}
              href={buildHref({ topic: filterTopic === cls.id ? "all" : cls.id })}
              className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filterTopic === cls.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
              }`}
            >
              {cls.label}
            </a>
          ))}
        </div>

        {/* ── Result count ───────────────────────────────────────────────── */}
        <div className="mb-4 font-mono text-[11px] text-text-muted">
          {filtered.length} / {SOURCES.length} sources
        </div>

        {/* ── Source cards grid ──────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">
            No sources match the selected filters.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {filtered.map((s) => {
              const icon = TYPE_ICON[s.type] ?? "📌";
              const tierCls = TIER_COLOR[s.tier];
              const dotCls = STATUS_DOT[s.activeStatus];

              return (
                <li
                  key={s.slug}
                  className="flex flex-col rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-border-default"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider ${tierCls}`}
                      >
                        {TIER_LABEL[s.tier]}
                      </span>
                      <span aria-hidden className="text-base">
                        {icon}
                      </span>
                    </div>
                    {s.verified && (
                      <span
                        title="Verified source"
                        className="font-mono text-[10px] text-green-400"
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Name + status */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${dotCls}`}
                    />
                    <h3 className="text-sm font-semibold text-text-primary">
                      {s.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                    {s.description}
                  </p>

                  {/* Topics */}
                  {s.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.topics.map((t) => {
                        const cls = ALL_CLASSES.find((c) => c.id === t);
                        return (
                          <span
                            key={t}
                            className="rounded bg-border-subtle/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted"
                          >
                            {cls?.label ?? t}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                    <div className="flex items-center gap-3 font-mono text-[10px] text-text-muted">
                      <span className="uppercase">{s.country}</span>
                      <span>·</span>
                      <span>
                        Updates every {freshnessLabel(s.freshnessMinutes)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {s.eventCount.toLocaleString()} events
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-3">
                    <a
                      href={hrefFor(s.slug)}
                      className="font-mono text-[11px] text-accent hover:underline"
                    >
                      View details →
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Suggest a source ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-4" id="suggest">
        <h2 className="text-xl font-semibold text-text-primary">
          Suggest a source
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Know a public source we should monitor? Submit it below. All suggestions
          are reviewed by the intelligence team before being added. We do not add
          dark-web, subscription-only, or unverifiable sources.
        </p>
        <form
          action="/api/sources/suggest"
          method="POST"
          className="mt-6 space-y-5 rounded border border-border-subtle bg-bg-surface p-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="src-name"
                className="block text-sm font-medium text-text-primary"
              >
                Source name
              </label>
              <input
                id="src-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Ukraine Weapons Tracker"
                className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="src-url"
                className="block text-sm font-medium text-text-primary"
              >
                Homepage / feed URL
              </label>
              <input
                id="src-url"
                name="url"
                type="url"
                required
                placeholder="https://…"
                className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="src-type"
                className="block text-sm font-medium text-text-primary"
              >
                Type
              </label>
              <select
                id="src-type"
                name="type"
                defaultValue=""
                className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="official">Official government</option>
                <option value="research">Research / academic</option>
                <option value="ngo">NGO / humanitarian</option>
                <option value="satellite">Satellite / remote sensing</option>
                <option value="api">API / data feed</option>
                <option value="telegram">Telegram channel</option>
                <option value="social">Social media</option>
                <option value="rss">RSS / news feed</option>
                <option value="ais">AIS / maritime</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="src-country"
                className="block text-sm font-medium text-text-primary"
              >
                Country of origin (ISO 2)
              </label>
              <input
                id="src-country"
                name="country"
                type="text"
                maxLength={2}
                placeholder="e.g. UA"
                className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 font-mono uppercase text-text-primary outline-none focus:border-accent"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="src-reason"
              className="block text-sm font-medium text-text-primary"
            >
              Why should we add this source?
            </label>
            <textarea
              id="src-reason"
              name="reason"
              rows={3}
              required
              placeholder="Track record, coverage area, why it's reliable…"
              className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor="src-email"
              className="block text-sm font-medium text-text-primary"
            >
              Your email (optional — for follow-up)
            </label>
            <input
              id="src-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-accent px-4 py-2 text-bg-base hover:bg-accent/90"
          >
            Submit suggestion
          </button>
        </form>
      </section>
    </>
  );
}
