import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  CONFLICTS,
  localized,
  type ConflictParty,
  type ConflictTimelineEvent,
  type ConflictStat,
  type ConflictCitation,
} from "@/lib/seed-data";
import { REPORTS } from "@/lib/reports-seed";

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const c of CONFLICTS) {
    for (const locale of ACTIVE_LOCALES) {
      out.push({ locale, slug: c.slug });
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
  const c = CONFLICTS.find((x) => x.slug === slug);
  if (!c) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: localized(c.name, locale),
    description: localized(c.description, locale),
    pathFor: (lc) => urls.conflict(lc, slug),
  });
}

const ROLE_LABEL: Record<ConflictParty["role"], string> = {
  aggressor: "Aggressor",
  defender: "Defender",
  mediator: "Mediator",
  observer: "Observer / Support",
};

const ROLE_STYLE: Record<ConflictParty["role"], string> = {
  aggressor: "border-red-500/40 bg-red-500/10 text-red-400",
  defender: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  mediator: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  observer: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
};

const CLASS_STYLE: Record<string, string> = {
  kinetic: "border-red-500/40 bg-red-500/10 text-red-400",
  diplomatic: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  humanitarian: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  information: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  political: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
};

const CITATION_TYPE_LABEL: Record<ConflictCitation["type"], string> = {
  report: "Report",
  academic: "Academic",
  news: "News",
  official: "Official",
};

const STATUS_STYLE: Record<string, string> = {
  active: "border-red-500/40 bg-red-500/10 text-red-400",
  frozen: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  resolved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

export default async function ConflictPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = CONFLICTS.find((x) => x.slug === slug);
  if (!c) notFound();

  const name = localized(c.name, locale);
  const desc = localized(c.description, locale);

  const conflictReports = (c.reportSlugs ?? [])
    .map((s) => REPORTS.find((r) => r.slug === s))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: name,
        description: desc,
        datePublished: c.statusDate ?? "2022-02-24",
        dateModified: new Date().toISOString().split("T")[0],
        inLanguage: locale,
        author: { "@type": "Organization", name: "Aegis Lens" },
        publisher: { "@type": "Organization", name: "Aegis Lens" },
        about: {
          "@type": "Event",
          name,
          startDate: c.statusDate,
          location: c.regions.map((r) => ({ "@type": "Place", addressCountry: r.toUpperCase() })),
          eventStatus:
            c.status === "active"
              ? "https://schema.org/EventScheduled"
              : "https://schema.org/EventPostponed",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://aegislens.io" },
          { "@type": "ListItem", position: 2, name: "Conflicts", item: "https://aegislens.io/conflicts" },
          { "@type": "ListItem", position: 3, name },
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
      <PageHeader
        eyebrow="Conflict"
        title={name}
        description={desc}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-14">

        {/* Status + disputed area notice */}
        <div className="flex flex-wrap gap-3 items-center">
          <span
            className={`rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${STATUS_STYLE[c.status] ?? STATUS_STYLE.active}`}
          >
            {c.status}
            {c.statusDate ? ` · since ${c.statusDate.slice(0, 7)}` : ""}
          </span>
        </div>

        {c.disputedAreaNotice && (
          <aside className="rounded border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300">
            <p className="font-semibold mb-1">Territorial display policy</p>
            <p>{localized(c.disputedAreaNotice, locale)}</p>
          </aside>
        )}

        {/* Key statistics */}
        {c.keyStats && c.keyStats.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Key statistics</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {c.keyStats.map((s: ConflictStat) => (
                <div
                  key={s.label.en}
                  className="rounded border border-border-subtle bg-bg-surface p-4"
                >
                  <dt className="text-xs text-text-muted font-mono uppercase tracking-wider">
                    {localized(s.label, locale)}
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-text-primary">{s.value}</dd>
                  {s.source && (
                    <dd className="mt-1 text-[10px] text-text-muted">{s.source}</dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Parties */}
        {c.parties && c.parties.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Parties involved</h2>
            <p className="text-sm text-text-muted mb-4">
              Listed with neutrality. Labels describe documented military roles, not political judgment.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.parties.map((p: ConflictParty) => (
                <div
                  key={p.name.en}
                  className="rounded border border-border-subtle bg-bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-text-primary">
                      {localized(p.name, locale)}
                    </span>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${ROLE_STYLE[p.role]}`}
                    >
                      {ROLE_LABEL[p.role]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    {localized(p.description, locale)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {c.timelineEvents && c.timelineEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-6">Timeline of major events</h2>
            <p className="text-sm text-text-muted mb-4">
              Selected by historical significance. Ordered chronologically.
            </p>
            <ol className="relative border-l border-border-subtle space-y-6 pl-6">
              {c.timelineEvents.map((ev: ConflictTimelineEvent) => (
                <li key={ev.date} className="relative">
                  <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-border-default bg-bg-elevated" />
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <time className="font-mono text-xs text-text-muted">{ev.date}</time>
                    {ev.class && (
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${CLASS_STYLE[ev.class] ?? CLASS_STYLE.kinetic}`}
                      >
                        {ev.class}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-text-primary">
                    {localized(ev.title, locale)}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {localized(ev.description, locale)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Affected regions */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Affected regions</h2>
          <ul className="flex flex-wrap gap-2">
            {c.regions.map((r) => (
              <li key={r}>
                <Link
                  href={urls.region(locale, r)}
                  className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:border-accent"
                >
                  {r.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Methodology */}
        {c.methodology && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">Methodology & sources</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {localized(c.methodology, locale)}
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Spot an error?{" "}
              <Link href="/contact" className="underline hover:text-text-primary">
                Let us know
              </Link>{" "}
              — accuracy is non-negotiable.
            </p>
          </section>
        )}

        {/* Reports & briefs */}
        {conflictReports.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Reports & briefs</h2>
            <ul className="space-y-2">
              {conflictReports.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.report(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {r.title[locale as keyof typeof r.title] ?? r.title.en}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">{r.kind}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {r.summary[locale as keyof typeof r.summary] ?? r.summary.en}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-accent">Read report →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Citations */}
        {c.citations && c.citations.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Citations & recommended reading
            </h2>
            <ul className="space-y-2">
              {c.citations.map((cit: ConflictCitation) => (
                <li key={cit.url} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                      cit.type === "official"
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : cit.type === "academic"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : cit.type === "report"
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                        : "border-zinc-500/40 bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {CITATION_TYPE_LABEL[cit.type]}
                  </span>
                  <a
                    href={cit.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-text-secondary hover:text-text-primary underline underline-offset-2"
                  >
                    {cit.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Back link */}
        <div className="border-t border-border-subtle pt-6">
          <Link
            href={localePath(locale, "/conflicts")}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            ← All conflicts
          </Link>
        </div>
      </div>
    </>
  );
}
