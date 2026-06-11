import Link from "next/link";
import { urls } from "@aegis/url-builder";
import type { Locale } from "@aegis/i18n-config";
import { PageHeader } from "@/components/PageHeader";
import { getIndustry, listIndustries } from "@/lib/industries";
import { LENSES, type LensKey } from "@/lib/x-for-y";
import { SITE } from "@/lib/site";

type Props = {
  lensKey: LensKey;
  industrySlug: string;
  locale: Locale;
};

export function XForYPage({ lensKey, industrySlug, locale }: Props) {
  const lens = LENSES[lensKey];
  const ind = getIndustry(industrySlug);
  if (!ind) return null;

  const title = `${lens.label} for ${ind.label}`;
  const description = `${lens.intro} Applied to ${ind.label}: featured tools, featured companies, applications, and FAQ from the Aegis Lens catalogue.`;
  const pageUrl = `${SITE.url}${lens.routePrefix}/${ind.slug}`;
  const localizedUrl =
    locale === "en" ? pageUrl : `${SITE.url}/${locale}${lens.routePrefix}/${ind.slug}`;

  const applications = lens.applications(ind.label);
  const faqs = lens.faqs(ind.label);
  const featuredCompanies = ind.companies.slice(0, 4);
  const featuredTools = ind.tools.slice(0, 6);
  const otherIndustries = listIndustries()
    .filter((x) => x.slug !== ind.slug)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        url: localizedUrl,
        mainEntityOfPage: localizedUrl,
        inLanguage: locale,
        keywords: [lens.label, ind.label, "directory", "OSINT"].join(", "),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Industries",
            item: `${SITE.url}${urls.industries(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: ind.label,
            item: `${SITE.url}${urls.industry(locale, ind.slug)}`,
          },
          { "@type": "ListItem", position: 3, name: title },
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

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.industries(locale)} className="hover:text-text-primary">
            Industries
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.industry(locale, ind.slug)} className="hover:text-text-primary">
            {ind.label}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{lens.label} applied</span>
        </nav>

        <PageHeader eyebrow={`${lens.label} × ${ind.label}`} title={title} description={description} />

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            The problem
          </div>
          <p className="mt-2 text-sm text-text-secondary">{lens.problem(ind.label)}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Applications</h2>
          <ul className="mt-3 space-y-2">
            {applications.map((a, i) => (
              <li
                key={i}
                className="flex gap-3 rounded border border-border-subtle bg-bg-surface p-3 text-sm text-text-secondary"
              >
                <span className="font-mono text-[10px] text-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>

        {featuredTools.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Featured {ind.label} tools
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {featuredTools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={urls.toolDetail(locale, t.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{t.name}</div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">{t.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider">
              <Link
                href={urls.topToolsForIndustry(locale, ind.slug)}
                className="text-accent hover:underline"
              >
                Top {ind.label} tools →
              </Link>
            </p>
          </section>
        )}

        {featuredCompanies.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Featured {ind.label} companies
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {featuredCompanies.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={urls.companyDetail(locale, c.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{c.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">{c.region}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">{c.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">FAQ</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded border border-border-subtle bg-bg-surface p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {otherIndustries.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              {lens.label} for other industries
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherIndustries.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`${
                      locale === "en"
                        ? lens.routePrefix
                        : `/${locale}${lens.routePrefix}`
                    }/${r.slug}`}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {lens.label} for {r.label}
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
