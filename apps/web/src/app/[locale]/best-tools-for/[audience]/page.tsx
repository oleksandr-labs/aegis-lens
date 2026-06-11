import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { AUDIENCES, getAudience, listAudiences } from "@/lib/audiences-seed";
import { TOOLS, type DirectoryEntry } from "@/lib/directory-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; audience: string };

const YEAR = new Date().getFullYear();
const TOP_N = 12;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const a of AUDIENCES) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, audience: a.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, audience } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const aud = getAudience(audience);
  if (!aud) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Best OSINT tools for ${aud.label} (${YEAR})`,
    description: `Curated tool list ranked for ${aud.label}: ${aud.persona}. Considerations, methodology, and ${TOP_N} hand-picked tools from the Aegis Lens directory.`,
    pathFor: (lc) => localePath(lc, `/best-tools-for/${aud.slug}`),
  });
}

function scoreTool(tool: DirectoryEntry, preferred: string[]): number {
  const idx = preferred.indexOf(tool.category);
  if (idx === -1) return -1;
  // Higher rank position → higher score.
  return preferred.length - idx + (tool.verified ? 0.5 : 0);
}

export default async function BestToolsForAudiencePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, audience } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const aud = getAudience(audience);
  if (!aud) notFound();

  const ranked = TOOLS.slice()
    .map((t) => ({ tool: t, score: scoreTool(t, aud.preferredCategories) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.tool.name.localeCompare(b.tool.name);
    })
    .slice(0, TOP_N)
    .map((x) => x.tool);

  const pageUrl = `${SITE.url}${localePath(locale, `/best-tools-for/${aud.slug}`)}`;
  const lastReviewedAt = new Date().toISOString().slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `Best OSINT tools for ${aud.label} (${YEAR})`,
        numberOfItems: ranked.length,
        itemListOrder: "Descending",
        url: pageUrl,
        itemListElement: ranked.map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: t.name,
          url: `${SITE.url}${urls.toolDetail(locale, t.slug)}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tools",
            item: `${SITE.url}${urls.tools(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `Best for ${aud.label}`,
            item: pageUrl,
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

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.tools(locale)} className="hover:text-text-primary">
            Tools
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Best for {aud.label}</span>
        </nav>

        <PageHeader
          eyebrow={`Best of ${YEAR}`}
          title={`Best OSINT tools for ${aud.label}`}
          description={aud.persona}
        />

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4 text-sm">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Methodology
          </div>
          <p className="mt-2 text-text-secondary">
            Tools are ranked by category relevance to {aud.label} (see preferred-category
            order below), with verified-directory listings boosted. We don't accept paid
            placement on these lists — see{" "}
            <Link href={urls.methodology(locale)} className="text-accent hover:underline">
              methodology
            </Link>
            .
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Preferred categories (highest first)
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {aud.preferredCategories.join(" · ")}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-text-secondary">
            {aud.considerations.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-muted">
            Last reviewed: {lastReviewedAt} · Refreshes quarterly.
          </p>
        </section>

        {ranked.length === 0 ? (
          <div className="mt-8 rounded border border-dashed border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No directory tools match the preferred categories for {aud.label} yet.
          </div>
        ) : (
          <section className="mt-8">
            <ol className="space-y-3">
              {ranked.map((t, idx) => (
                <li
                  key={t.slug}
                  className="flex gap-4 rounded border border-border-subtle bg-bg-surface p-4"
                >
                  <div className="flex-none font-mono text-2xl font-semibold text-accent">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={urls.toolDetail(locale, t.slug)}
                        className="text-base font-semibold text-text-primary hover:text-accent"
                      >
                        {t.name}
                      </Link>
                      <span className="font-mono text-[10px] uppercase text-text-muted">
                        {t.category}
                      </span>
                      {t.verified && (
                        <span className="rounded border border-green-500/40 bg-green-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-green-300">
                          verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                      {t.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-wider">
                      <Link
                        href={urls.alternatives(locale, t.slug)}
                        className="text-accent hover:underline"
                      >
                        alternatives →
                      </Link>
                      <Link
                        href={urls.toolDetail(locale, t.slug)}
                        className="text-text-muted hover:text-text-primary"
                      >
                        detail →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-10 border-t border-border-subtle pt-6">
          <h2 className="text-base font-semibold text-text-primary">Other audiences</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {listAudiences()
              .filter((x) => x.slug !== aud.slug)
              .map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.bestToolsForAudience(locale, r.slug)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    Best for {r.label}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </>
  );
}
