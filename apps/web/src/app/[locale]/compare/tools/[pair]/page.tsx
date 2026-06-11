import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { TOOLS, type DirectoryEntry } from "@/lib/directory-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; pair: string };

/**
 * Generates `/compare/tools/<a>-vs-<b>` for every UNORDERED pair of TOOLS that
 * share a category. Same-category restriction keeps the surface meaningful
 * (no "Maltego vs SunCalc") and bounds the page count to something realistic.
 *
 * Canonical pair order is alphabetical (a < b). Reverse-order requests should
 * be redirected to canonical; for now we just `notFound()` on non-canonical.
 */
export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      const a = TOOLS[i];
      const b = TOOLS[j];
      if (a.category !== b.category) continue;
      const [first, second] = a.slug < b.slug ? [a, b] : [b, a];
      const pair = `${first.slug}-vs-${second.slug}`;
      if (seen.has(pair)) continue;
      seen.add(pair);
      for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, pair });
    }
  }
  return out;
}

function parsePair(pair: string): [DirectoryEntry, DirectoryEntry] | null {
  // Split on the last "-vs-" to handle slugs that themselves contain "-vs-".
  const idx = pair.lastIndexOf("-vs-");
  if (idx <= 0) return null;
  const aSlug = pair.slice(0, idx);
  const bSlug = pair.slice(idx + 4);
  const a = TOOLS.find((t) => t.slug === aSlug);
  const b = TOOLS.find((t) => t.slug === bSlug);
  if (!a || !b) return null;
  if (a.category !== b.category) return null;
  // Canonical order
  if (a.slug >= b.slug) return null;
  return [a, b];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, pair } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const parsed = parsePair(pair);
  if (!parsed) return { robots: { index: false } };
  const [a, b] = parsed;
  return buildMetadata({
    locale,
    title: `${a.name} vs ${b.name} — side-by-side`,
    description: `Head-to-head comparison of ${a.name} and ${b.name} in the ${a.category} space. Directory facts, region, verification status, and category alternatives.`,
    pathFor: (lc) => localePath(lc, `/compare/tools/${pair}`),
  });
}

export default async function ToolPairComparePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, pair } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const [a, b] = parsed;

  const otherInCategory = TOOLS.filter(
    (t) => t.category === a.category && t.slug !== a.slug && t.slug !== b.slug,
  ).slice(0, 6);

  const pageUrl = `${SITE.url}${localePath(locale, `/compare/tools/${pair}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${a.name} vs ${b.name}`,
        itemListOrder: "Unordered",
        numberOfItems: 2,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: `${SITE.url}${urls.toolDetail(locale, a.slug)}`,
            name: a.name,
          },
          {
            "@type": "ListItem",
            position: 2,
            url: `${SITE.url}${urls.toolDetail(locale, b.slug)}`,
            name: b.name,
          },
        ],
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
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${a.name} vs ${b.name}`,
            item: pageUrl,
          },
        ],
      },
    ],
  };

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
          <span className="text-text-secondary">{a.name} vs {b.name}</span>
        </nav>

        <PageHeader
          eyebrow="Head-to-head"
          title={`${a.name} vs ${b.name}`}
          description={`Side-by-side comparison in the ${a.category} category.`}
        />

        <section className="mt-6 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th
                  scope="col"
                  className="sticky left-0 z-10 min-w-[160px] bg-bg-surface px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                >
                  Metric
                </th>
                {[a, b].map((t) => (
                  <th
                    key={t.slug}
                    scope="col"
                    className="min-w-[220px] border-l border-border-subtle px-4 py-3 text-left"
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
                  {[a, b].map((t) => (
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

        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[a, b].map((t) => (
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

        {otherInCategory.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other {a.category} tools
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              {otherInCategory.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={urls.toolDetail(locale, t.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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
