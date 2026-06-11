import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  INVESTIGATIONS,
  getInvestigation,
  type Investigation,
} from "@/lib/investigations-seed";
import { eventById } from "@/lib/events-seed";
import { SITE } from "@/lib/site";
import { timeAgo } from "@/lib/format";
import {
  getInvestigationData,
  STATUS_CONFIG,
  SOURCE_TYPE_ICON,
  type InvestigationStatus,
  type SourceType,
} from "@/lib/investigations-data";

type Params = { locale: string; slug: string };

// ---------- UI helpers ----------

function StatusBadge({ status }: { status: InvestigationStatus }) {
  if (status === "ongoing") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-orange-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
        </span>
        {STATUS_CONFIG[status].label}
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

function SourceTypeIcon({ type }: { type: SourceType }) {
  return (
    <span
      className="text-base leading-none"
      title={type}
      aria-label={type}
    >
      {SOURCE_TYPE_ICON[type]}
    </span>
  );
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const inv of INVESTIGATIONS) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: inv.slug });
    }
  }
  return out;
}

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
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const inv = getInvestigation(slug);
  if (!inv) return { robots: { index: false } };
  const hasFeed = (inv.citedEventIds?.length ?? 0) > 0;
  return buildMetadata({
    locale,
    title: inv.title,
    description: inv.summary,
    pathFor: (lc) => localePath(lc, `/investigations/${inv.slug}`),
    feeds: hasFeed
      ? [
          {
            type: "application/rss+xml",
            href: urls.investigationFeedLocale(locale, inv.slug),
            title: `${inv.title} — cited events (RSS)`,
          },
          {
            type: "application/atom+xml",
            href: urls.investigationAtomLocale(locale, inv.slug),
            title: `${inv.title} — cited events (Atom)`,
          },
          {
            type: "application/feed+json",
            href: urls.investigationJsonLocale(locale, inv.slug),
            title: `${inv.title} — cited events (JSON Feed)`,
          },
        ]
      : undefined,
  });
}

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const inv = getInvestigation(slug);
  if (!inv) notFound();

  // Extended data (timeline, status, typed sources, authors, key findings)
  const extData = getInvestigationData(slug);

  const pageUrl = `${SITE.url}${localePath(locale, `/investigations/${inv.slug}`)}`;
  const indexUrl = `${SITE.url}${localePath(locale, "/investigations")}`;

  const analystSlug = inv.analyst
    .toLowerCase()
    .replace(/[.\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const analystId = `${SITE.url}/about#analyst-${analystSlug}`;

  const citedEvents = (inv.citedEventIds ?? [])
    .map((id) => eventById(id))
    .filter((e): e is NonNullable<ReturnType<typeof eventById>> => e !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": analystId,
        name: inv.analyst,
        jobTitle: "OSINT Analyst",
        worksFor: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
      {
        "@type": "Article",
        headline: inv.title,
        datePublished: inv.date,
        description: inv.summary,
        keywords: inv.tags.join(", "),
        author: { "@id": analystId },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
        },
        mainEntityOfPage: pageUrl,
        inLanguage: locale,
        url: pageUrl,
        ...(inv.doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: inv.doi } } : {}),
        citation: [
          ...inv.sources.map((s) => ({
            "@type": "CreativeWork",
            name: s.label,
            url: s.url,
          })),
          ...citedEvents.map((e) => ({
            "@type": "CreativeWork",
            name: e.summary.en,
            url: `${SITE.url}${urls.event(locale, e.eventId)}`,
            identifier: e.eventId,
          })),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Investigations",
            item: indexUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: inv.title,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* ── Page header ── */}
        <PageHeader
          eyebrow="Long-form"
          title={inv.title}
          description={extData?.subtitle ?? inv.summary}
        />

        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* ── Breadcrumb ── */}
          <nav
            className="mb-6 font-mono text-[11px] text-text-muted"
            aria-label="Breadcrumb"
          >
            <Link
              href={urls.investigations(locale)}
              className="hover:text-text-primary"
            >
              Investigations
            </Link>
            <span className="mx-2 text-border-default">/</span>
            <span className="text-text-secondary">{inv.title}</span>
          </nav>

          {/* ── Status + meta bar ── */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {extData?.status && <StatusBadge status={extData.status} />}
            <span className="font-mono text-[11px] text-text-muted">
              By{" "}
              {extData?.authors?.length
                ? extData.authors.join(", ")
                : inv.analyst}
            </span>
            <time
              dateTime={inv.date}
              className="font-mono text-[11px] text-text-muted"
            >
              {formatDate(inv.date, locale)}
            </time>
            {inv.contributors && inv.contributors.length > 0 && (
              <span className="font-mono text-[11px] text-text-muted">
                Contributors: {inv.contributors.join(", ")}
              </span>
            )}
            <Link
              href={urls.methodology(locale)}
              className="font-mono text-[11px] text-text-muted hover:text-accent"
            >
              methodology
            </Link>
            {inv.doi && (
              <a
                href={`https://doi.org/${inv.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-text-muted hover:text-accent"
                title="Citable DOI"
              >
                DOI: {inv.doi}
              </a>
            )}
            {/* Tag chips */}
            <div className="flex flex-wrap gap-1.5">
              {inv.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Research question ── */}
          {inv.question && (
            <div className="mt-6 rounded border border-accent/30 bg-accent/5 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Research question
              </p>
              <p className="mt-1 text-sm text-text-primary">{inv.question}</p>
            </div>
          )}

          {/* ── Key findings ── */}
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Key findings
            </h2>
            {/* Prefer extended structured findings; fall back to seed findings */}
            {extData?.keyFindings?.length ? (
              <ol className="mt-4 space-y-3">
                {extData.keyFindings.map((f, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 font-mono text-[11px] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-text-secondary">{f}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="mt-3 space-y-2">
                {inv.findings.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 rounded border border-border-subtle bg-bg-surface p-3 text-sm text-text-secondary"
                  >
                    <span className="font-mono text-[10px] text-text-muted">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Investigation timeline (extended data only) ── */}
          {extData?.timeline && extData.timeline.length > 0 && (
            <section className="mt-10">
              <h2 className="text-base font-semibold text-text-primary">
                Investigation Timeline
              </h2>
              <ol className="relative ml-4 mt-4 space-y-6 border-l border-border-subtle">
                {extData.timeline.map((t, i) => (
                  <li key={i} className="ml-6">
                    <span className="absolute -left-2.5 h-5 w-5 rounded-full border-2 border-accent bg-bg-base" />
                    <time className="font-mono text-[11px] text-text-muted">
                      {t.date}
                    </time>
                    <p className="mt-1 text-sm text-text-secondary">{t.event}</p>
                    <span className="text-[10px] text-text-muted">
                      Source: {t.source}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── Long-form analysis sections (seed) ── */}
          {inv.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">
                {s.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {s.body}
              </p>
            </section>
          ))}

          {/* ── Caveats ── */}
          {inv.caveats && inv.caveats.length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">
                Caveats &amp; limitations
              </h2>
              <ul className="mt-3 space-y-2">
                {inv.caveats.map((c, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 rounded border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-text-secondary"
                  >
                    <span className="font-mono text-[10px] text-amber-500">
                      !
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Cited events ── */}
          {citedEvents.length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">
                Cited events
              </h2>
              <ul className="mt-3 space-y-2">
                {citedEvents.map((e) => (
                  <li key={e.eventId}>
                    <Link
                      href={urls.event(locale, e.eventId)}
                      className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                        {e.class}
                        {e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
                        {timeAgo(e.occurredAt, locale)}
                      </div>
                      <div className="mt-1 text-text-primary">
                        {e.summary[locale] ?? e.summary.en}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Sources ── typed table if extended data available, plain list otherwise ── */}
          <section className="mt-10">
            {extData?.sources?.length ? (
              <>
                <h2 className="text-base font-semibold text-text-primary">
                  Sources Cited ({extData.sources.length})
                </h2>
                <ul className="mt-4 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
                  {extData.sources.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <SourceTypeIcon type={s.type} />
                      <span className="text-sm text-text-primary">{s.name}</span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="ml-auto text-xs text-accent hover:underline"
                      >
                        View →
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2 className="text-base font-semibold text-text-primary">
                  Sources
                </h2>
                <ul className="mt-3 space-y-1.5">
                  {inv.sources.map((s) => (
                    <li key={s.url} className="text-sm">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-text-secondary hover:text-accent"
                      >
                        {s.label}{" "}
                        <span className="font-mono text-[10px] text-text-muted">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ── Related regions ── */}
          {inv.citedOblastSlugs && inv.citedOblastSlugs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-semibold text-text-primary">
                Related regions
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {inv.citedOblastSlugs.map((s) => (
                  <li key={s}>
                    <Link
                      href={
                        locale === "en"
                          ? `/regions/ua/${s}`
                          : `/${locale}/regions/ua/${s}`
                      }
                      className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Related investigations ── prefer relatedSlugs from extended data, fall back to tag match ── */}
          {(() => {
            const relatedBySlug = extData?.relatedSlugs?.length
              ? (extData.relatedSlugs
                  .map((s) => INVESTIGATIONS.find((x) => x.slug === s))
                  .filter((x): x is Investigation => x !== undefined))
              : INVESTIGATIONS.filter(
                  (x) =>
                    x.slug !== inv.slug &&
                    x.tags.some((t) => inv.tags.includes(t)),
                ).slice(0, 3);

            if (!relatedBySlug.length) return null;
            return (
              <section className="mt-10 border-t border-border-subtle pt-6">
                <h2 className="text-base font-semibold text-text-primary">
                  Related investigations
                </h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {relatedBySlug.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={urls.investigation(locale, r.slug)}
                        className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      >
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}

          {/* ── Reader tip submission ── */}
          <section
            id="submit-tip"
            className="mt-10 rounded border border-border-subtle bg-bg-elevated p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              Submit a tip
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Have information relevant to this investigation? We protect
              source confidentiality. Tips are reviewed by our editorial team
              before any use.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-baseline gap-3">
                <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Encrypted email
                </span>
                <a
                  href="mailto:tips@aegislens.io"
                  className="text-accent hover:underline"
                >
                  tips@aegislens.io
                </a>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  PGP key
                </span>
                <a
                  href="/pgp/tips-public-key.asc"
                  className="font-mono text-[11px] text-text-secondary hover:text-accent"
                >
                  /pgp/tips-public-key.asc
                </a>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  SecureDrop
                </span>
                <span className="text-xs text-text-muted">
                  Available — see contact page for onion address
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-text-muted">
              We do not log IP addresses on tip submissions. By submitting you
              consent to Aegis Lens storing and reviewing the content of your
              tip. Your identity is never published without explicit written
              consent.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
