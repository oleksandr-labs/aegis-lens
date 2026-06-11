import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { COMPETITORS as SEED_COMPETITORS, getCompetitor } from "@/lib/competitors-seed";
import { getCompetitorData, getVerdict, getAegisWhy } from "@/lib/competitors-data";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const c of SEED_COMPETITORS) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: c.slug });
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
  const c = getCompetitor(slug);
  if (!c) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Aegis Lens vs ${c.name}`,
    description: `A detailed comparison of Aegis Lens and ${c.name} for conflict intelligence, OSINT analysis, and real-time monitoring.`,
    pathFor: (lc) => localePath(lc, `/vs/${slug}`),
  });
}

export default async function VsPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = getCompetitor(slug);
  if (!c) notFound();

  // Supplementary data from competitors-data.ts (feature rows with aegis/competitor fields)
  const extra = getCompetitorData(slug);
  const verdict = getVerdict(slug);
  const aegisWhy = getAegisWhy(slug);

  const pageUrl = `${SITE.url}${localePath(locale, `/vs/${slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Aegis Lens vs ${c.name}`,
        description: `A detailed comparison of Aegis Lens and ${c.name} for conflict intelligence, OSINT analysis, and real-time monitoring.`,
        url: pageUrl,
        inLanguage: locale,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        about: [
          { "@type": "SoftwareApplication", name: SITE.name },
          { "@type": "SoftwareApplication", name: c.name, url: c.homepageUrl },
        ],
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Comparisons", item: `${SITE.url}${localePath(locale, "/vs")}` },
          { "@type": "ListItem", position: 3, name: `vs ${c.name}` },
        ],
      },
      c.faq.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: c.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }
        : null,
    ].filter(Boolean),
  };

  const others = SEED_COMPETITORS.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Comparison"
        title={`Aegis Lens vs ${c.name}`}
        description={`A detailed comparison of Aegis Lens and ${c.name} for conflict intelligence, OSINT analysis, and real-time monitoring.`}
      />

      <article className="mx-auto max-w-4xl px-4 py-10 space-y-12">

        {/* Verdict bar */}
        <div className="rounded border border-accent/20 bg-accent/5 p-4 text-sm text-text-secondary">
          <strong className="text-text-primary">Bottom line:</strong>{" "}
          {verdict}
        </div>

        {/* What they are */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary">What is {c.name}?</h2>
          <p className="mt-3 text-text-secondary">{c.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-muted font-mono">
            {extra && (
              <>
                <span>Founded: <span className="text-text-secondary">{extra.founded}</span></span>
                <span>Pricing: <span className="text-text-secondary">{extra.pricing}</span></span>
                <span>Audience: <span className="text-text-secondary">{extra.targetAudience}</span></span>
              </>
            )}
            <span>Category: <span className="text-text-secondary">{c.category}</span></span>
          </div>
          <p className="mt-2">
            <a
              href={c.homepageUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-mono text-xs text-accent hover:underline"
            >
              {c.homepageUrl} ↗
            </a>
          </p>
        </section>

        {/* Feature comparison table — from competitors-data.ts if available, else seed */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Feature comparison</h2>
          <p className="mt-1 text-sm text-text-muted">
            Based on publicly documented capabilities as of June 2026. We update this when things change.
          </p>
          <div className="mt-4 overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-accent"
                  >
                    {SITE.name}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    {c.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {extra
                  ? extra.features.map((row, i) => (
                      <tr
                        key={row.feature}
                        className={`border-t border-border-subtle ${i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"}`}
                      >
                        <td className="px-4 py-2.5 text-text-secondary">{row.feature}</td>
                        <td className="px-4 py-2.5 text-center">
                          <Cell value={row.aegis} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Cell value={row.competitor} />
                        </td>
                      </tr>
                    ))
                  : c.comparisonTable.map((row, i) => (
                      <tr
                        key={row.feature}
                        className={`border-t border-border-subtle ${i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"}`}
                      >
                        <td className="px-4 py-2.5 text-text-secondary">{row.feature}</td>
                        <td className="px-4 py-2.5 text-center">
                          <Cell value={row.aegis} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Cell value={row.them} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            See an error?{" "}
            <a
              href={`mailto:hello@aegislens.io?subject=Comparison correction: ${c.name}`}
              className="text-accent hover:underline"
            >
              Let us know
            </a>
            .
          </p>
        </section>

        {/* Strengths and weaknesses grid */}
        {extra && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-8">
            <div className="rounded border border-accent/30 bg-accent/5 p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                Why choose Aegis Lens
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {aegisWhy.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-0.5 text-accent shrink-0">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
                When {c.name} might be better
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {extra.strengths.slice(0, 2).map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-0.5 text-text-muted shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* When to choose (seed data fallback / supplementary) */}
        {!extra && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                When to choose {c.name}
              </p>
              <p className="text-sm text-text-secondary">{c.whenToChooseThem}</p>
            </div>
            <div className="rounded border border-accent/40 bg-accent/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                When to choose {SITE.name}
              </p>
              <p className="text-sm text-text-secondary">{c.whenToChooseUs}</p>
            </div>
          </section>
        )}

        {/* FAQ */}
        {c.faq.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-text-primary">Frequently asked questions</h2>
            <div className="mt-4 space-y-3">
              {c.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded border border-border-subtle bg-bg-surface p-4"
                >
                  <summary className="cursor-pointer font-medium text-text-primary group-open:text-accent">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm text-text-secondary">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded border border-border-subtle bg-bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary">Try Aegis Lens free</h2>
          <p className="mt-2 text-sm text-text-secondary">
            No credit card. Full API access on the free tier. Switch any time.
          </p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <Link
              href={localePath(locale, "/signup")}
              className="rounded bg-accent px-5 py-2 font-mono text-sm text-bg-base hover:bg-accent/90"
            >
              Try Aegis Lens free →
            </Link>
            <Link
              href={localePath(locale, "/contact")}
              className="rounded border border-border-default px-5 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
            >
              Talk to sales
            </Link>
          </div>
        </section>

        {/* Internal links */}
        <div className="text-center">
          <Link
            href={localePath(locale, "/vs")}
            className="font-mono text-xs text-accent hover:underline"
          >
            ← Compare all alternatives
          </Link>
        </div>

        {/* Other comparisons */}
        {others.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-text-primary">Other comparisons</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={localePath(locale, `/vs/${o.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    vs {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <span className="text-accent" aria-label="Yes">✓</span>;
  }
  if (value === false) {
    return <span className="text-red-400" aria-label="No">✗</span>;
  }
  return <span className="font-mono text-[11px] text-text-secondary">{value}</span>;
}
