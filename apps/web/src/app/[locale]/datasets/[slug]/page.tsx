import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  DATASETS_DATA,
  getDatasetData,
  CATEGORY_LABEL,
  FORMAT_LABEL,
  LICENSE_LABEL,
  LICENSE_URL_DATA,
  LICENSE_TEXT,
  SCHEMA_PREVIEW,
  SAMPLE_DATA,
  citationBibtexData,
  citationApaData,
  type DatasetFormat,
} from "@/lib/datasets-data";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const d of DATASETS_DATA) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: d.slug });
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
  const d = getDatasetData(slug);
  if (!d) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${d.title} — Dataset`,
    description: d.description,
    pathFor: (lc) => localePath(lc, `/datasets/${slug}`),
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-GB");
}

export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const d = getDatasetData(slug);
  if (!d) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/datasets/${d.slug}`)}`;
  const sample = SAMPLE_DATA[d.slug];
  const bibtex = citationBibtexData(d, SITE.url);
  const apa = citationApaData(d, SITE.url);
  const licenseText = LICENSE_TEXT[d.license];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: d.title,
        description: d.description,
        url: pageUrl,
        inLanguage: locale,
        license: LICENSE_URL_DATA[d.license],
        encodingFormat: d.formats.join(", "),
        dateModified: d.lastUpdated,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        creator: { "@type": "Organization", name: SITE.name, url: SITE.url },
        distribution: d.formats.map((fmt) => ({
          "@type": "DataDownload",
          encodingFormat: FORMAT_LABEL[fmt],
          contentUrl: `${SITE.url}/data/${d.slug}.${fmt}`,
        })),
        isPartOf: {
          "@type": "DataCatalog",
          name: "Aegis Lens Open Data",
          url: `${SITE.url}${localePath(locale, "/datasets")}`,
        },
        keywords: d.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Datasets",
            item: `${SITE.url}${localePath(locale, "/datasets")}`,
          },
          { "@type": "ListItem", position: 2, name: d.title },
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
        eyebrow={`${CATEGORY_LABEL[d.category]} Dataset`}
        title={d.title}
        description={d.description}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">

        {/* ── Metadata strip ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Category", value: CATEGORY_LABEL[d.category] },
            { label: "Size", value: d.size },
            { label: "Records", value: formatNumber(d.recordCount) },
            { label: "Last updated", value: d.lastUpdated },
            { label: "Frequency", value: d.updateFrequency },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded border border-border-subtle bg-bg-surface px-3 py-2"
            >
              <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
                {label}
              </div>
              <div className="mt-0.5 font-mono text-xs text-text-primary">{value}</div>
            </div>
          ))}
          <div className="ml-auto flex items-end gap-2">
            {d.requiresAuth ? (
              <Link
                href={`/contact?type=dataset-request&dataset=${d.slug}`}
                className="inline-flex items-center gap-2 rounded border border-accent bg-accent/10 px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              >
                Request access →
              </Link>
            ) : (
              <a
                href={`/data/${d.slug}.${d.formats[0]}`}
                className="inline-flex items-center gap-2 rounded border border-accent bg-accent/10 px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
              >
                Download {d.formats[0]?.toUpperCase()} ↓
              </a>
            )}
          </div>
        </div>

        {/* Auth warning */}
        {d.requiresAuth && (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-300">
              <strong>API key required.</strong> This dataset is restricted to approved
              researchers, journalists, and NGOs. Submit a request to gain access.
            </p>
          </div>
        )}

        {/* ── Formats & license ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary">
            Available formats
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.formats.map((fmt) => (
              <div
                key={fmt}
                className="rounded border border-border-subtle bg-bg-surface px-3 py-2"
              >
                <div className="font-mono text-xs font-bold text-accent">
                  {FORMAT_LABEL[fmt]}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            License:{" "}
            <a
              href={LICENSE_URL_DATA[d.license]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {LICENSE_LABEL[d.license]}
            </a>
          </p>
        </section>

        {/* ── Schema preview ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary">Schema preview</h2>
          <p className="mt-1 text-sm text-text-muted">
            First 3 columns for each available format.
          </p>
          <div className="mt-4 space-y-4">
            {d.formats.map((fmt: DatasetFormat) => {
              const cols = SCHEMA_PREVIEW[fmt];
              return (
                <div key={fmt}>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {FORMAT_LABEL[fmt]}
                  </div>
                  <div className="overflow-x-auto rounded border border-border-subtle">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border-subtle bg-bg-surface">
                          <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">
                            Column
                          </th>
                          <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cols.map((col, i) => (
                          <tr
                            key={col.name}
                            className={`border-t border-border-subtle ${
                              i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
                            }`}
                          >
                            <td className="px-3 py-2 font-mono text-[11px] text-accent">
                              {col.name}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px] text-text-muted">
                              {col.type}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Sample data ────────────────────────────────────────────────── */}
        {sample && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">
              Sample data (3 rows)
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Illustrative preview — actual values may differ.
            </p>
            <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-surface">
                    {sample.columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sample.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={`border-t border-border-subtle ${
                        ri % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"
                      }`}
                    >
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 font-mono text-[11px] text-text-secondary whitespace-nowrap"
                        >
                          {cell === null ? (
                            <span className="text-text-muted/50">null</span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Download section ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary">Download</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {d.requiresAuth ? (
              <div className="rounded border border-border-subtle bg-bg-surface p-4 text-sm text-text-secondary">
                Access to this dataset requires approval. Please{" "}
                <Link
                  href={`/contact?type=dataset-request&dataset=${d.slug}`}
                  className="text-accent hover:underline"
                >
                  submit a request
                </Link>{" "}
                with your affiliation and intended use.
              </div>
            ) : (
              d.formats.map((fmt) => (
                <a
                  key={fmt}
                  href={`/data/${d.slug}.${fmt}`}
                  className="inline-flex items-center rounded border border-border-default bg-bg-elevated px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent"
                >
                  Download {FORMAT_LABEL[fmt]} ↓
                </a>
              ))
            )}
          </div>
        </section>

        {/* ── Tags ───────────────────────────────────────────────────────── */}
        {d.tags.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Tags</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Citation guide ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary">Cite this dataset</h2>
          <p className="mt-1 text-sm text-text-muted">
            Attribution required under{" "}
            <a
              href={LICENSE_URL_DATA[d.license]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {LICENSE_LABEL[d.license]}
            </a>
            .
          </p>
          <div className="mt-4 space-y-3">
            <CitationBlock label="APA" content={apa} />
            <CitationBlock label="BibTeX" content={bibtex} />
          </div>
        </section>

        {/* ── License full text ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary">License</h2>
          <pre className="mt-3 overflow-x-auto rounded border border-border-subtle bg-bg-surface p-4 font-mono text-[11px] leading-relaxed text-text-secondary whitespace-pre-wrap">
            {licenseText}
          </pre>
        </section>

        {/* Back link */}
        <p className="text-sm">
          <Link
            href={localePath(locale, "/datasets")}
            className="text-accent hover:underline"
          >
            ← All datasets
          </Link>
        </p>
      </div>
    </>
  );
}

function CitationBlock({ label, content }: { label: string; content: string }) {
  return (
    <details className="group rounded border border-border-subtle bg-bg-surface">
      <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-text-muted group-open:text-accent">
        {label} ▸
      </summary>
      <pre className="overflow-x-auto border-t border-border-subtle px-4 py-3 font-mono text-[11px] leading-relaxed text-text-secondary whitespace-pre-wrap">
        {content}
      </pre>
    </details>
  );
}
