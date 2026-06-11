import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { TOOLS, type DirectoryEntry } from "@/lib/directory-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; triple: string };

/**
 * 3-way head-to-head: `/compare/tools/<a>-vs-<b>-vs-<c>` where all three
 * share a category. Canonical order is alphabetical. The 2-way variant
 * (without a third slug) is served by [pair]/page.tsx — Next picks the
 * more-specific match, so this catch-all runs only when there are two
 * "-vs-" tokens.
 */

function parseTriple(triple: string): [DirectoryEntry, DirectoryEntry, DirectoryEntry] | null {
  // We split into 3 tokens by "-vs-" but slugs themselves may contain "-vs-".
  // Try every possible 2-split and pick the one where every chunk resolves
  // to a tool, all share a category, and the resulting trio is in canonical
  // alphabetical order.
  const tokens = triple.split("-vs-");
  if (tokens.length < 3) return null;

  // Try every combination of 2 split-points among the boundaries between tokens.
  // For most reasonable inputs there's a single valid splitting; we iterate
  // defensively.
  const boundaries: { aLen: number; bLen: number }[] = [];
  for (let i = 1; i < tokens.length - 1; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      boundaries.push({ aLen: i, bLen: j - i });
    }
  }

  for (const { aLen, bLen } of boundaries) {
    const aSlug = tokens.slice(0, aLen).join("-vs-");
    const bSlug = tokens.slice(aLen, aLen + bLen).join("-vs-");
    const cSlug = tokens.slice(aLen + bLen).join("-vs-");
    if (!aSlug || !bSlug || !cSlug) continue;
    const a = TOOLS.find((t) => t.slug === aSlug);
    const b = TOOLS.find((t) => t.slug === bSlug);
    const c = TOOLS.find((t) => t.slug === cSlug);
    if (!a || !b || !c) continue;
    if (a.category !== b.category || b.category !== c.category) continue;
    // Canonical alphabetical order
    if (!(a.slug < b.slug && b.slug < c.slug)) continue;
    return [a, b, c];
  }
  return null;
}

function listCanonicalTriples(): [DirectoryEntry, DirectoryEntry, DirectoryEntry][] {
  const out: [DirectoryEntry, DirectoryEntry, DirectoryEntry][] = [];
  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      for (let k = j + 1; k < TOOLS.length; k++) {
        const a = TOOLS[i];
        const b = TOOLS[j];
        const c = TOOLS[k];
        if (a.category !== b.category || b.category !== c.category) continue;
        // The TOOLS array isn't slug-sorted, so canonical = alphabetical sort:
        const sorted = [a, b, c].sort((x, y) => x.slug.localeCompare(y.slug));
        out.push([sorted[0], sorted[1], sorted[2]]);
      }
    }
  }
  return out;
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const seen = new Set<string>();
  for (const [a, b, c] of listCanonicalTriples()) {
    const triple = `${a.slug}-vs-${b.slug}-vs-${c.slug}`;
    if (seen.has(triple)) continue;
    seen.add(triple);
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, triple });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, triple } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const parsed = parseTriple(triple);
  if (!parsed) return { robots: { index: false } };
  const [a, b, c] = parsed;
  return buildMetadata({
    locale,
    title: `${a.name} vs ${b.name} vs ${c.name} — 3-way comparison`,
    description: `Three-way head-to-head in the ${a.category} space: ${a.name}, ${b.name}, ${c.name}. Directory facts side-by-side.`,
    pathFor: (lc) => localePath(lc, `/compare/tools/3way/${triple}`),
  });
}

export default async function ToolTripleComparePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, triple } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const parsed = parseTriple(triple);
  if (!parsed) notFound();
  const trio = parsed;

  const pageUrl = `${SITE.url}${localePath(locale, `/compare/tools/3way/${triple}`)}`;

  type Row = { label: string; render: (t: DirectoryEntry) => React.ReactNode };
  const rows: Row[] = [
    { label: "Category", render: (t) => t.category },
    { label: "Region", render: (t) => t.region },
    {
      label: "Verified",
      render: (t) =>
        t.verified ? (
          <span className="text-green-400">yes</span>
        ) : (
          <span className="text-text-muted">no</span>
        ),
    },
    {
      label: "Description",
      render: (t) => (
        <span className="text-text-secondary">{t.description}</span>
      ),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${trio[0].name} vs ${trio[1].name} vs ${trio[2].name}`,
        itemListOrder: "Unordered",
        numberOfItems: 3,
        itemListElement: trio.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE.url}${urls.toolDetail(locale, t.slug)}`,
          name: t.name,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Compare",
            item: `${SITE.url}${urls.compare(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: "Tools" },
          {
            "@type": "ListItem",
            position: 3,
            name: `${trio[0].name} vs ${trio[1].name} vs ${trio[2].name}`,
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

      <article className="mx-auto max-w-5xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.compare(locale)} className="hover:text-text-primary">
            Compare
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.tools(locale)} className="hover:text-text-primary">
            Tools
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">
            {trio[0].name} vs {trio[1].name} vs {trio[2].name}
          </span>
        </nav>

        <PageHeader
          eyebrow="3-way head-to-head"
          title={`${trio[0].name} vs ${trio[1].name} vs ${trio[2].name}`}
          description={`Three-way side-by-side comparison in the ${trio[0].category} category.`}
        />

        <section className="mt-6 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th
                  scope="col"
                  className="sticky left-0 z-10 min-w-[140px] bg-bg-surface px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                >
                  Metric
                </th>
                {trio.map((t) => (
                  <th
                    key={t.slug}
                    scope="col"
                    className="min-w-[200px] border-l border-border-subtle px-4 py-3 text-left"
                  >
                    <Link
                      href={urls.toolDetail(locale, t.slug)}
                      className="block text-text-primary hover:text-accent"
                    >
                      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                        {t.category}
                      </div>
                      <div className="mt-0.5 text-base font-semibold">{t.name}</div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border-subtle last:border-0">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-bg-surface px-4 py-3 text-left align-top font-mono text-[10px] uppercase tracking-wider text-text-muted"
                  >
                    {row.label}
                  </th>
                  {trio.map((t) => (
                    <td
                      key={t.slug}
                      className="border-l border-border-subtle px-4 py-3 align-top text-text-primary"
                    >
                      {row.render(t)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {trio.map((t) => (
            <div key={t.slug} className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Quick links
              </div>
              <h2 className="mt-1 text-base font-semibold text-text-primary">{t.name}</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>
                  <Link
                    href={urls.toolDetail(locale, t.slug)}
                    className="text-accent hover:underline"
                  >
                    Tool detail →
                  </Link>
                </li>
                <li>
                  <Link
                    href={urls.alternatives(locale, t.slug)}
                    className="text-accent hover:underline"
                  >
                    {t.name} alternatives →
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </section>

        <p className="mt-10 text-xs text-text-muted">
          Equal-treatment policy: comparison rows render directory facts only. We don't
          editorially rank competitors. See{" "}
          <Link href={urls.methodology(locale)} className="text-accent hover:underline">
            methodology
          </Link>{" "}
          for the editorial code-of-conduct.
        </p>
      </article>
    </>
  );
}
