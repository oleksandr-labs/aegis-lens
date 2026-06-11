import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  SOURCES,
  getSource,
  sourcesByTopic,
  freshnessLabel,
  TYPE_ICON,
  TIER_LABEL,
  TIER_COLOR,
  TIER_EXPLANATION,
  STATUS_DOT,
} from "@/lib/sources-data";
import { ALL_CLASSES } from "@/lib/filter-config";

type Params = { locale: string; slug: string };

const pathFor = (lc: Locale, slug: string) =>
  lc === "en" ? `/sources/${slug}` : `/${lc}/sources/${slug}`;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const s of SOURCES) {
    for (const lc of ACTIVE_LOCALES) {
      if (lc === "en") continue;
      out.push({ locale: lc, slug: s.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const s = getSource(slug);
  if (!s) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: s.name,
    description: s.description,
    pathFor: (lc) => pathFor(lc, slug),
    noindex: false,
  });
}

// ─── Seed recent events for demo purposes ─────────────────────────────────────

type SeedEvent = {
  id: string;
  summary: string;
  class: string;
  hoursAgo: number;
};

const SEED_EVENTS: Record<string, SeedEvent[]> = {
  "ukraine-genstaff": [
    {
      id: "gs-001",
      summary: "[synthetic] 130 combat engagements reported across Donetsk direction.",
      class: "military_action",
      hoursAgo: 4,
    },
    {
      id: "gs-002",
      summary: "[synthetic] Artillery fire reported near Zaporizhzhia axis. Enemy assault repelled.",
      class: "military_action",
      hoursAgo: 12,
    },
    {
      id: "gs-003",
      summary: "[synthetic] General Staff briefing: situation in Kherson direction stable.",
      class: "military_action",
      hoursAgo: 24,
    },
  ],
  "isw-daily": [
    {
      id: "isw-001",
      summary: "[synthetic] ISW assessment: Russian forces conducted limited ground attacks north of Avdiivka.",
      class: "military_action",
      hoursAgo: 8,
    },
    {
      id: "isw-002",
      summary: "[synthetic] ISW notes increased Russian information operations around territorial claims.",
      class: "political",
      hoursAgo: 32,
    },
  ],
  "alerts-in-ua": [
    {
      id: "alert-001",
      summary: "[synthetic] Air raid alert activated in Kyiv, Kharkiv, and Sumy oblasts.",
      class: "civilian_alert",
      hoursAgo: 1,
    },
    {
      id: "alert-002",
      summary: "[synthetic] All-clear issued across 8 oblasts after 34-minute alert.",
      class: "civilian_alert",
      hoursAgo: 3,
    },
  ],
  "nasa-firms": [
    {
      id: "firms-001",
      summary: "[synthetic] VIIRS active fire detection cluster near Kherson region — consistent with shelling.",
      class: "environmental",
      hoursAgo: 6,
    },
  ],
  "cert-ua": [
    {
      id: "cert-001",
      summary: "[synthetic] CERT-UA warns of UAC-0185 phishing campaign targeting Ukrainian defense entities.",
      class: "cyber",
      hoursAgo: 16,
    },
  ],
};

function getRecentEvents(slug: string): SeedEvent[] {
  return SEED_EVENTS[slug] ?? [];
}

// ─── Visual freshness bar ─────────────────────────────────────────────────────

function freshnessBarWidth(minutes: number): number {
  // 1 min = full bar, 1440 min (1d) = 10%, anything > 7d approaches 2%
  const pct = Math.max(2, Math.round(100 / Math.log10(minutes + 2)));
  return Math.min(100, pct);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const s = getSource(slug);
  if (!s) notFound();

  const pageUrl = `${SITE.url}${pathFor(locale, slug)}`;
  const icon = TYPE_ICON[s.type] ?? "📌";
  const tierCls = TIER_COLOR[s.tier];
  const dotCls = STATUS_DOT[s.activeStatus];
  const recentEvents = getRecentEvents(slug);
  const freshnessBar = freshnessBarWidth(s.freshnessMinutes);

  // Related sources sharing at least one topic (exclude self)
  const relatedSources = SOURCES.filter(
    (other) =>
      other.slug !== slug &&
      other.topics.some((t) => s.topics.includes(t)),
  ).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: s.name,
    description: s.description,
    url: pageUrl,
    sameAs: [s.url],
    inLanguage: s.language,
    creator: {
      "@type": "Organization",
      name: s.name,
      url: s.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    keywords: s.topics.join(", "),
    temporalCoverage: "2022/..",
    spatialCoverage: {
      "@type": "Place",
      name: s.country.toUpperCase(),
    },
    measurementTechnique: s.type,
    variableMeasured: s.topics.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow={`Source · ${s.type.toUpperCase()}`}
        title={s.name}
        description={s.description}
      />

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        {/* ── Tier + status badges ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded border px-2 py-1 font-mono text-[11px] font-bold tracking-wider ${tierCls}`}
          >
            {TIER_LABEL[s.tier]} — {s.tier === "tier1" ? "Tier 1" : s.tier === "tier2" ? "Tier 2" : "Tier 3"}
          </span>
          <span aria-hidden className="text-xl">
            {icon}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
            <span
              aria-hidden
              className={`inline-block h-2 w-2 rounded-full ${dotCls}`}
            />
            {s.activeStatus === "active"
              ? "Active"
              : s.activeStatus === "unreliable"
              ? "Unreliable"
              : "Inactive"}
          </span>
          {s.verified && (
            <span className="font-mono text-[11px] text-green-400">
              ✓ Verified
            </span>
          )}
        </div>

        {/* ── Reliability section ────────────────────────────────────────── */}
        <div className="rounded border border-border-subtle bg-bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Reliability
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            {TIER_EXPLANATION[s.tier]}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact label="Trust tier" value={`Tier ${s.tier.replace("tier", "")}`} />
            <Fact
              label="Verified"
              value={s.verified ? "Yes — editorial review" : "Pending"}
            />
            <Fact
              label="Status"
              value={
                s.activeStatus === "active"
                  ? "Active ingestion"
                  : s.activeStatus === "unreliable"
                  ? "Unreliable — flagged"
                  : "Inactive"
              }
            />
          </dl>
        </div>

        {/* ── Coverage section ───────────────────────────────────────────── */}
        <div className="rounded border border-border-subtle bg-bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">
            Coverage
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Country" value={s.country.toUpperCase()} mono />
            <Fact label="Language" value={s.language.toUpperCase()} mono />
            <Fact label="Type" value={s.type} mono />
            <Fact label="Events" value={s.eventCount.toLocaleString()} mono />
          </dl>

          {/* Topic coverage bars */}
          <div className="mt-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
              Topics covered
            </div>
            <ul className="space-y-2">
              {ALL_CLASSES.filter((c) => s.topics.includes(c.id)).map((cls) => {
                const siblingCount = sourcesByTopic(cls.id).length;
                const barPct = Math.round((1 / siblingCount) * 100);
                return (
                  <li key={cls.id} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 font-mono text-[10px] text-text-muted">
                      {cls.label}
                    </span>
                    <div className="flex-1 overflow-hidden rounded bg-border-subtle h-1.5">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted w-16 text-right">
                      1 of {siblingCount} src
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Freshness metric ───────────────────────────────────────────── */}
        <div className="rounded border border-border-subtle bg-bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
            Update frequency
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-text-primary">
              {freshnessLabel(s.freshnessMinutes)}
            </span>
            <span className="text-sm text-text-muted">avg cadence</span>
          </div>
          <div className="mt-3">
            <div
              className="h-2 overflow-hidden rounded bg-border-subtle"
              role="progressbar"
              aria-valuenow={freshnessBar}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Freshness indicator: ${freshnessLabel(s.freshnessMinutes)}`}
            >
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${freshnessBar}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-text-muted">
              Higher bar = more frequent updates. Alerts.in.ua updates every ~1 min (reference).
            </p>
          </div>
        </div>

        {/* ── Recent events from this source ────────────────────────────── */}
        {recentEvents.length > 0 && (
          <div className="rounded border border-border-subtle bg-bg-surface p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4">
              Recent events from this source
            </div>
            <ul className="space-y-3">
              {recentEvents.map((ev) => {
                const cls = ALL_CLASSES.find((c) => c.id === ev.class);
                return (
                  <li
                    key={ev.id}
                    className="flex items-start gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0"
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-border-subtle/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                      {cls?.label ?? ev.class}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">{ev.summary}</p>
                      <p className="mt-1 font-mono text-[10px] text-text-muted">
                        {ev.hoursAgo}h ago
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-text-muted">
              Events above are illustrative seeds. Live event stream lands in Sprint 3.
            </p>
          </div>
        )}

        {/* ── Methodology section ────────────────────────────────────────── */}
        <div className="rounded border border-border-subtle bg-bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
            How we use this source
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {s.name} feeds into the Aegis Lens ingestion pipeline as a{" "}
            <strong className="text-text-primary">{s.type}</strong> source.
            All incoming events are normalised to the AegisEvent schema, deduplicated
            against existing events using spatial + temporal similarity hashing, and
            assigned an initial confidence score derived from this source&rsquo;s{" "}
            {s.tier === "tier1" ? "Tier 1 trust rating" : s.tier === "tier2" ? "Tier 2 trust rating" : "Tier 3 trust rating"}.
            Events from {s.name} that conflict with a higher-tier source are
            automatically flagged for analyst review before being published.
            Freshness polling occurs every {freshnessLabel(s.freshnessMinutes)}.
          </p>
        </div>

        {/* ── External link ──────────────────────────────────────────────── */}
        <div className="rounded border border-border-subtle bg-bg-surface p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
            Authoritative source
          </div>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            {s.url}
            <span className="font-mono text-[10px] text-text-muted">↗</span>
          </a>
        </div>

        {/* ── Related sources ────────────────────────────────────────────── */}
        {relatedSources.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Related sources
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {relatedSources.map((r) => {
                const rHref =
                  locale === "en"
                    ? `/sources/${r.slug}`
                    : `/${locale}/sources/${r.slug}`;
                return (
                  <li key={r.slug}>
                    <a
                      href={rHref}
                      className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-3 py-2.5 text-sm transition-colors hover:bg-bg-elevated"
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{TYPE_ICON[r.type]}</span>
                        <span className="text-text-primary">{r.name}</span>
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider ${TIER_COLOR[r.tier]}`}
                      >
                        {TIER_LABEL[r.tier]}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface/60 p-3">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm ${mono ? "font-mono" : ""} text-text-primary`}
      >
        {value}
      </dd>
    </div>
  );
}
