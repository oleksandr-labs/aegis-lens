import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  METHODOLOGY_TOPICS,
  getMethodologyTopic,
  listMethodologyTopics,
} from "@/lib/methodology-topics";
import { SITE } from "@/lib/site";

type Params = { locale: string; topic: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const t of METHODOLOGY_TOPICS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, topic: t.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, topic } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getMethodologyTopic(topic);
  if (!t) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${t.title} — Aegis Lens methodology`,
    description: t.oneLiner,
    pathFor: (lc) => localePath(lc, `/methodology/${t.slug}`),
  });
}

export default async function MethodologyTopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, topic } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getMethodologyTopic(topic);
  if (!t) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/methodology/${t.slug}`)}`;
  const others = listMethodologyTopics().filter((x) => x.slug !== t.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: t.title,
        description: t.oneLiner,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        keywords: t.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Methodology",
            item: `${SITE.url}${urls.methodology(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: t.title },
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
          <Link href={urls.methodology(locale)} className="hover:text-text-primary">
            Methodology
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{t.title}</span>
        </nav>

        <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.oneLiner} />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <Link
              key={tag}
              href={urls.tag(locale, tag)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        {t.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{s.body}</p>
          </section>
        ))}

        {t.limitations.length > 0 && (
          <section className="mt-10 rounded border border-yellow-500/40 bg-yellow-500/5 p-4">
            <h2 className="text-base font-semibold text-text-primary">Limitations</h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-yellow-200">
              What this approach does not do
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
              {t.limitations.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </section>
        )}

        {t.versionHistory.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Version history</h2>
            <ol className="mt-3 space-y-2">
              {t.versionHistory.map((v) => (
                <li
                  key={v.version}
                  className="rounded border border-border-subtle bg-bg-surface p-3"
                >
                  <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span className="text-accent">{v.version}</span>
                    <span>{v.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{v.change}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {t.seeAlso.length > 0 && (
          <section className="mt-10 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              See also
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {t.seeAlso.map((s, i) => (
                <li key={i}>
                  <Link
                    href={localePath(locale, s.href)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {others.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other topics</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={urls.methodologyTopic(locale, o.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{o.title}</div>
                    <p className="mt-1 text-xs text-text-secondary">{o.oneLiner}</p>
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
