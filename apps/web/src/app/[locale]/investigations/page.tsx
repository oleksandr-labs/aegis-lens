import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { listInvestigations } from "@/lib/investigations-seed";
import {
  INVESTIGATIONS_DATA,
  getInvestigationData,
  type InvestigationStatus,
  STATUS_CONFIG,
} from "@/lib/investigations-data";

function RssBadges({ slug, locale }: { slug: string; locale: Locale }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        feed:
      </span>
      <a
        href={urls.investigationFeedLocale(locale, slug)}
        title="RSS feed for this investigation"
        className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:border-accent hover:text-accent"
      >
        RSS
      </a>
      <a
        href={urls.investigationAtomLocale(locale, slug)}
        title="Atom feed for this investigation"
        className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:border-accent hover:text-accent"
      >
        Atom
      </a>
      <a
        href={urls.investigationJsonLocale(locale, slug)}
        title="JSON feed for this investigation"
        className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:border-accent hover:text-accent"
      >
        JSON
      </a>
    </div>
  );
}

/** Pulsing dot for ongoing status, static dot for others. */
function StatusBadge({ status }: { status: InvestigationStatus | null }) {
  if (!status) return null;
  if (status === "ongoing") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-orange-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
        </span>
        Ongoing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
      <span className="h-2 w-2 rounded-full bg-border-default" />
      {STATUS_CONFIG[status].label}
    </span>
  );
}

/** Filter chip link. */
function FilterChip({
  label,
  value,
  active,
  locale,
}: {
  label: string;
  value: string;
  active: boolean;
  locale: Locale;
}) {
  const base = urls.investigations(locale);
  const href = value === "all" ? base : `${base}?status=${value}`;
  return (
    <a
      href={href}
      className={[
        "rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-subtle bg-bg-elevated text-text-muted hover:border-accent hover:text-accent",
      ].join(" ")}
    >
      {label}
    </a>
  );
}

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Open Investigations";
const DESCRIPTION =
  "In-depth OSINT investigations combining verified events, satellite imagery, and source analysis.";

const SEED_INVESTIGATIONS = listInvestigations();

function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Investigations",
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/investigations"),
  });
}

export default async function InvestigationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = searchParams ? await searchParams : {};
  const activeStatus = (sp.status ?? "all") as InvestigationStatus | "all";

  const pageUrl = `${SITE.url}${localePath(locale, "/investigations")}`;

  // Merge seed data with extended data for status-aware filtering
  const allInvestigations = SEED_INVESTIGATIONS.map((inv) => ({
    seed: inv,
    data: getInvestigationData(inv.slug),
  }));

  // Also include investigations that are only in INVESTIGATIONS_DATA (not in seed)
  const seedSlugs = new Set(SEED_INVESTIGATIONS.map((i) => i.slug));
  const dataOnlyInvestigations = INVESTIGATIONS_DATA.filter(
    (d) => !seedSlugs.has(d.slug),
  );

  const filteredSeed = allInvestigations.filter(({ data }) => {
    if (activeStatus === "all") return true;
    return data?.status === activeStatus;
  });

  const filteredDataOnly = dataOnlyInvestigations.filter((d) => {
    if (activeStatus === "all") return true;
    return d.status === activeStatus;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Investigations",
    description: DESCRIPTION,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SEED_INVESTIGATIONS.length,
      itemListElement: SEED_INVESTIGATIONS.map((inv, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Article",
          headline: inv.title,
          datePublished: inv.date,
          description: inv.summary,
          keywords: inv.tags.join(", "),
          author: { "@type": "Person", name: inv.analyst },
          publisher: { "@type": "Organization", name: SITE.name },
          inLanguage: locale,
          url: `${pageUrl}#${inv.slug}`,
        },
      })),
    },
  };

  const STATUS_FILTERS: { label: string; value: string }[] = [
    { label: "All", value: "all" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Concluded", value: "concluded" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Investigations"
        title={TITLE}
        description={DESCRIPTION}
      />
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Toolbar: status filters + RSS link */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                label={f.label}
                value={f.value}
                active={activeStatus === f.value}
                locale={locale}
              />
            ))}
          </div>
          <a
            href={urls.investigationsFeed()}
            className="font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
          >
            RSS feed →
          </a>
        </div>

        {/* Seed-backed investigation cards */}
        {filteredSeed.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredSeed.map(({ seed: inv, data }) => (
              <li key={inv.slug} id={inv.slug} className="flex flex-col">
                <article className="flex flex-1 flex-col rounded border border-border-subtle bg-bg-surface hover:bg-bg-elevated">
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="flex flex-1 flex-col p-4"
                  >
                    {/* Status + meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={data?.status ?? null} />
                      <span className="font-mono text-[10px] text-text-muted">
                        <time dateTime={inv.date}>
                          {formatDate(inv.date, locale)}
                        </time>
                      </span>
                    </div>

                    <h2 className="mt-2 text-base font-semibold text-text-primary">
                      {inv.title}
                    </h2>

                    {/* Subtitle from extended data */}
                    {data?.subtitle && (
                      <p className="mt-1 text-xs text-text-muted">
                        {data.subtitle}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-text-secondary">
                      {inv.summary}
                    </p>

                    {/* Authors */}
                    <p className="mt-2 font-mono text-[10px] text-text-muted">
                      {data?.authors.length
                        ? data.authors.join(", ")
                        : `Lead: ${inv.analyst}`}
                    </p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {inv.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Stats row */}
                    {data && (
                      <div className="mt-3 flex gap-4 font-mono text-[10px] text-text-muted">
                        <span>{data.keyFindings.length} findings</span>
                        {data.eventIds.length > 0 && (
                          <span>{data.eventIds.length} events</span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 font-mono text-[10px] text-accent">
                      Read investigation →
                    </div>
                  </Link>
                  <div className="border-t border-border-subtle">
                    <RssBadges slug={inv.slug} locale={locale} />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {/* Data-only investigation cards (not in seed) */}
        {filteredDataOnly.length > 0 && (
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredDataOnly.map((inv) => (
              <li key={inv.slug} id={inv.slug} className="flex flex-col">
                <article className="flex flex-1 flex-col rounded border border-border-subtle bg-bg-surface hover:bg-bg-elevated">
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="flex flex-1 flex-col p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={inv.status} />
                      <span className="font-mono text-[10px] text-text-muted">
                        <time dateTime={inv.date}>
                          {formatDate(inv.date, locale)}
                        </time>
                      </span>
                    </div>
                    <h2 className="mt-2 text-base font-semibold text-text-primary">
                      {inv.title}
                    </h2>
                    {inv.subtitle && (
                      <p className="mt-1 text-xs text-text-muted">
                        {inv.subtitle}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-text-secondary">
                      {inv.summary}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-text-muted">
                      {inv.authors.join(", ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {inv.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-4 font-mono text-[10px] text-text-muted">
                      <span>{inv.keyFindings.length} findings</span>
                      {inv.eventIds.length > 0 && (
                        <span>{inv.eventIds.length} events</span>
                      )}
                    </div>
                    <div className="mt-3 font-mono text-[10px] text-accent">
                      Read investigation →
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}

        {filteredSeed.length === 0 && filteredDataOnly.length === 0 && (
          <p className="py-16 text-center font-mono text-sm text-text-muted">
            No investigations match this filter.
          </p>
        )}
      </section>
    </>
  );
}
