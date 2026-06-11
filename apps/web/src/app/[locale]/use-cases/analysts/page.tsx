import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listTasksFor } from "@/lib/use-case-tasks";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens for intelligence analysts";
const DESCRIPTION =
  "Geolocation workflows, anomaly detection, API-first data access, and investigation tooling for OSINT researchers, intelligence analysts, and data teams.";

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
    pathFor: (lc) => localePath(lc, "/use-cases/analysts"),
  });
}

const USE_CASES = [
  {
    name: "Geolocation",
    body: "Pin-point conflict media to within 50 m using landmark matching, shadow analysis, and Sentinel-2 cross-reference — with a documented precision class on every result.",
  },
  {
    name: "Anomaly detection",
    body: "Surface unusual spikes in event frequency, geographic displacement, or class-composition shifts before they become obvious — rolling baselines and automated 2σ alerts.",
  },
  {
    name: "API integration",
    body: "Pull verified events into Jupyter notebooks, SIEM dashboards, or bespoke visualisations via a versioned REST API with stable IDs, full source URLs, and confidence scores.",
  },
  {
    name: "Investigation tooling",
    body: "Cross-link events to entity profiles, equipment types, and glossary terms. Export structured JSON for citation in long-form investigations with DOI-level data provenance.",
  },
];

const FEATURES = [
  {
    name: "REST API",
    body: "GET /v1/events with min_confidence, class, region, and time filters. Streaming endpoint for realtime ingestion. Stable ULIDs and full revision history.",
  },
  {
    name: "Datasets",
    body: "Full corpus downloads in JSON, CSV, GeoJSON, and Parquet — CC-BY-4.0 licensed, versioned, with field-level documentation and APA/BibTeX citation snippets.",
  },
  {
    name: "Entities KG",
    body: "Named entities (equipment, organisations, conflicts, glossary terms) linked to events. Machine-readable JSON-LD suitable for graph ingestion.",
  },
];

export default async function AnalystsVerticalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const tasks = listTasksFor("analysts");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/use-cases/analysts")}`,
    inLanguage: locale,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Use cases", item: `${SITE.url}${localePath(locale, "/use-cases")}` },
        { "@type": "ListItem", position: 2, name: "Intelligence analysts", item: `${SITE.url}${localePath(locale, "/use-cases/analysts")}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow="Use cases · Analysts" title={TITLE} description={DESCRIPTION} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <p className="text-text-secondary">
            Intelligence analysts and OSINT researchers need data they can cite, replicate, and
            trace to source. Aegis Lens is built API-first precisely for this workflow: every event
            has a stable identifier, a tier-weighted confidence score, and a full source-URL chain
            that survives citation. Download the corpus, build on the API, or use the map as a
            visual layer over your own data.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Where it fits</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {USE_CASES.map((u) => (
              <li key={u.name} className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{u.name}</p>
                <p className="mt-2 text-sm text-text-secondary">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {tasks.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-text-primary">Step-by-step workflows</h2>
            <ul className="mt-4 space-y-3">
              {tasks.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={localePath(locale, `/use-cases/analysts/${t.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated"
                  >
                    <p className="font-semibold text-text-primary">{t.title}</p>
                    <p className="mt-1 text-sm text-text-secondary">{t.problem}</p>
                    <p className="mt-2 font-mono text-[10px] text-accent">Read workflow →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Product highlights</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.name} className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{f.name}</p>
                <p className="mt-2 text-sm text-text-secondary">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Next step</h2>
          <p className="mt-3 text-text-secondary">
            Generate an API key and pull your first events in under five minutes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, "/docs/getting-started")}
              className="inline-block rounded border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base"
            >
              Quickstart guide
            </Link>
            <Link
              href={localePath(locale, "/datasets")}
              className="inline-block rounded border border-border-default px-4 py-2 font-mono text-sm text-text-primary hover:border-accent hover:text-accent"
            >
              Download datasets
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
