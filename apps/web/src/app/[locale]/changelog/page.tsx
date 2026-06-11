import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { CHANGELOG, type ChangeType } from "@/lib/changelog-data";

const lp = (lc: Locale) => (lc === "en" ? "/changelog" : `/${lc}/changelog`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Changelog",
    description: "Every feature, fix, and improvement in Aegis Lens — documented.",
    pathFor: lp,
  });
}

function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const styles: Record<ChangeType, string> = {
    feature:     "bg-green-500/10 text-green-400 border-green-500/20",
    improvement: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    fix:         "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    breaking:    "bg-red-500/10 text-red-400 border-red-500/20",
    security:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
    deprecation: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return (
    <span
      className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase ${styles[type]}`}
    >
      {type}
    </span>
  );
}

export default async function ChangelogPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Aegis Lens Changelog",
    description: "Every feature, fix, and improvement in Aegis Lens — documented.",
    datePublished: CHANGELOG[CHANGELOG.length - 1]!.date,
    dateModified: CHANGELOG[0]!.date,
    author: { "@type": "Organization", name: "Aegis Lens" },
    hasPart: CHANGELOG.map((e) => ({
      "@type": "Article",
      headline: `v${e.version} — ${e.title}`,
      datePublished: e.date,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      <div className="border-b border-border-subtle bg-bg-base px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-accent">
                Changelog
              </p>
              <h1 className="text-3xl font-bold text-text-primary">
                What&apos;s New in Aegis Lens
              </h1>
              <p className="mt-2 text-text-secondary">
                Every feature, fix, and improvement — documented.
              </p>
            </div>
            {/* Subscribe section */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted">Subscribe to updates:</span>
              <a href="/changelog/feed.xml" className="text-accent hover:underline">
                RSS
              </a>
              <span className="text-text-muted">|</span>
              <a href="/changelog/atom.xml" className="text-accent hover:underline">
                Atom
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Body: sidebar + entries */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">

          {/* Left sidebar nav */}
          <aside>
            <nav
              aria-label="Version navigation"
              className="sticky top-20 rounded border border-border-subtle bg-bg-surface p-4"
            >
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Versions
              </p>
              <ol className="space-y-1">
                {CHANGELOG.map((entry) => (
                  <li key={entry.version}>
                    <a
                      href={`#v${entry.version}`}
                      className="group flex flex-col rounded px-2 py-1.5 hover:bg-bg-elevated"
                    >
                      <span className="font-mono text-[11px] font-semibold text-text-primary group-hover:text-accent">
                        v{entry.version}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {entry.date}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Changelog entries */}
          <div>
            {CHANGELOG.map((entry) => (
              <article
                key={entry.version}
                id={`v${entry.version}`}
                className="mb-12 scroll-mt-20"
              >
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    v{entry.version}
                  </span>
                  <time className="text-xs text-text-muted">{entry.date}</time>
                  {entry.highlight && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                      {entry.highlight}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  {entry.title}
                </h2>

                <ul className="space-y-2">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="flex gap-3">
                      <ChangeTypeBadge type={c.type} />
                      <span className="text-sm text-text-secondary">
                        {c.link ? (
                          <a href={c.link} className="text-accent hover:underline">
                            {c.text}
                          </a>
                        ) : (
                          c.text
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-b border-border-subtle" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
