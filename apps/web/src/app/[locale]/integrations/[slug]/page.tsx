import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  INTEGRATIONS,
  getIntegration,
  listIntegrations,
  INTEGRATION_CATEGORY_LABEL,
} from "@/lib/integrations-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const i of INTEGRATIONS) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug: i.slug });
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
  const i = getIntegration(slug);
  if (!i) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Aegis Lens × ${i.vendor} integration`,
    description: i.description,
    pathFor: (lc) => localePath(lc, `/integrations/${i.slug}`),
  });
}

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const i = getIntegration(slug);
  if (!i) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/integrations/${i.slug}`)}`;
  const sameCategory = listIntegrations()
    .filter((x) => x.category === i.category && x.slug !== i.slug)
    .slice(0, 6);

  const statusLine =
    i.status === "ready"
      ? "Live today."
      : i.status === "beta"
        ? "In beta — early adopters welcome via /contact."
        : "On the roadmap — express interest via /contact and we'll prioritise.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `Aegis Lens × ${i.vendor}`,
        applicationCategory: INTEGRATION_CATEGORY_LABEL[i.category],
        description: i.description,
        operatingSystem: "Web",
        url: pageUrl,
      },
      {
        "@type": "HowTo",
        name: `Connect Aegis Lens to ${i.vendor}`,
        description: i.description,
        step: i.steps.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          text: s,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Integrations",
            item: `${SITE.url}${urls.integrations(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: i.vendor },
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
          <Link href={urls.integrations(locale)} className="hover:text-text-primary">
            Integrations
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{i.vendor}</span>
        </nav>

        <PageHeader
          eyebrow={INTEGRATION_CATEGORY_LABEL[i.category]}
          title={`Aegis Lens × ${i.vendor}`}
          description={i.description}
        />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider">
          <span
            className={
              i.status === "ready"
                ? "text-green-300"
                : i.status === "beta"
                  ? "text-yellow-200"
                  : "text-text-muted"
            }
          >
            {i.status}
          </span>
          <span className="text-text-muted">— {statusLine}</span>
        </div>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Use cases</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-secondary">
            {i.useCases.map((u, idx) => (
              <li key={idx}>{u}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Setup</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
            {i.steps.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </section>

        {i.requires.length > 0 && (
          <section className="mt-8 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Requires
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
              {i.requires.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {i.tags.map((t) => (
            <Link
              key={t}
              href={urls.tag(locale, t)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>

        {sameCategory.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other {INTEGRATION_CATEGORY_LABEL[i.category]} integrations
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {sameCategory.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.integration(locale, s.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {s.vendor}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Most integrations are driven by{" "}
          <Link href={urls.alerts(locale)} className="text-accent hover:underline">
            /alerts subscriptions
          </Link>{" "}
          and the{" "}
          <Link href={urls.cookbook(locale)} className="text-accent hover:underline">
            API cookbook
          </Link>
          .
        </p>
      </article>
    </>
  );
}
