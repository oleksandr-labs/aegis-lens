import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  CASE_STUDIES,
  getCaseStudy,
  listCaseStudies,
} from "@/lib/case-studies-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const c of CASE_STUDIES) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: c.slug });
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
  const c = getCaseStudy(slug);
  if (!c) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${c.client} — Aegis Lens case study`,
    description: c.oneLiner,
    pathFor: (lc) => localePath(lc, `/case-studies/${c.slug}`),
  });
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/case-studies/${c.slug}`)}`;
  const related = listCaseStudies()
    .filter((x) => x.slug !== c.slug && (x.industry === c.industry || x.region === c.region))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${c.client} — Aegis Lens case study`,
        description: c.oneLiner,
        datePublished: c.publishedAt,
        keywords: c.tags.join(", "),
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        about: { "@type": "Thing", name: c.industry },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Case studies",
            item: `${SITE.url}${urls.caseStudies(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: c.client },
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
          <Link href={urls.caseStudies(locale)} className="hover:text-text-primary">
            Case studies
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{c.client}</span>
        </nav>

        <PageHeader eyebrow={`${c.industry} · ${c.region}`} title={c.client} description={c.oneLiner} />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <Link
              key={t}
              href={urls.tag(locale, t)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Challenge</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{c.challenge}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Solution</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{c.solution}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Outcome</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{c.outcome}</p>
        </section>

        {c.metrics.length > 0 && (
          <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {c.metrics.map((m, i) => (
              <div key={i} className="rounded border border-border-subtle bg-bg-surface p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {m.label}
                </div>
                <div className="mt-1 text-lg font-semibold text-accent">{m.value}</div>
              </div>
            ))}
          </section>
        )}

        {c.quote && (
          <blockquote className="mt-10 rounded border-l-4 border-accent bg-bg-surface p-4">
            <p className="text-base italic text-text-primary">"{c.quote.text}"</p>
            <footer className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              — {c.quote.attribution}
            </footer>
          </blockquote>
        )}

        <section className="mt-10 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Aegis Lens surfaces in use
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {c.surfaces.map((s) => (
              <li
                key={s}
                className="rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-text-secondary"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Related case studies</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.caseStudy(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{r.client}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {r.industry} · {r.region}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          See pricing at{" "}
          <Link href={urls.pricing(locale)} className="text-accent hover:underline">
            /pricing
          </Link>{" "}
          or reach the team via{" "}
          <Link href={urls.contact(locale)} className="text-accent hover:underline">
            /contact
          </Link>
          .
        </p>
      </article>
    </>
  );
}
