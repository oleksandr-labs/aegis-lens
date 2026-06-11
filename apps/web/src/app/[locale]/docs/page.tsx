import type { Metadata } from "next";
import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Aegis Lens Developer Docs",
    description:
      "Everything you need to build with the Aegis Lens API, from getting started to advanced integrations.",
    pathFor: (lc) => urls.docs(lc),
  });
}

type SectionItem = { label: string; href: string };
type Section = { title: string; icon: string; items: SectionItem[] };

const SECTIONS: Section[] = [
  {
    title: "Getting Started",
    icon: "🚀",
    items: [
      { label: "Quick Start Guide", href: "/docs/getting-started" },
      { label: "Authentication", href: "/docs/getting-started#auth" },
      { label: "First API call", href: "/docs/getting-started#first-call" },
    ],
  },
  {
    title: "Core Concepts",
    icon: "🧠",
    items: [
      { label: "Event schema", href: "/docs/schema" },
      { label: "Confidence scoring", href: "/docs/confidence" },
      { label: "Danger scoring", href: "/scoring/danger" },
      { label: "Verification states", href: "/docs/concepts#verification" },
    ],
  },
  {
    title: "API Reference",
    icon: "⚡",
    items: [
      { label: "REST API overview", href: "/docs/api" },
      { label: "Interactive Explorer", href: "/docs/api/explorer" },
      { label: "Rate limits", href: "/docs/rate-limits" },
      { label: "Error codes", href: "/docs/errors" },
    ],
  },
  {
    title: "Integrations",
    icon: "🔌",
    items: [
      { label: "Webhooks", href: "/docs/webhooks" },
      { label: "TypeScript SDK", href: "/docs/sdks#typescript" },
      { label: "Python SDK", href: "/docs/sdks#python" },
      { label: "Go SDK", href: "/docs/sdks#go" },
    ],
  },
  {
    title: "Guides",
    icon: "📖",
    items: [
      { label: "OSINT Workflow Guide", href: "/docs/osint-guide" },
      { label: "Embed the map", href: "/embed/builder" },
      { label: "Filter DSL reference", href: "/docs/concepts#filter-dsl" },
    ],
  },
  {
    title: "Reference",
    icon: "📚",
    items: [
      { label: "Schema registry", href: "/docs/schema" },
      { label: "API changelog", href: "/changelog" },
      { label: "SDK changelog", href: "/docs/sdks#changelog" },
    ],
  },
];

const FEATURED_ARTICLES = [
  {
    icon: "⚡",
    title: "Make your first API call in 60 seconds",
    description:
      "Authenticate with a bearer token and pull live events from the Ukraine feed with a single curl command.",
    href: "/docs/getting-started#first-call",
  },
  {
    icon: "🎯",
    title: "Understanding confidence vs danger",
    description:
      "These two scores answer different questions. Learn how to filter on each and avoid the most common misinterpretation.",
    href: "/docs/confidence",
  },
  {
    icon: "🔌",
    title: "Receive events via webhook",
    description:
      "Push verified intelligence events into your own systems in real time with signed HTTP deliveries.",
    href: "/docs/webhooks",
  },
];

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Aegis Lens Developer Docs",
    description:
      "Everything you need to build with the Aegis Lens API, from getting started to advanced integrations.",
    inLanguage: locale,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: SECTIONS.reduce((n, s) => n + s.items.length, 0),
      itemListElement: SECTIONS.flatMap((section, si) =>
        section.items.map((item, ii) => ({
          "@type": "ListItem",
          position: si * 10 + ii + 1,
          name: item.label,
          url: `https://aegislens.io${localePath(locale, item.href)}`,
        })),
      ),
    },
  };

  return (
    <>
      <PageHeader
        eyebrow="Documentation"
        title="Aegis Lens Developer Docs"
        description="Everything you need to build with the Aegis Lens API, from getting started to advanced integrations."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Quick-start CTA bar */}
      <div className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-4 pb-6">
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, "/docs/getting-started")}
              className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black"
            >
              Quick start →
            </Link>
            <Link
              href={localePath(locale, "/docs/api/explorer")}
              className="rounded border border-border-default px-4 py-2 text-sm text-text-primary"
            >
              API Explorer
            </Link>
            <Link
              href={localePath(locale, "/docs/sdks")}
              className="rounded border border-border-default px-4 py-2 text-sm text-text-primary"
            >
              SDKs
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Sections grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="rounded border border-border-subtle bg-bg-surface p-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">{section.icon}</span>
                <h2 className="text-sm font-semibold text-text-primary">{section.title}</h2>
              </div>
              <ul className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={localePath(locale, item.href)}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular articles */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-text-primary">Popular articles</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {FEATURED_ARTICLES.map((article) => (
              <Link
                key={article.title}
                href={localePath(locale, article.href)}
                className="group rounded border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-border-default"
              >
                <span className="text-2xl leading-none">{article.icon}</span>
                <h3 className="mt-3 text-sm font-semibold text-text-primary group-hover:text-accent">
                  {article.title}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">{article.description}</p>
                <span className="mt-3 inline-block text-xs text-accent">Read →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
