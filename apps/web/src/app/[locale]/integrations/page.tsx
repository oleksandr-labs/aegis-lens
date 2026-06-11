import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  listIntegrations,
  INTEGRATION_CATEGORY_LABEL,
  type IntegrationCategory,
} from "@/lib/integrations-seed";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Integrations";
const DESCRIPTION =
  "Wire Aegis Lens into the tools your team already uses — Slack, Teams, Telegram, SIEMs, BI, CRM, and developer automation. Setup guides for each.";

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  ready: {
    cls: "border-green-500/40 bg-green-500/10 text-green-300",
    label: "ready",
  },
  beta: {
    cls: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
    label: "beta",
  },
  planned: {
    cls: "border-border-subtle bg-bg-elevated text-text-muted",
    label: "planned",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/integrations"),
  });
}

export default async function IntegrationsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const all = listIntegrations();

  // Bucket by category.
  const byCategory = new Map<IntegrationCategory, typeof all>();
  for (const i of all) {
    const arr = byCategory.get(i.category) ?? [];
    arr.push(i);
    byCategory.set(i.category, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/integrations")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: all.length,
      itemListElement: all.map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/integrations/${i.slug}`)}`,
        name: i.vendor,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Connect" title={TITLE} description={DESCRIPTION} />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="space-y-10">
          {[...byCategory.entries()].map(([cat, arr]) => (
            <div key={cat}>
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {INTEGRATION_CATEGORY_LABEL[cat]} ({arr.length})
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {arr.map((i) => {
                  const badge = STATUS_BADGE[i.status];
                  return (
                    <li key={i.slug}>
                      <Link
                        href={urls.integration(locale, i.slug)}
                        className="block h-full rounded border border-border-subtle bg-bg-surface p-3 hover:bg-bg-elevated"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-text-primary">{i.vendor}</span>
                          <span
                            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                          {i.description}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-text-muted">
          Don't see what you need? Every alert subscription supports a{" "}
          <Link
            href={urls.integration(locale, "webhook")}
            className="text-accent hover:underline"
          >
            generic webhook destination
          </Link>{" "}
          — pair it with{" "}
          <Link href={urls.cookbook(locale)} className="text-accent hover:underline">
            the API cookbook
          </Link>{" "}
          to wire any tool that accepts JSON.
        </p>
      </section>
    </>
  );
}
